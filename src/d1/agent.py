"""Classify complaints for the local demo."""

import re
import unicodedata

from .contracts import DemandKind, IssueType, TriageResult


ISSUE_PATTERNS = {
    IssueType.MISSING_ITEM: re.compile(r"\b(?:thiếu|chưa nhận được|không nhận được)\b"),
    IssueType.WRONG_ITEM: re.compile(r"\b(?:giao\s+)?(?:sai|nhầm)(?:\s+món)?\b"),
    IssueType.LATE_DELIVERY: re.compile(r"\b(?:giao|đến|nhận)\b[^.,!?;\n]*?\b(?:trễ|muộn)\b"),
}
ITEM_END = re.compile(r"[,.:!?;\n]|\b(?:nên|và|nhưng|trong đơn|giúp mình|giúp tôi)\b")
ITEM_QUANTITY = re.compile(r"^(?:(?:\d+|một|hai|ba)\s+)?(?:(?:phần|món|ly|hộp|suất)\s+)?")
FULL_ORDER = re.compile(
    r"\bhoàn(?:\s+lại)?(?:\s+tiền)?\s+(?:100\s*%|(?:toàn bộ|cả|nguyên)\s+đơn\b)"
)
AMOUNT_MENTIONED = re.compile(
    r"\b(?:hoàn|bồi thường|voucher|đền)\b[^.!?;\n]{0,40}?\b"
    r"\d+(?:[.,]\d+)*\s*(?:đồng|vnđ|vnd|đ|k|nghìn|ngàn|triệu)(?!\w)"
)


def classify_mock(message: str) -> TriageResult:
    """Extract a single issue and item hint without making a compensation decision."""
    text = unicodedata.normalize("NFC", message).casefold()
    matches = [(issue, match) for issue, pattern in ISSUE_PATTERNS.items() if (match := pattern.search(text))]
    if len(matches) != 1:
        return TriageResult(issue_type=IssueType.UNKNOWN, item_hint=None, demand_kind=DemandKind.NONE)

    issue, match = matches[0]
    item_hint = None
    if issue in (IssueType.MISSING_ITEM, IssueType.WRONG_ITEM):
        item_phrase = ITEM_END.split(text[match.end():].strip(), maxsplit=1)[0]
        item_hint = ITEM_QUANTITY.sub("", item_phrase).strip() or None

    demand = DemandKind.NONE
    if FULL_ORDER.search(text):
        demand = DemandKind.FULL_ORDER
    elif AMOUNT_MENTIONED.search(text):
        demand = DemandKind.AMOUNT_MENTIONED

    return TriageResult(issue_type=issue, item_hint=item_hint, demand_kind=demand)
