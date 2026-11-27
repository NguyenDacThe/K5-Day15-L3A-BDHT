"""Đếm bằng chứng từ file nhãn review (cách đếm ở evidence/data-mining.md §1).

    python scripts/data/count_evidence.py data/raw/review_sample.csv --export
        đếm từ file đã gắn nhãn tay và ghi evidence/review_labels.csv (không có nội dung review gốc)
    python scripts/data/count_evidence.py evidence/review_labels.csv
        người khác chạy lại từ file đã commit, ra cùng số

Quy tắc gắn nhãn đầy đủ: evidence/data-mining.md §1. Ngưỡng giả thuyết (≥30%): evidence/hypothesis.md.
Nhãn: su_co_don = y/n · loai_su_co = thieu_mon | sai_mon | giao_tre | hoan_tien | khac
      kho_khieu_nai = y/n (chỉ xét khi su_co_don = y) · trich_dan_an_danh = đoạn trích đã ẩn danh hoặc để trống
"""
import csv
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXPORT = ROOT / "evidence" / "review_labels.csv"
EXPORT_COLUMNS = ["ma", "store", "thang_review", "so_sao", "su_co_don", "loai_su_co",
                  "kho_khieu_nai", "trich_dan_an_danh"]


def pct(x: int, n: int) -> str:
    return f"{x}/{n} ({x / n:.0%})" if n else f"{x}/0"


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = Path(sys.argv[1])
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = [r for r in csv.DictReader(f) if r.get("ma")]

    unlabeled = [r["ma"] for r in rows if r.get("su_co_don", "").strip().lower() not in {"y", "n"}]
    if unlabeled:
        sys.exit(f"Còn dòng chưa gắn nhãn su_co_don (y/n): {', '.join(unlabeled)}")

    incident = [r for r in rows if r["su_co_don"].strip().lower() == "y"]
    hard = [r for r in incident if r.get("kho_khieu_nai", "").strip().lower() == "y"]
    quotes = [r for r in rows if r.get("trich_dan_an_danh", "").strip()]

    print(f"Đã đọc tay: {len(rows)} review · theo store: {dict(Counter(r['store'] for r in rows))}")
    print(f"(2) Nói về sự cố đơn giao đồ ăn: {pct(len(incident), len(rows))}")
    print(f"    Theo loại: {dict(Counter(r.get('loai_su_co', '').strip() or '?' for r in incident))}")
    print(f"(3) Nhắc khó khăn khi khiếu nại/hỗ trợ: {pct(len(hard), len(incident))} trên review có sự cố")
    if incident:
        verdict = "ĐẠT" if len(hard) / len(incident) >= 0.30 else "KHÔNG ĐẠT"
        print(f"    So với ngưỡng giả thuyết ≥30%: {verdict}")
    print(f"Trích dẫn đã chọn: {len(quotes)} (cần ≥5, từ các review khác nhau)")

    if "--export" in sys.argv:
        with open(EXPORT, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=EXPORT_COLUMNS, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)
        print(f"Đã ghi {EXPORT.relative_to(ROOT)} (không có cột noi_dung).")


if __name__ == "__main__":
    main()
