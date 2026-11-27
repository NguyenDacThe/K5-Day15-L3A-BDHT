import json
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient
from httpx import Request, Response
from openai import APITimeoutError, RateLimitError

from app import app
from eval.run_eval import call_case, load_answer
from src.d1.contracts import ComplaintRequest, DemandKind, IssueType, TriageResult
from src.d1.service import _load_local_config, handle_complaint


MISSING_ITEM = {"order_id": "D1-001", "message": "Mình nhận đơn rồi nhưng thiếu một phần khoai."}


class ComplaintIntegrationTest(unittest.TestCase):
    def setUp(self):
        env = patch.dict(os.environ, {
            "AI_MODE": "live",
            "OPENAI_API_KEY": "fake-key",
            "OPENAI_MODEL": "gpt-4o-mini",
        })
        env.start()
        self.addCleanup(env.stop)
        client_patch = patch("src.d1.agent.OpenAI", autospec=True)
        self.openai = client_patch.start()
        self.addCleanup(client_patch.stop)
        self.parse = self.openai.return_value.__enter__.return_value.responses.parse
        self.api = TestClient(app)
        self.addCleanup(self.api.close)
        self.answer, self.tracing = load_answer()

    def set_model_response(self, demand=DemandKind.NONE):
        self.parse.return_value = SimpleNamespace(
            status="completed",
            output_parsed=TriageResult(issue_type=IssueType.MISSING_ITEM, item_hint="khoai", demand_kind=demand),
            model="gpt-4o-mini-2024-07-18",
            usage=SimpleNamespace(input_tokens=117, output_tokens=21),
        )

    def run_case(self, data):
        text = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False)
        return call_case(self.answer, self.tracing, "B01", text)

    def test_live_api_and_runner_share_rules_and_measured_usage(self):
        self.set_model_response()
        row, events = self.run_case(MISSING_ITEM)
        self.parse.assert_called_once()
        model_event, = events
        self.assertEqual(
            (row["model"], row["model_calls"], row["tokens_in"], row["tokens_out"], row["error"]),
            ("gpt-4o-mini-2024-07-18", 1, 117, 21, ""),
        )
        self.assertEqual(set(model_event), {"kind", "name", "model", "tokens_in", "tokens_out", "latency_s", "t"})
        self.assertEqual((model_event["kind"], model_event["name"]), ("model", "classify_live"))
        response = self.api.post("/api/complaints", json=MISSING_ITEM)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.parse.call_count, 2)
        body = response.json()
        self.assertEqual(body, json.loads(row["output"]))
        self.assertEqual(body["decision"], "PROPOSE_REFUND")
        self.assertEqual(body["proposed_amount_vnd"], 35000)
        self.assertEqual(body["policy_ref"], {"rule_id": "D1-MISSING", "version": "demo-1", "kind": "demo"})
        self.assertEqual(body["meta"], {"mode": "live", "ai_used": True})

    def test_full_order_refund_is_escalated(self):
        self.set_model_response(DemandKind.FULL_ORDER)
        request = {**MISSING_ITEM, "message": "Thiếu khoai chiên nên mình muốn hoàn cả đơn."}
        row, _ = self.run_case(request)
        self.parse.assert_called_once()
        body = json.loads(row["output"])
        self.assertEqual((body["decision"], body["reason_code"], body["proposed_amount_vnd"]),
                         ("ESCALATE", "AMOUNT_EXCEEDS_LIMIT", 0))

    def test_early_rules_do_not_call_openai(self):
        cases = (
            ({"message": "Đơn thiếu khoai"}, "ASK_INFO", "ORDER_ID_REQUIRED"),
            ({"order_id": "D1-999", "message": "Đơn thiếu khoai"}, "ASK_INFO", "ORDER_NOT_FOUND"),
            ({"order_id": "D1-001", "message": "Cho mình xin số điện thoại của tài xế"}, "REFUSE", "REQUEST_OUT_OF_SCOPE"),
        )
        for request, expected_decision, expected_reason in cases:
            with self.subTest(reason=expected_reason):
                body = self.api.post("/api/complaints", json=request).json()
                self.assertEqual((body["decision"], body["reason_code"]), (expected_decision, expected_reason))
                self.assertEqual(body["meta"], {"mode": "live", "ai_used": False})
        row, events = self.run_case("Đơn thiếu khoai")
        self.assertEqual(json.loads(row["output"])["reason_code"], "ORDER_ID_REQUIRED")
        self.assertEqual(row["model_calls"], 0)
        self.assertEqual(events, [])
        self.openai.assert_not_called()

    def test_model_error_yields_safe_response_and_internal_error_code(self):
        request = Request("POST", "https://api.openai.com/v1/responses")
        private_detail = "private SDK detail with fake-key"
        for error in (APITimeoutError(request=request),
                      RateLimitError(private_detail, response=Response(429, request=request), body=private_detail)):
            with self.subTest(error=type(error).__name__):
                self.parse.reset_mock(side_effect=True)
                self.parse.side_effect = error
                row, events = self.run_case(MISSING_ITEM)
                self.parse.assert_called_once()
                api_response = self.api.post("/api/complaints", json=MISSING_ITEM)
                self.assertEqual(api_response.status_code, 200)
                body = api_response.json()
                self.assertEqual(body, json.loads(row["output"]))
                self.assertEqual((body["decision"], body["reason_code"], body["proposed_amount_vnd"]),
                                 ("ESCALATE", "MODEL_UNAVAILABLE", 0))
                self.assertEqual(body["meta"], {"mode": "live", "ai_used": False})
                self.assertNotIn(private_detail, api_response.text)
                self.assertNotIn(private_detail, repr(events))
                self.assertEqual(row["model_calls"], 0)
                note, = events
                self.assertEqual((note["kind"], note["text"]), ("note", "MODEL_UNAVAILABLE"))
                _, meta = handle_complaint(ComplaintRequest.model_validate(MISSING_ITEM))
                self.assertFalse(meta.ai_used)
                self.assertEqual(meta.error_code, "MODEL_UNAVAILABLE")

    def test_missing_usage_is_null_in_trace_and_zero_in_runner(self):
        self.set_model_response()
        self.parse.return_value.usage = SimpleNamespace(input_tokens=117)
        row, events = self.run_case(MISSING_ITEM)
        model_event, = events
        self.assertIsNone(model_event["tokens_out"])
        self.assertEqual((row["model_calls"], row["tokens_in"], row["tokens_out"]), (1, 117, 0))

    def test_default_mock_works_without_key_and_leaves_no_model_event(self):
        with patch.dict(os.environ, {}, clear=True):
            row, events = self.run_case(MISSING_ITEM)
        body = json.loads(row["output"])
        self.assertEqual((body["decision"], body["proposed_amount_vnd"]), ("PROPOSE_REFUND", 35000))
        self.assertEqual(body["meta"], {"mode": "mock", "ai_used": False})
        self.assertEqual(row["model_calls"], 0)
        self.assertEqual(events, [])
        self.openai.assert_not_called()

    def test_health_and_invalid_http_request(self):
        response = self.api.get("/api/health")
        self.assertEqual((response.status_code, response.json()), (200, {"status": "ok"}))
        response = self.api.post("/api/complaints", json={"message": ""})
        self.assertEqual(response.status_code, 422)
        self.openai.assert_not_called()

    def test_invalid_runner_input_does_not_echo_text(self):
        row, events = self.run_case('{"private-note"')
        self.assertEqual(row["error"], "ValueError: Yêu cầu khiếu nại không hợp lệ.")
        self.assertEqual(events, [])
        self.openai.assert_not_called()

    def test_local_config_uses_environment_overrides(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / ".env"
            path.write_text('AI_MODE=mock\nOPENAI_MODEL="gpt-4o-mini"\nOPENAI_API_KEY=fake-key\n', encoding="utf-8")
            with patch.dict(os.environ, {"AI_MODE": "live"}, clear=True):
                _load_local_config(path)
                self.assertEqual(os.environ["AI_MODE"], "live")
                self.assertEqual(os.environ["OPENAI_MODEL"], "gpt-4o-mini")
                self.assertEqual(os.environ["OPENAI_API_KEY"], "fake-key")
