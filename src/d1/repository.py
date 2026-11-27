from pathlib import Path
from typing import Literal

from pydantic import AwareDatetime, BaseModel, TypeAdapter, ValidationError, model_validator

from .contracts import IssueType, VndAmount


DEMO_DIR = Path(__file__).resolve().parents[2] / "data" / "demo"


class FixtureUnavailable(RuntimeError):
    """Demo data could not be read or did not satisfy its contract."""


class Item(BaseModel):
    item_id: str
    name: str
    aliases: list[str]
    qty: VndAmount
    unit_paid_vnd: VndAmount
    missing_qty: VndAmount | None
    wrong_qty: VndAmount | None

    @model_validator(mode="after")
    def validate_quantities(self) -> "Item":
        if any(count is not None and count > self.qty for count in (self.missing_qty, self.wrong_qty)):
            raise ValueError("Verified quantity exceeds the ordered quantity.")
        return self


class Order(BaseModel):
    order_id: str
    amount_paid_vnd: VndAmount
    promised_at: AwareDatetime | None
    delivered_at: AwareDatetime | None
    items: list[Item]

    @model_validator(mode="after")
    def validate_item_ids(self) -> "Order":
        if len({item.item_id for item in self.items}) != len(self.items):
            raise ValueError("Duplicate item IDs in an order.")
        return self


class Rule(BaseModel):
    rule_id: str
    issue_type: IssueType
    max_amount_vnd: VndAmount
    late_after_minutes: VndAmount | None = None
    voucher_vnd: VndAmount | None = None

    @model_validator(mode="after")
    def validate_voucher(self) -> "Rule":
        if self.issue_type == IssueType.LATE_DELIVERY and (
            self.late_after_minutes is None
            or self.voucher_vnd is None
            or not 0 < self.voucher_vnd <= self.max_amount_vnd
        ):
            raise ValueError("Invalid late delivery threshold or voucher.")
        return self


class Policies(BaseModel):
    version: Literal["demo-1"]
    kind: Literal["demo"]
    rules: list[Rule]

    @model_validator(mode="after")
    def validate_rules(self) -> "Policies":
        if len({rule.rule_id for rule in self.rules}) != len(self.rules):
            raise ValueError("Duplicate rule IDs.")
        if len({rule.issue_type for rule in self.rules}) != len(self.rules):
            raise ValueError("More than one rule for an issue type.")
        return self


def load_orders() -> dict[str, Order]:
    try:
        orders = TypeAdapter(list[Order]).validate_json((DEMO_DIR / "orders.json").read_bytes())
    except (OSError, ValidationError) as exc:
        raise FixtureUnavailable("orders.json is missing or invalid.") from exc
    by_id = {order.order_id: order for order in orders}
    if len(by_id) != len(orders):
        raise FixtureUnavailable("Duplicate order IDs.")
    return by_id


def load_policies() -> Policies:
    try:
        return Policies.model_validate_json((DEMO_DIR / "policies.json").read_bytes())
    except (OSError, ValidationError) as exc:
        raise FixtureUnavailable("policies.json is missing or invalid.") from exc
