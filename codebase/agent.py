"""Bridge the starter's CLI, eval, and cost simulation to the D1 service."""

import sys
from pathlib import Path

from pydantic import ValidationError

# The starter loads this file with codebase/ on sys.path, including from outside the repo.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if __package__:
    from . import tracing
else:
    import tracing

from src.d1.contracts import ComplaintRequest
from src.d1.service import build_complaint_response, handle_complaint


def answer(text: str) -> dict[str, str]:
    """Accept a JSON request or a plain description with no order ID."""
    try:
        if text.lstrip().startswith("{"):
            request = ComplaintRequest.model_validate_json(text)
        else:
            request = ComplaintRequest(message=text)
    except ValidationError:
        raise ValueError("Yêu cầu khiếu nại không hợp lệ.") from None

    result, run_meta = handle_complaint(request)
    if run_meta.ai_used:
        # The starter aggregates missing usage as zero. The trace keeps the unknown values.
        tracing._record({
            "kind": "model",
            "name": "classify_live",
            "model": run_meta.model or "",
            "tokens_in": run_meta.tokens_in,
            "tokens_out": run_meta.tokens_out,
            "latency_s": round(run_meta.latency_ms / 1000, 3),
        })
    elif run_meta.error_code:
        tracing.note(run_meta.error_code)
    return {"output": build_complaint_response(result, run_meta).model_dump_json()}
