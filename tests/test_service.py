import unittest
from unittest.mock import patch

from src.d1.contracts import ComplaintRequest, Decision, IssueType
from src.d1.service import complaint_response


@patch.dict("os.environ", {"AI_MODE": "mock"})
class ComplaintServiceTest(unittest.TestCase):
    def test_missing_item_uses_team_fixture_and_rules(self):
        request = ComplaintRequest(order_id="D1-001", message="Đơn của mình bị thiếu khoai tây chiên.")
        response = complaint_response(request)

        self.assertEqual(response.decision, Decision.PROPOSE_REFUND)
        self.assertEqual(response.issue_type, IssueType.MISSING_ITEM)
        self.assertEqual(response.proposed_amount_vnd, 35000)
        self.assertEqual(response.reason_code, "ITEM_ELIGIBLE")
        self.assertIsNotNone(response.policy_ref)
        self.assertEqual(response.policy_ref.rule_id, "D1-MISSING")
        self.assertEqual(response.policy_ref.version, "demo-1")
        self.assertEqual(response.meta.mode, "mock")
        self.assertFalse(response.meta.ai_used)

    def test_amount_mentioned_in_text_requires_confirmation(self):
        request = ComplaintRequest(order_id="D1-001", message="Thiếu một phần khoai. Mình muốn hoàn 50.000đ.")
        response = complaint_response(request)

        self.assertEqual(response.decision, Decision.ASK_INFO)
        self.assertEqual(response.reason_code, "REQUESTED_AMOUNT_REQUIRED")
        self.assertEqual(response.proposed_amount_vnd, 0)
