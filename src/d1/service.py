from time import perf_counter

from .contracts import (
    ComplaintRequest,
    ComplaintResponse,
    ComplaintResult,
    Decision,
    IssueType,
    RunMeta,
)


def handle_complaint(request: ComplaintRequest) -> tuple[ComplaintResult, RunMeta]:
    """Return a safe response while the team integrates the fixture, rules, and model."""
    started_at = perf_counter()
    if request.order_id:
        decision = Decision.ESCALATE
        reason_code = "RULES_UNAVAILABLE"
        reply = "Bản khung đang chờ tích hợp quy tắc. Ca này cần nhân viên xem xét trong mô phỏng."
    else:
        decision = Decision.ASK_INFO
        reason_code = "ORDER_ID_REQUIRED"
        reply = "Bạn cho mình xin mã đơn mẫu để tiếp tục."

    result = ComplaintResult(
        decision=decision,
        issue_type=IssueType.UNKNOWN,
        proposed_amount_vnd=0,
        reason_code=reason_code,
        policy_ref=None,
        reply=reply,
    )
    return result, RunMeta(mode="mock", ai_used=False, latency_ms=(perf_counter() - started_at) * 1000)


def complaint_response(request: ComplaintRequest) -> ComplaintResponse:
    result, run_meta = handle_complaint(request)
    return ComplaintResponse(**result.model_dump(), meta=run_meta)
