# Tóm tắt mô phỏng simulate-1@20261127-230547

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 25 | 1 | 405 | 18 | 0.8 | 0.0 |
| dung_vua | 22 | 1 | 457 | 20 | 0.9 | 0.0 |
| dung_nhieu | 3 | 1 | 167 | 8 | 0.3 | 0.0 |

Tỉ lệ đạt dùng để tính: 24/24 (100%) — lượt run-2@20261127-230130

- Tỉ lệ đạt lấy từ lượt nhóm chọn: eval/run-2.csv (--rate-from).

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (100 người) | Chi phí / tháng — cơ sở (300 người) | Chi phí / tháng — cao (1.000 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gpt-4o-mini-2024-07-18 (vào 0.15 · ra 0.6 $/1M) | $0.000073 | $0.000073 | $0.000073 | $0.0103 | $0.0309 | $0.1032 | $0.00010 |
| gpt-4.1-mini (vào 0.4 · ra 1.6 $/1M) | $0.00019 | $0.00019 | $0.00019 | $0.0275 | $0.0825 | $0.2751 | $0.00028 |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.0) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: gpt-4o-mini-2024-07-18. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 0/50.
