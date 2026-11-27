# Hồ sơ đánh giá — một trang

> Điền ở guide bước 2.4 (mục 1–4, trước CP2) và 4.1 (mục 5–6, trước CP4). Ôn lại: ngày 9, ngày 14 · lab ngày 9. Chấm ở rubric R4, R5.
> Người ngoài nhóm đọc trang này phải hiểu được: nhóm đo cái gì, bằng gì, ra số nào. Trang slide "Đánh giá thế nào" lấy từ đây.

## 1. Dataset → xử lý

Dataset nào, xử lý gì: tóm 2–3 dòng từ `data/DATA_CARD.md`.

## 2. Bộ câu thử dựng ra sao

- `eval/benchmark.csv`: __ câu (thuong __ · kho __ · tu_choi __, trong đó __ câu tấn công)
- Nguồn (`python run.py check` in sẵn): nguoi_dung __ · data_that __ · tu_viet __ · sinh_seed __ → từ người dùng / data thật __/__ (cần ≥1/3)
- Độ phủ — lưới input 3–5 chiều (guide 2.4 bước 5): __
- Câu `kho` trỏ về 4 lớp chỗ khó (`spec.md` §5): lớp 1: __ · lớp 2: __ · lớp 3: __ · lớp 4: __

## 3. Metric và cách chấm

| Metric (`eval/metric_spec.yaml`) | Cách chấm | Ngưỡng |
|---|---|---|
| | code / llm / nguoi | |
| | | |
| | | |

- **Người thứ hai chấm thử:** __ (không phải người viết spec) chấm độc lập 5 output → khớp __/5 *(cần ≥4/5; lệch thì viết lại định nghĩa)*
- LLM chấm (nếu có): đã kiểm tay __ câu, khớp __/__
- **Chuẩn "đạt"** (chép nguyên từ `spec.md` §7, chốt trước 19:30 Thứ Sáu 27/11): "__"

## 4. Lệnh

`python run.py eval` → `eval/run-N.csv` + `traces/run-N.jsonl` · điền cột `pass` · `python run.py score eval/run-N.csv`

## 5. Đã chạy gì

| Lượt | Run ID | Model | Cấu hình (prompt / công cụ / thay đổi) | Đạt / tổng | % | Đạt chuẩn? |
|---|---|---|---|---|---|---|
| 1 | | | | __/__ | | |
| 2 | | | | __/__ | | |

Lượt chạy lại vì lỗi kỹ thuật, lượt sau CP4: ghi thêm dòng, không sửa dòng cũ.

## 6. Lỗi chính

Tóm 2–3 dòng từ `eval/report.md`: nhóm lỗi lớn nhất · đã sửa gì · còn lại gì.

## 7. Bộ câu thử bổ sung từ khảo sát và kịch bản giả lập

[Benchmark bổ sung](benchmark-supplemental.csv) có 6 ca B25–B30, gồm 1 ca `thuong` và 5 ca `kho`. B25–B27 dựa trên [phản hồi khảo sát đã ẩn danh](../evidence/survey/results.csv). B28–B30 lấy ý tưởng từ kịch bản P1–P3 do AI tạo, ghi nguồn `sinh_seed`.

Mã đơn, giá món, tình trạng xác minh và giờ giao dùng [fixture D1](../data/demo/orders.json). `expected` được xác định trước khi chạy từ fixture và [chính sách D1](../data/demo/policies.json). Các số tiền là đề xuất theo chính sách mẫu.

Dùng cùng 24 ca trong [benchmark chính thức](benchmark.csv) để so sánh lượt 1 và lượt 2. [Lượt 1](run-1.csv) `run-1@20261127-172944` đạt 23/24. Ghi số của bộ bổ sung theo mẫu số 6 khi báo cáo ở CP3 hoặc CP4.

Chạy từ thư mục gốc repo. Lệnh dùng chế độ AI đang cấu hình và in đường dẫn CSV cùng trace trong thư mục tạm riêng.

```text
python eval/run_supplemental.py
```

Chấm từng ca vào cột `pass` và ghi lý do ở `ghi_chu` theo `expected`, `pass_criterion` và [metric spec](metric_spec.yaml). Dùng đường dẫn tuyệt đối của CSV vừa sinh với lệnh chấm của bộ bổ sung.

```text
python eval/run_supplemental.py --score "<đường dẫn CSV>"
```

**Kiểm tra bộ bổ sung ngày 27/11/2026.** Lượt live `run-1@20261127-214149` dùng `gpt-4o-mini-2024-07-18` đạt **6/6 ca** với 6 lần gọi, 3.094 token vào và 133 token ra. Chế độ mock đạt 5/6. Ở B29, mock lấy tên món giao nhầm làm tên món cần đối chiếu.
