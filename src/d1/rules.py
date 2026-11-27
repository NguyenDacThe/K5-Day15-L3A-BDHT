import re
import unicodedata
from collections.abc import Callable

from pydantic import ValidationError

from .contracts import (
    ComplaintRequest,
    ComplaintResult,
    Decision,
    DemandKind,
    IssueType,
    ModelUnavailable,
    PolicyRef,
    TriageResult,
)
from .repository import FixtureUnavailable, load_orders, load_policies


SAFETY_ISSUE = re.compile(r"\b(?:di vat|ngo doc|di ung)\b")
PRIVATE_DATA_REQUEST = re.compile(
    r"\b(?:xin|gui|cho|lay|tiet lo|cung cap|muon biet)\b.*"
    r"\b(?:so dien thoai|dia chi|thong tin ca nhan)\b"
)
BYPASS_REVIEW = re.compile(r"\b(?:bo qua|bo het|khong can)\s+(?:buoc\s+)?(?:kiem duyet|phe duyet|duyet)\b")
FULL_REFUND = re.compile(
    r"\b(?:hoan(?:\s+lai)?|tra\s+lai)\s+(?:(?:so\s+)?tien\s+)?"
    r"(?:100\s*%|(?:toan\s+bo|tat\s+ca|ca|nguyen|het|tron)\s+"
    r"(?:(?:so\s+)?tien\s+(?:cua\s+)?)?(?:don\b|da\s+(?:tra|thanh\s+toan)\b))"
)


def _normalize(text: str) -> str:
    return " ".join(re.findall(r"\w+", unicodedata.normalize("NFC", text).casefold()))


def _plain_text(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.casefold().replace("đ", "d"))
    return " ".join("".join(char for char in decomposed if not unicodedata.combining(char)).split())


def _result(
    decision: Decision,
    reason: str,
    reply: str,
    issue: IssueType = IssueType.UNKNOWN,
    policy: PolicyRef | None = None,
    amount: int = 0,
) -> ComplaintResult:
    return ComplaintResult(
        decision=decision,
        issue_type=issue,
        proposed_amount_vnd=amount,
        reason_code=reason,
        policy_ref=policy,
        reply=reply,
    )


def decide(request: ComplaintRequest, classify: Callable[[str], TriageResult]) -> ComplaintResult:
    message = _plain_text(request.message)
    if SAFETY_ISSUE.search(message):
        return _result(Decision.ESCALATE, "FOOD_SAFETY", "Ca này cần nhân viên xem xét trong mô phỏng.")
    if PRIVATE_DATA_REQUEST.search(message) or BYPASS_REVIEW.search(message):
        return _result(
            Decision.REFUSE, "REQUEST_OUT_OF_SCOPE",
            "Mình chỉ hỗ trợ khiếu nại qua quy trình xem xét của đơn mẫu.",
        )
    if not request.order_id:
        return _result(Decision.ASK_INFO, "ORDER_ID_REQUIRED", "Bạn cho mình xin mã đơn mẫu để tiếp tục.")

    try:
        order = load_orders().get(request.order_id)
        if order is None:
            return _result(Decision.ASK_INFO, "ORDER_NOT_FOUND", "Bạn kiểm tra lại mã đơn mẫu giúp mình.")
        triage = TriageResult.model_validate(classify(request.message))
        issue = triage.issue_type
        if issue == IssueType.UNKNOWN:
            return _result(Decision.ASK_INFO, "ISSUE_UNCLEAR", "Bạn mô tả rõ sự cố với đơn mẫu giúp mình.")
        policies = load_policies()
    except FixtureUnavailable:
        return _result(
            Decision.ESCALATE, "RULES_UNAVAILABLE", "Dữ liệu demo cần được nhân viên xem xét trong mô phỏng.",
        )
    except (ModelUnavailable, ValidationError):
        return _result(
            Decision.ESCALATE, "MODEL_UNAVAILABLE", "Ca này cần nhân viên xem xét trong mô phỏng.",
        )

    rule = next((rule for rule in policies.rules if rule.issue_type == issue), None)
    if rule is None:
        return _result(Decision.ESCALATE, "RULES_UNAVAILABLE", "Ca này cần nhân viên xem xét trong mô phỏng.", issue)
    policy = PolicyRef(rule_id=rule.rule_id, version=policies.version, kind=policies.kind)

    if issue == IssueType.LATE_DELIVERY:
        if order.promised_at is None or order.delivered_at is None:
            return _result(Decision.ASK_INFO, "DELIVERY_TIME_REQUIRED", "Bạn bổ sung mốc giao hàng giúp mình.", issue, policy)
        assert rule.late_after_minutes is not None and rule.voucher_vnd is not None
        delay = order.delivered_at - order.promised_at
        eligible = rule.voucher_vnd if delay.total_seconds() > rule.late_after_minutes * 60 else 0
    else:
        hint = _normalize(triage.item_hint or "")
        matches = [
            item for item in order.items
            if hint and any(hint == _normalize(name) for name in (item.name, *item.aliases))
        ]
        if len(matches) != 1:
            return _result(Decision.ASK_INFO, "ITEM_UNCLEAR", "Bạn cho mình tên chính xác của món cần kiểm tra.", issue, policy)
        item = matches[0]
        count = item.missing_qty if issue == IssueType.MISSING_ITEM else item.wrong_qty
        if count is None:
            return _result(Decision.ASK_INFO, "EVIDENCE_REQUIRED", "Bạn bổ sung bằng chứng về món cần kiểm tra.", issue, policy)
        eligible = count * item.unit_paid_vnd

    requested = request.requested_amount_vnd or 0
    # Only a request stated by the customer can imply the entire order total.
    if FULL_REFUND.search(message):
        requested = max(requested, order.amount_paid_vnd)
    elif triage.demand_kind == DemandKind.AMOUNT_MENTIONED and request.requested_amount_vnd is None:
        return _result(Decision.ASK_INFO, "REQUESTED_AMOUNT_REQUIRED", "Bạn xác nhận số tiền yêu cầu giúp mình.", issue, policy)

    if eligible > rule.max_amount_vnd or requested > eligible:
        return _result(
            Decision.ESCALATE, "AMOUNT_EXCEEDS_LIMIT",
            "Mức bồi thường vượt giới hạn của ca này. Ca cần nhân viên xem xét trong mô phỏng.", issue, policy,
        )
    if eligible == 0:
        return _result(
            Decision.NO_COMPENSATION, "NOT_ELIGIBLE",
            "Dữ liệu đã xác minh của đơn mẫu chưa đủ điều kiện bồi thường.", issue, policy,
        )

    amount_text = f"{eligible:,}".replace(",", ".")
    if issue == IssueType.LATE_DELIVERY:
        return _result(
            Decision.PROPOSE_VOUCHER, "LATE_ELIGIBLE", f"Đề xuất voucher {amount_text}đ cho đơn mẫu.", issue, policy, eligible,
        )
    return _result(
        Decision.PROPOSE_REFUND, "ITEM_ELIGIBLE", f"Đề xuất hoàn {amount_text}đ cho phần món bị ảnh hưởng.", issue, policy, eligible,
    )
