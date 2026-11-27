from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator


VndAmount = Annotated[int, Field(strict=True, ge=0)]
ComplaintMessage = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class Decision(str, Enum):
    PROPOSE_REFUND = "PROPOSE_REFUND"
    PROPOSE_VOUCHER = "PROPOSE_VOUCHER"
    ASK_INFO = "ASK_INFO"
    ESCALATE = "ESCALATE"
    NO_COMPENSATION = "NO_COMPENSATION"
    REFUSE = "REFUSE"


class IssueType(str, Enum):
    MISSING_ITEM = "MISSING_ITEM"
    WRONG_ITEM = "WRONG_ITEM"
    LATE_DELIVERY = "LATE_DELIVERY"
    UNKNOWN = "UNKNOWN"


class DemandKind(str, Enum):
    NONE = "NONE"
    FULL_ORDER = "FULL_ORDER"
    AMOUNT_MENTIONED = "AMOUNT_MENTIONED"


class ComplaintRequest(BaseModel):
    order_id: Annotated[str, StringConstraints(strip_whitespace=True)] | None = None
    message: ComplaintMessage
    requested_amount_vnd: VndAmount | None = None


class TriageResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    issue_type: IssueType
    item_hint: str | None
    demand_kind: DemandKind


class PolicyRef(BaseModel):
    rule_id: str
    version: str
    kind: Literal["demo"]


class ComplaintResult(BaseModel):
    decision: Decision
    issue_type: IssueType
    proposed_amount_vnd: VndAmount
    reason_code: str
    policy_ref: PolicyRef | None
    reply: str

    @model_validator(mode="after")
    def validate_proposal(self) -> "ComplaintResult":
        if self.decision in {Decision.PROPOSE_REFUND, Decision.PROPOSE_VOUCHER}:
            if self.proposed_amount_vnd == 0 or self.policy_ref is None:
                raise ValueError("A compensation proposal needs a positive amount and a policy reference.")
        elif self.proposed_amount_vnd:
            raise ValueError("Only compensation proposals may carry an amount.")
        return self


class ResponseMeta(BaseModel):
    mode: Literal["mock", "live"]
    ai_used: bool


class RunMeta(ResponseMeta):
    model: str | None = None
    tokens_in: int | None = None
    tokens_out: int | None = None
    latency_ms: float
    error_code: str | None = None


class ComplaintResponse(ComplaintResult):
    meta: ResponseMeta


class ModelUnavailable(RuntimeError):
    """The model call failed or its response did not match TriageResult."""
