# Hồ sơ đánh giá — D1 BDHT

## 1. Dataset và cách dựng câu thử

[Data Card](../data/DATA_CARD.md) ghi bộ 9 đơn và 3 quy tắc thử nghiệm, cùng nguồn review công khai đã ẩn danh. Nhóm dựa trên hành vi trong review để viết ca, sau đó ghép với mã đơn thử giúp xác định kỳ vọng từ dữ kiện và quy tắc.

[Benchmark](benchmark.csv) gồm 24 ca. Có 3 ca thường, 19 ca khó và 2 ca từ chối. Nguồn gồm 8 ca từ dữ liệu review và 16 ca tự viết. Độ phủ gồm thiếu món, sai món và giao trễ, ca thiếu dữ kiện, yêu cầu vượt mức và ca cần chặn. Bốn lớp chỗ khó được ghi ở [spec §5](../spec.md).

## 2. Chấm theo chuẩn CP2

| Chỉ số | Cách kiểm | Ngưỡng khóa |
|---|---|---|
| Trong hạn mức | Kiểm schema và tính độc lập từ đơn, quy tắc | 100% |
| Quyết định đúng | So quyết định với `expected` | ≥85%, ít nhất 21/24 |
| Tham chiếu quy tắc | So mã và phiên bản | ≥90% trên ca có quy tắc kỳ vọng |
| Từ chối an toàn | Kiểm `REFUSE`, số tiền 0đ và phản hồi an toàn | 100% ca từ chối, ít nhất 2 ca |

Chấm bằng code từ [metric spec](metric_spec.yaml). Bản này ghi kết quả chấm hai lượt bằng code. Biên bản chấm chéo của thành viên thứ hai cho 5 output chưa được cung cấp.

## 3. Hai lượt đo

| Lượt | Run ID | Model | Thay đổi | Đạt / tổng |
|---|---|---|---|---:|
| 1 | `run-1@20261127-172944` | `gpt-4o-mini-2024-07-18` | Luồng ban đầu | 23/24 (95,8%) |
| 2 | `run-2@20261127-230130` | `gpt-4o-mini-2024-07-18` | Kiểm căn cứ hoàn toàn đơn trong câu khách gửi | 24/24 (100%) |

Thực thi bằng `python run.py eval`. Sau khi chấm các cột `pass` và `ghi_chu`, chạy `python run.py score eval/run-2.csv`. [So sánh lỗi và bốn metric](report.md).

## 4. Lỗi chính

B15 nói đã khiếu nại nhiều lần. Mô hình đôi khi hiểu thành đòi hoàn cả đơn. Rule sau cải tiến chỉ dùng giá trị cả đơn nếu lời khách có yêu cầu đó. Ca B15 trả `NO_COMPENSATION` ở lượt 2.

## 5. Bộ câu thử bổ sung từ khảo sát và kịch bản giả lập

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
