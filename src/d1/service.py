from os import environ
from pathlib import Path
from time import perf_counter

from .agent import classify_live, classify_mock
from .contracts import ComplaintRequest, ComplaintResponse, ComplaintResult, ResponseMeta, RunMeta, TriageResult
from .rules import decide


def _load_local_config(path: Path) -> None:
    try:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
    except FileNotFoundError:
        return

    for line in lines:
        name, separator, value = line.partition("=")
        name = name.strip().removeprefix("export ")
        if separator and name in {"AI_MODE", "OPENAI_MODEL", "OPENAI_API_KEY"}:
            environ.setdefault(name, value.strip().strip('"').strip("'"))


_load_local_config(Path(__file__).resolve().parents[2] / ".env")


def handle_complaint(request: ComplaintRequest) -> tuple[ComplaintResult, RunMeta]:
    started_at = perf_counter()
    mode = "live" if environ.get("AI_MODE", "mock").strip().lower() == "live" else "mock"
    run_meta: RunMeta | None = None

    def classify(message: str) -> TriageResult:
        nonlocal run_meta
        triage, run_meta = classify_live(message)
        return triage

    result = decide(request, classify if mode == "live" else classify_mock)
    if run_meta is None:
        run_meta = RunMeta(
            mode=mode,
            ai_used=False,
            latency_ms=(perf_counter() - started_at) * 1000,
            error_code="MODEL_UNAVAILABLE" if result.reason_code == "MODEL_UNAVAILABLE" else None,
        )
    return result, run_meta


def build_complaint_response(result: ComplaintResult, run_meta: RunMeta) -> ComplaintResponse:
    return ComplaintResponse(
        **result.model_dump(),
        meta=ResponseMeta(mode=run_meta.mode, ai_used=run_meta.ai_used),
    )


def complaint_response(request: ComplaintRequest) -> ComplaintResponse:
    return build_complaint_response(*handle_complaint(request))
