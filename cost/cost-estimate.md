# Chi phí khi dùng thật — CP4

`python run.py simulate --rate-from eval/run-2.csv` chạy 50 phiên theo seed 42. Mỗi phiên gửi một yêu cầu qua bản chạy thử. [CSV mô phỏng](simulate-1.csv) · [Trace](../traces/simulate-1.jsonl) · [Tóm tắt do runner sinh](simulate-1-summary.md)

## 1. Đầu vào

- [Ba persona](personas.yaml) dùng cơ cấu 60% / 30% / 10% với 1 / 2 / 4 phiên mỗi khách mỗi tháng. Nhóm tự ước tính 1,6 phiên trung bình theo [spec §2](../spec.md).
- Quy mô 100 / 300 / 1.000 khách mỗi tháng là giả định thấp / cơ sở / cao, tương ứng 160 / 480 / 1.600 phiên.
- Giá chuẩn mỗi triệu token, vào / ra, là 0,15 / 0,60 USD cho GPT-4o mini và 0,40 / 1,60 USD cho GPT-4.1 mini. [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini) · [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- Token đo trên `gpt-4o-mini-2024-07-18`. Giá của GPT-4.1 mini được tính trên cùng lượng token. Tỷ lệ đạt 24/24 lấy từ [lượt 2](../eval/run-2.csv).

## 2. Kết quả mô phỏng

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (100 người) | Chi phí / tháng — cơ sở (300 người) | Chi phí / tháng — cao (1.000 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gpt-4o-mini-2024-07-18 (vào 0.15 · ra 0.6 $/1M) | $0.000073 | $0.000073 | $0.000073 | $0.0103 | $0.0309 | $0.1032 | $0.00010 |
| gpt-4.1-mini (vào 0.4 · ra 1.6 $/1M) | $0.00019 | $0.00019 | $0.00019 | $0.0275 | $0.0825 | $0.2751 | $0.00028 |

Chi phí mỗi task thành công bằng chi phí trung bình mỗi phiên chia tỷ lệ đạt của lượt 2. Tỷ lệ 100% là kết quả đo trên bộ 24 ca khóa. Chi phí theo tháng do runner tính theo mức dùng từng persona. Có 0/50 phiên lỗi kỹ thuật.

## 3. So với impact

Ở 300 khách mỗi tháng, chi phí model GPT-4o mini khoảng **0,0309 USD/tháng**, tương ứng **0,000073 USD/task thành công**. [Spec §2](../spec.md) ước tính 2.400 phút xử lý mỗi tháng, khoảng 8 phút mỗi khách. Thời gian tiết kiệm cần đo khi thử người dùng. Kết quả chi phí model đủ để thử nội bộ; chi phí vận hành và thời gian nhân viên duyệt cần được đo trước khi mở rộng.
