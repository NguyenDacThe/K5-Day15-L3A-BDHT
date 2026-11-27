# Báo cáo đánh giá CP4 — D1 BDHT

Hai lượt dùng cùng [24 câu thử](benchmark.csv), bộ đơn và quy tắc `demo-1`, model `gpt-4o-mini-2024-07-18` và [chuẩn đạt khóa ở CP2](metric_spec.yaml).

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | Tỷ lệ | Thường | Khó | Từ chối | Chuẩn CP2 |
|---|---|---:|---:|---:|---:|---:|---|
| 1 | `run-1@20261127-172944` | 23/24 | 95,8% | 3/3 | 18/19 | 2/2 | Đạt |
| 2 | `run-2@20261127-230130` | 24/24 | 100% | 3/3 | 19/19 | 2/2 | Đạt |

| Chỉ số | Ngưỡng đã khóa | Lượt 1 | Lượt 2 |
|---|---|---:|---:|
| Phản hồi đúng schema và trong hạn mức | 100% | 24/24 | 24/24 |
| Quyết định đúng | ≥85%, ít nhất 21/24 | 23/24 | 24/24 |
| Tham chiếu đúng trên ca có quy tắc kỳ vọng | ≥90% | 17/17 | 17/17 |
| Từ chối an toàn | 100%, ít nhất 2 ca | 2/2 | 2/2 |

Đối chiếu [CSV lượt 1](run-1.csv) và [CSV lượt 2](run-2.csv) với [trace lượt 1](../traces/run-1.jsonl) và [trace lượt 2](../traces/run-2.jsonl). Lượt 2 có 18 lần gọi model, 9.084 token vào và 401 token ra. Sáu ca chặn sớm dùng 0 token.

## 2. Lỗi đã quan sát

Lượt 1 có đúng một ca trượt là B15. Sau đó nhóm gọi lại adapter live để xem nhãn yêu cầu ở các ca liên quan.

| Ca | Đầu vào | Kết quả quan sát | Vì sao sai |
|---|---|---|---|
| B15 | “Mình đã khiếu nại nhiều lần rồi, đơn này vẫn báo thiếu pizza.” | Lượt 1 trả `ESCALATE / 0` với `AMOUNT_EXCEEDS_LIMIT`. Khi tái hiện, 2/3 lần model gắn nhãn `FULL_ORDER`. | Khách nhắc việc đã khiếu nại. Đơn mẫu đã xác minh pizza giao đủ. Kỳ vọng `NO_COMPENSATION / 0`. |
| B03 | Báo thiếu khoai, yêu cầu hoàn tiền, nhập 50.000đ vào ô số tiền. | Khi gọi lại, model gắn nhãn `FULL_ORDER`. Kết quả cuối vẫn đạt `ESCALATE / 0`. | Câu mô tả không yêu cầu hoàn cả đơn. Số nhập đã đủ để xác định yêu cầu vượt mức 35.000đ. |
| B11 | Báo thiếu gà nướng mật ong và muốn hoàn tiền thay cho mã giảm giá. | Khi gọi lại, model gắn nhãn `FULL_ORDER`. Kết quả cuối vẫn đạt `ESCALATE / 0`. | Khách nêu phương thức mong muốn. Giá phần thiếu 65.000đ đã vượt trần 50.000đ theo fixture. |

## 3. Một cải tiến

[Rules](../src/d1/rules.py) đối chiếu yêu cầu hoàn toàn đơn với câu khách gửi trước khi dùng giá trị cả đơn. Backend vẫn dùng ô số tiền yêu cầu để kiểm hạn mức, và vẫn hỏi xác nhận nếu khách chỉ nêu một số tiền trong mô tả. Việc đối chiếu bảo vệ quyết định cả khi model gắn nhầm `FULL_ORDER`.

B15 trả `NO_COMPENSATION / 0 / D1-MISSING@demo-1` ở lượt 2. Cả 23 ca đã đạt ở lượt 1 tiếp tục đạt. Ca xin hoàn cả đơn, ca nhập tiền vượt mức, ca vượt trần theo giá món và hai ca từ chối đều qua. Bộ unittest có 29 test đạt, gồm kiểm thử cố tình đưa nhãn `FULL_ORDER` sai và kiểm thử khách nêu yêu cầu cả đơn.

## 4. Phạm vi kết quả

24/24 là kết quả trên bộ 24 ca đã chốt. Các cách diễn đạt mới, trường hợp có nhiều sự cố trong một đơn và luồng trao đổi nhiều lượt cần đo thêm. Bản chạy thử tra đơn và hạn mức `demo-1`; kết quả `ESCALATE` hướng dẫn ca cần xem xét. Luồng gửi hồ sơ tới nhân viên thực tế cần tích hợp riêng.

[Mô phỏng chi phí CP4](../cost/cost-estimate.md) dùng tỷ lệ đạt từ `run-2.csv`.
