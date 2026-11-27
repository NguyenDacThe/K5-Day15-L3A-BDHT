import os
import unicodedata
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from httpx import Request, Response
from openai import APITimeoutError, AuthenticationError, PermissionDeniedError, RateLimitError
from pydantic import ValidationError

from src.d1.agent import classify_live, classify_mock
from src.d1.contracts import DemandKind, IssueType, ModelUnavailable, TriageResult


class LiveTriageTest(unittest.TestCase):
    def setUp(self):
        env_patch = patch.dict(os.environ, {"OPENAI_API_KEY": "test-key", "OPENAI_MODEL": "gpt-4o-mini"})
        env_patch.start()
        self.addCleanup(env_patch.stop)
        client_patch = patch("src.d1.agent.OpenAI", autospec=True)
        self.openai = client_patch.start()
        self.addCleanup(client_patch.stop)
        self.parse = self.openai.return_value.__enter__.return_value.responses.parse

    def set_response(self, issue_type, item_hint=None, demand_kind=DemandKind.NONE, **metadata):
        self.parse.return_value = SimpleNamespace(
            output_parsed=TriageResult(issue_type=issue_type, item_hint=item_hint, demand_kind=demand_kind),
            **metadata,
        )

    def test_mock_stays_offline_without_key(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "", "OPENAI_MODEL": ""}):
            triage = classify_mock("Đơn mình thiếu một phần khoai.")
        self.assertEqual(triage.item_hint, "khoai")
        self.openai.assert_not_called()

    def test_success_returns_structured_triage_and_reported_usage(self):
        message = "Đơn mình thiếu một phần khoai."
        self.set_response(
            IssueType.MISSING_ITEM,
            "khoai",
            model="gpt-4o-mini-2024-07-18",
            usage=SimpleNamespace(input_tokens=87, output_tokens=18),
            status="completed",
        )
        with patch("src.d1.agent.perf_counter", side_effect=[10.0, 10.125]):
            triage, meta = classify_live(message)

        self.assertEqual(
            triage,
            TriageResult(issue_type=IssueType.MISSING_ITEM, item_hint="khoai", demand_kind=DemandKind.NONE),
        )
        self.assertEqual(
            meta.model_dump(),
            {
                "mode": "live",
                "ai_used": True,
                "model": "gpt-4o-mini-2024-07-18",
                "tokens_in": 87,
                "tokens_out": 18,
                "latency_ms": 125.0,
                "error_code": None,
            },
        )
        self.openai.assert_called_once_with(api_key="test-key", timeout=10.0, max_retries=0)
        self.parse.assert_called_once()
        arguments = self.parse.call_args.kwargs
        self.assertIs(arguments["text_format"], TriageResult)
        self.assertEqual(arguments["model"], "gpt-4o-mini")
        self.assertEqual(arguments["input"], [{"role": "user", "content": message}])
        self.assertNotIn(message, arguments["instructions"])
        self.assertFalse(arguments["store"])

    def test_missing_telemetry_uses_configured_model_and_optional_tokens(self):
        for metadata, expected_output in (
            ({}, None),
            ({"model": "", "usage": SimpleNamespace(output_tokens=0)}, 0),
        ):
            with self.subTest(metadata=metadata):
                self.set_response(IssueType.LATE_DELIVERY, **metadata)
                triage, meta = classify_live("Đơn giao trễ 35 phút.")
                self.assertEqual(triage.issue_type, IssueType.LATE_DELIVERY)
                self.assertIsNone(triage.item_hint)
                self.assertEqual(meta.model, "gpt-4o-mini")
                self.assertIsNone(meta.tokens_in)
                self.assertEqual(meta.tokens_out, expected_output)

    def test_missing_configuration_does_not_create_client(self):
        for empty_key in ("OPENAI_API_KEY", "OPENAI_MODEL"):
            with self.subTest(empty_key=empty_key), patch.dict(os.environ, {empty_key: " "}):
                with self.assertRaisesRegex(ModelUnavailable, "Thiếu cấu hình"):
                    classify_live("Thiếu khoai.")
        self.openai.assert_not_called()

    def test_sdk_failures_raise_sanitized_model_unavailable(self):
        request = Request("POST", "https://api.openai.com/v1/responses")
        raw = "test-key raw response and complaint"
        errors = (
            APITimeoutError(request=request),
            AuthenticationError(raw, response=Response(401, request=request), body=raw),
            PermissionDeniedError(raw, response=Response(403, request=request), body=raw),
            RateLimitError(raw, response=Response(429, request=request), body=raw),
        )
        for error in errors:
            with self.subTest(error=type(error).__name__):
                self.parse.side_effect = error
                with self.assertRaises(ModelUnavailable) as raised:
                    classify_live("raw response and complaint")
                self.assertEqual(str(raised.exception), "Không gọi được model phân loại.")
                self.assertTrue(raised.exception.__suppress_context__)

    def test_empty_and_invalid_schema_are_unavailable(self):
        for parsed in (None, {}, {"issue_type": "OTHER", "item_hint": None, "demand_kind": "NONE"}):
            with self.subTest(parsed=parsed):
                self.parse.return_value = SimpleNamespace(output_parsed=parsed)
                with self.assertRaisesRegex(ModelUnavailable, "Kết quả phân loại không hợp lệ"):
                    classify_live("Thiếu khoai.")

        with self.assertRaises(ValidationError) as parser_error:
            TriageResult.model_validate_json('{"issue_type":"raw response"}')
        self.parse.side_effect = parser_error.exception
        with self.assertRaises(ModelUnavailable) as raised:
            classify_live("Thiếu khoai.")
        self.assertEqual(str(raised.exception), "Kết quả phân loại không hợp lệ.")
        self.assertTrue(raised.exception.__suppress_context__)

    def test_incomplete_response_is_unavailable(self):
        self.set_response(IssueType.MISSING_ITEM, "khoai", status="incomplete")
        with self.assertRaisesRegex(ModelUnavailable, "Kết quả phân loại chưa hoàn tất"):
            classify_live("Thiếu khoai.")

    def test_item_hint_requires_a_whole_phrase_from_the_message(self):
        for message, model_hint, expected_hint in (
            ("Mình đặt cơm gà nhưng giao nhầm cơm bò.", "cơm gà", "cơm gà"),
            (unicodedata.normalize("NFD", "Mình đặt cơm GÀ nhưng giao nhầm."), "cơm gà", "cơm gà"),
            ("Mình đặt cơm gà nhưng giao nhầm.", "mì xào", None),
            ("Mình báo giao nhầm bánh pizza.", "pi", None),
            ("Giao nhầm cơm bò.", None, None),
        ):
            with self.subTest(message=message, model_hint=model_hint):
                self.set_response(IssueType.WRONG_ITEM, model_hint)
                triage, _ = classify_live(message)
                self.assertEqual(triage.item_hint, expected_hint)

    def test_amount_classification_is_preserved(self):
        for message, demand in (
            ("Thiếu khoai, hoàn 100% cả đơn 500.000đ", DemandKind.FULL_ORDER),
            ("Thiếu khoai, tôi muốn hoàn 50k", DemandKind.AMOUNT_MENTIONED),
        ):
            with self.subTest(demand=demand):
                self.set_response(IssueType.MISSING_ITEM, "khoai", demand)
                triage, _ = classify_live(message)
                self.assertEqual(triage.demand_kind, demand)
