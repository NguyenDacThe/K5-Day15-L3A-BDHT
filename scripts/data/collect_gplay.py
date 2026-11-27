"""Thu review ShopeeFood (Google Play VN) theo đúng các tình huống của đề D1 và tạo file mẫu để gắn nhãn tay.

Đề D1: khách báo thiếu món, sai món, giao trễ; AI đề xuất trong hạn mức hoặc chuyển nhân viên.
Cách đếm viết trước ở evidence/data-mining.md §1. Chạy từ root repo trên máy local:
    pip install google-play-scraper
    python scripts/data/collect_gplay.py

Thu ~5.000 review mới nhất + ~1.000 "liên quan nhất" + ~3.000 review 1★ và ~1.500 review 2★ mới nhất
để phủ nhiều tháng, vì review thiếu/sai món hiếm
(chỉ 10/1.331 review ở lần thu 2.500). Mục tiêu ~30 review dùng được; số đọc tay tối đa 40, đúng yêu cầu 20–40.
Ghi vào data/raw/ (đã gitignore, KHÔNG commit vì có nội dung review gốc):
    gplay_reviews_d1.json   toàn bộ review đã bỏ trùng (không lưu tên người viết)
    review_sample_d1.csv    mẫu đọc tay chia theo tình huống, cột nhãn để trống (chạy lại sẽ ghi đè nhãn)
"""
import csv
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

from google_play_scraper import Sort, reviews

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
PACKAGE = "com.deliverynow"
TARGET_NEWEST = 5000
TARGET_RELEVANT = 1000
TARGET_LOW = 3000  # thêm review 1★ (3.000) và 2★ (1.500) mới nhất

# Tình huống lõi của D1 (dùng để chọn mẫu) và tình huống khó trên thẻ đề (chỉ gắn thẻ để đọc).
CORE = {
    "thieu_mon": r"thiếu (món|đồ|phần|ly|hộp|suất|nước|cơm|gà|khoai|topping|đũa|muỗng|thìa|sốt|nước chấm|bánh|\d|mất)"
                 r"|giao thiếu|nhận thiếu|bị thiếu|món thiếu|đồ thiếu|thiếu sót|giao không đủ|không đủ (món|đồ|phần)"
                 r"|quên (bỏ |cho |giao )?(món|đồ|nước)|mất (món|1 món|một món|ly|phần)",
    "sai_mon": r"sai món|nhầm món|giao nhầm (món|đồ|đơn)|giao sai (món|đồ|đơn)|sai đơn|nhầm đơn|làm sai|đưa nhầm"
               r"|nhầm đồ|sai đồ|không đúng món|sai (size|topping)|sai vị(?! trí)|nhận nhầm|đơn của người khác|không phải món (mình|tôi|t) đặt",
    "giao_tre": r"giao (trễ|chậm|lâu|muộn)|trễ (\d|hơn|gần|cả|mấy)|(chờ|đợi) (\d|cả|gần|hơn|mấy)|quá giờ|trễ giờ|\d+ ?(tiếng|phút)\b",
}
EXTRA = {
    "boi_thuong": r"hoàn (tiền|lại|phần|100|toàn bộ|cả đơn|hết)|bồi thường|đền bù|\bđền\b|voucher|mã giảm",
    "doi_hoan_ca_don": r"hoàn (100|toàn bộ|cả đơn|hết)|trả lại (toàn bộ|hết|cả)",
    "khieu_nai": r"khiếu nại|cskh|chăm sóc khách hàng|tổng đài|báo cáo|trung tâm hỗ trợ|chat ?bot|liên hệ",
    "nhieu_lan": r"nhiều lần|lần thứ|mấy lần|\d+ lần|lần nào cũng|lúc nào cũng|tuần \d",
    "doa_danh_gia": r"1 sao|một sao|1\*|bóc phốt|phốt|tẩy chay|kiện",
}
QUOTA = {"thieu_mon": 15, "sai_mon": 10}  # tối đa số review đọc tay mỗi tình huống hiếm
SAMPLE_TOTAL = 40                          # phần còn lại lấy review giao trễ cho đủ tổng
SAMPLE_COLUMNS = ["ma", "store", "thang_review", "so_sao", "the_tu_khoa", "noi_dung",
                  "su_co_don", "loai_su_co", "kho_khieu_nai", "trich_dan_an_danh"]


def norm(s: str) -> str:
    return " ".join(unicodedata.normalize("NFC", s or "").casefold().split())


def fetch(sort, target, score=None):
    rows, token = [], None
    while len(rows) < target:
        batch, token = reviews(PACKAGE, lang="vi", country="vn", sort=sort, filter_score_with=score,
                               count=min(200, target - len(rows)), continuation_token=token)
        rows += batch
        if not batch or not token:
            break
    return rows


def tags(text: str) -> list[str]:
    t = norm(text)
    return [k for k, p in {**CORE, **EXTRA}.items() if re.search(p, t)]


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    newest = fetch(Sort.NEWEST, TARGET_NEWEST)
    relevant = fetch(Sort.MOST_RELEVANT, TARGET_RELEVANT)
    low1 = fetch(Sort.NEWEST, TARGET_LOW, score=1)   # review 1★ mới nhất: nơi khách kể sự cố
    low2 = fetch(Sort.NEWEST, TARGET_LOW // 2, score=2)
    rows = newest + relevant + low1 + low2

    seen, unique, dup = set(), [], 0
    for r in rows:
        key = norm(r["content"])
        if r["reviewId"] in seen or key in seen:
            dup += 1
            continue
        seen.update({r["reviewId"], key})
        unique.append(r)
    unique.sort(key=lambda r: r["at"], reverse=True)
    for r in unique:
        r["_tags"] = tags(r["content"])

    picked, used = [], set()
    for cat, quota in QUOTA.items():
        for r in [x for x in unique if cat in x["_tags"] and x["reviewId"] not in used][:quota]:
            picked.append(r)
            used.add(r["reviewId"])
    for r in [x for x in unique if "giao_tre" in x["_tags"] and x["reviewId"] not in used][:SAMPLE_TOTAL - len(picked)]:
        picked.append(r)
        used.add(r["reviewId"])
    picked.sort(key=lambda r: r["at"], reverse=True)

    (RAW / "gplay_reviews_d1.json").write_text(json.dumps(
        [{"at": r["at"].isoformat(), "score": r["score"], "tags": r["_tags"], "content": r["content"]} for r in unique],
        ensure_ascii=False, indent=1), encoding="utf-8")
    with open(RAW / "review_sample_d1.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=SAMPLE_COLUMNS)
        w.writeheader()
        for i, r in enumerate(picked, 101):
            w.writerow({"ma": f"R{i}", "store": "googleplay", "thang_review": r["at"].strftime("%m/%Y"),
                        "so_sao": r["score"], "the_tu_khoa": " ".join(r["_tags"]), "noi_dung": r["content"]})

    def count(cat):
        return sum(cat in r["_tags"] for r in unique)
    core_any = sum(any(c in r["_tags"] for c in CORE) for r in unique)
    window = f"{min(r['at'] for r in unique):%d/%m/%Y}–{max(r['at'] for r in unique):%d/%m/%Y}" if unique else "-"
    print(f"collected_at: {date.today():%Y-%m-%d}")
    print(f"window: {window}")
    print(f"seen_count: {len(rows)} (mới nhất {len(newest)} + liên quan nhất {len(relevant)} + 1★ {len(low1)} + 2★ {len(low2)})"
          f" · duplicate_count: {dup} · sau bỏ trùng: {len(unique)}")
    print(f"khớp tình huống lõi D1 (thiếu/sai/trễ): {core_any}/{len(unique)}")
    print("theo thẻ: " + " · ".join(f"{k} {count(k)}" for k in [*CORE, *EXTRA]))
    print(f"đưa vào mẫu đọc tay: {len(picked)} → {RAW / 'review_sample_d1.csv'}")


if __name__ == "__main__":
    main()
