from time import perf_counter

from .agent import classify_mock
from .contracts import ComplaintRequest, ComplaintResponse, ComplaintResult, RunMeta
from .rules import decide


def handle_complaint(request: ComplaintRequest) -> tuple[ComplaintResult, RunMeta]:
    started_at = perf_counter()
    result = decide(request, classify_mock)
    return result, RunMeta(mode="mock", ai_used=False, latency_ms=(perf_counter() - started_at) * 1000)


def complaint_response(request: ComplaintRequest) -> ComplaintResponse:
    result, run_meta = handle_complaint(request)
    return ComplaintResponse(**result.model_dump(), meta=run_meta)
