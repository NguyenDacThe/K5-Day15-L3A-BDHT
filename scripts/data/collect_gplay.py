"""Thu review ShopeeFood (Google Play VN), lọc theo từ khóa và tạo file mẫu để gắn nhãn tay.

Cách đếm đã viết trước ở evidence/data-mining.md §1. Chạy từ root repo trên máy local:
    pip install google-play-scraper
    python scripts/data/collect_gplay.py

Ghi vào data/raw/ (đã gitignore, KHÔNG commit vì có nội dung review gốc):
    gplay_reviews.json   toàn bộ review đã bỏ trùng (không lưu tên người viết)
    review_sample.csv    30 review mới nhất khớp từ khóa, cột nhãn để trống cho đọc tay.
                         Review App Store đọc tay thì thêm dòng vào cùng file, store=appstore.
Số in ra cuối cùng dùng để điền evidence/source_log.csv.
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
TARGET = 600       # số review mới nhất cần thu
SAMPLE_SIZE = 30   # số review khớp từ khóa đưa vào mẫu đọc tay

KEYWORDS = [
    "thiếu món", "thiếu đồ", "thiếu", "sai món", "nhầm món", "giao nhầm", "giao sai",
    "giao trễ", "giao chậm", "trễ", "chậm", "hoàn tiền", "hoàn lại", "bồi thường",
    "khiếu nại", "cskh", "chăm sóc khách hàng", "tổng đài", "hỗ trợ", "đền",
]
SAMPLE_COLUMNS = ["ma", "store", "thang_review", "so_sao", "noi_dung",
                  "su_co_don", "loai_su_co", "kho_khieu_nai", "trich_dan_an_danh"]


def norm(s: str) -> str:
    return " ".join(unicodedata.normalize("NFC", s or "").casefold().split())


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    rows, token = [], None
    while len(rows) < TARGET:
        batch, token = reviews(PACKAGE, lang="vi", country="vn", sort=Sort.NEWEST,
                               count=min(200, TARGET - len(rows)), continuation_token=token)
        rows += batch
        if not batch or not token:
            break

    seen, unique, dup = set(), [], 0
    for r in rows:
        key = norm(r["content"])
        if r["reviewId"] in seen or key in seen:
            dup += 1
            continue
        seen.update({r["reviewId"], key})
        unique.append(r)
    unique.sort(key=lambda r: r["at"], reverse=True)

    pattern = re.compile("|".join(re.escape(k) for k in KEYWORDS))
    matched = [r for r in unique if pattern.search(norm(r["content"]))]
    sample = matched[:SAMPLE_SIZE]

    (RAW / "gplay_reviews.json").write_text(json.dumps(
        [{"at": r["at"].isoformat(), "score": r["score"], "content": r["content"]} for r in unique],
        ensure_ascii=False, indent=1), encoding="utf-8")
    with open(RAW / "review_sample.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=SAMPLE_COLUMNS)
        w.writeheader()
        for i, r in enumerate(sample, 1):
            w.writerow({"ma": f"R{i:02d}", "store": "googleplay", "thang_review": r["at"].strftime("%m/%Y"),
                        "so_sao": r["score"], "noi_dung": r["content"]})

    window = f"{min(r['at'] for r in unique):%d/%m/%Y}–{max(r['at'] for r in unique):%d/%m/%Y}" if unique else "-"
    print(f"collected_at: {date.today():%Y-%m-%d}")
    print(f"window: {window}")
    print(f"seen_count (thu được): {len(rows)} · duplicate_count: {dup} · sau bỏ trùng: {len(unique)}")
    print(f"khớp từ khóa: {len(matched)}/{len(unique)} · đưa vào mẫu đọc tay: {len(sample)}")
    print(f"Mở {RAW / 'review_sample.csv'} bằng Excel và gắn nhãn tay.")


if __name__ == "__main__":
    main()
