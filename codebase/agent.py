"""Bridge the starter's CLI, eval, and cost simulation to the D1 service."""

import sys
from pathlib import Path

# The starter loads this file with codebase/ on sys.path, including from outside the repo.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.d1.contracts import ComplaintRequest
from src.d1.service import complaint_response


def answer(text: str) -> dict[str, str]:
    """Accept a JSON request or a plain description with no order ID."""
    if text.lstrip().startswith("{"):
        request = ComplaintRequest.model_validate_json(text)
    else:
        request = ComplaintRequest(message=text)
    return {"output": complaint_response(request).model_dump_json()}
