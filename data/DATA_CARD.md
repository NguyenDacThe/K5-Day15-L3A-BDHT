# Data card — dữ liệu bản chạy thử dùng

Nhóm BDHT · L3A · Track D · bài D1. Người phụ trách: Phan Gia Bảo. Bản đầu cho CP2 ngày 27/11/2026, đã cập nhật số liệu review cùng ngày.

Repo public chỉ chứa fixture giả lập, nhật ký nguồn và đoạn trích đã ẩn danh. Dữ liệu review thô để ở `data/raw/` (đã có trong `.gitignore`), không commit. Câu thử gửi qua OpenAI API viết từ tình huống giả lập, không chứa review hay thông tin người thật.

## Dataset 1 · Fixture đơn và quy tắc demo `demo-1`

| | |
|---|---|
| Dùng để làm gì | Nguồn dữ kiện cho bước "tra đơn và quy tắc" của API/CLI, ground truth cho bộ câu thử `eval/benchmark.csv` và ví dụ trên UI/demo. |
| Từ đâu | Nhóm tự viết (`synthetic`). Không lấy từ đơn hay chính sách thật của ShopeeFood. |
| File | `data/demo/orders.json`, `data/demo/policies.json`. Bảng mã đơn và kết quả kỳ vọng: `data/demo/README.md`. |
| Xử lý những bước gì | Viết tay theo bảng ca mẫu trong `04-phan-cong-gia-bao.md` và hợp đồng fixture ở `spec.md` §4. Kiểm cú pháp bằng `python -m json.tool`. Rà tay số phút trễ, giá trị phần ảnh hưởng và trần tiền của từng đơn. |
| Số dòng | 9 đơn (`D1-001` → `D1-009`), 16 dòng món, 3 quy tắc. |
| Phiên bản / ngày | `version: demo-1`, `kind: demo`, dựng ngày 27/11/2026. |
| Nhãn | `synthetic` · `kind=demo`. |
| Giới hạn | Ít đơn, mỗi đơn chỉ thử một tình huống. Không có hình ảnh bằng chứng, ghi chú tài xế, phí ship hay mã giảm giá riêng. Trần 50.000đ và mốc 30 phút do nhóm chọn cho demo, không phải chính sách ShopeeFood. |

**Quy tắc dựng fixture**
- Mốc giờ ISO 8601, offset `+07:00`. `delivered_at = null` khi thiếu mốc giao (`D1-009`).
- `unit_paid_vnd` là đơn giá đã trả sau giảm giá. `amount_paid_vnd` bằng tổng `qty × unit_paid_vnd` của các dòng món.
- `missing_qty`, `wrong_qty`: số nguyên 0..`qty` đã xác minh. `0` là đã xác minh đúng/đủ. `null` là chưa có bằng chứng (`D1-002`).
- Alias không trùng giữa các món trong cùng đơn, trừ `D1-002` cố ý dùng chung "trà sữa" để thử ca tên dễ lẫn.
- Quy tắc: `D1-MISSING`, `D1-WRONG` hoàn theo giá trị phần đã xác minh, trần 50.000đ. `D1-LATE` voucher 50.000đ khi giao muộn hơn 30 phút (`late_after_minutes=30`).
- Ca biên có chủ đích: trễ 29/30/31 phút (`D1-003`/`004`/`005`), thiếu món 65.000đ vượt trần (`D1-008`), đơn giao đúng/đủ để thử lời đe dọa hoặc khiếu nại nhiều lần (`D1-007`).

**Data `synthetic`:** viết tay với hỗ trợ của AI, không dùng seed ngẫu nhiên. Người kiểm: Gia Bảo rà tay 9/9 đơn. Hùng đối chiếu lại khi chốt ground truth benchmark. Data tự dựng **không phải bằng chứng pain**.

## Dataset 2 · Review công khai ShopeeFood trên Google Play Việt Nam

| | |
|---|---|
| Dùng để làm gì | Đào bằng chứng pain của khách khi đơn giao đồ ăn bị thiếu món, sai món hoặc giao trễ (đúng tình huống đề D1) và khi khiếu nại. Kết quả ở `evidence/summary.md`. |
| Từ đâu | Google Play VN, package `com.deliverynow` ([trang app](https://play.google.com/store/apps/details?id=com.deliverynow&hl=vi)). |
| Cách thu | Google Play: `scripts/data/collect_gplay.py` chạy local (`google-play-scraper`, `lang="vi"`, `country="vn"`), thu 5.000 review mới nhất + 1.000 review liên quan nhất + 3.000 review 1★ + 1.174 review 2★ mới nhất (đặt 1.500, Google Play chỉ trả 1.174). Lần thu 1 (600 review mới nhất) bị thay vì lệch đề D1; lý do và các nguồn đã thử ở `evidence/data-mining.md` §1. Phương thức ghi ở `evidence/source_log.csv`. |
| Xử lý những bước gì | Bỏ trùng theo mã review và nội dung. Lọc theo tình huống lõi D1 bằng biểu thức trong script: thiếu món, sai món, giao trễ; gắn thêm thẻ tình huống khó trên thẻ đề (bồi thường, đòi hoàn cả đơn, khiếu nại, khiếu nại nhiều lần, dọa 1 sao). Chọn mẫu đọc tay 40 review: tối đa 15 thiếu món, 10 sai món, còn lại giao trễ. Gắn nhãn tay theo `evidence/data-mining.md` §1. Ẩn danh: bỏ tên, tài khoản, số điện thoại, địa chỉ, mã đơn; phần cần che ghi `[đã ẩn]`. Nhãn đã ẩn danh (không có nội dung gốc) ở `evidence/review_labels.csv`, đếm lại bằng `scripts/data/count_evidence.py`. |
| Số dòng | Google Play: thu 10.174, bỏ 4.741 trùng còn 5.433; 687/5.433 khớp thiếu/sai/trễ (thiếu 32, sai 12, trễ 650); đọc tay 40; 31 sự cố D1; 13/31 nhắc khó khiếu nại; 14 trích dẫn dùng được. |
| Phiên bản / ngày lấy | Thu ngày 27/11/2026 (~16:23). Cửa sổ review: 03/09/2016–26/11/2026; 35/40 review mẫu thuộc năm 2026. |
| Nhãn | Thật (dữ liệu công khai, đã ẩn danh). |
| Giới hạn | Review thiếu/sai món hiếm (44/5.433), nên thu thêm review 1★/2★ để tìm; mẫu lệch mạnh về đánh giá thấp (38/40 là 1–2★), không đại diện cho tỷ lệ sự cố thật. Tỷ lệ theo loại có mẫu số nhỏ (7–12). Không xác minh được đơn hay người viết. Nhãn tay gắn nháp với hỗ trợ của AI, Gia Bảo rà lại. |

## Dataset 3 · Trang quy trình khiếu nại của ShopeeFood (tham chiếu)

| | |
|---|---|
| Dùng để làm gì | Tham chiếu luồng hiện tại cho `spec.md` §0 và thiết kế bước hỏi thêm bằng chứng/chuyển người. Không dùng làm số liệu bồi thường. |
| Từ đâu | [Quy trình giải quyết tranh chấp, khiếu nại](https://shopeefood.vn/adjustment-of-claims) (bản cập nhật 30/12/2022). [Hướng dẫn gửi khiếu nại đơn hàng](https://help.shopee.vn/portal/4/article/79520-%5BShopeeFood%5D-T%C3%B4i-mu%E1%BB%91n-khi%E1%BA%BFu-n%E1%BA%A1i-%C4%91%C6%A1n-h%C3%A0ng). Xem ngày 27/11/2026, khoảng 12:25 (+07:00). |
| Phần dùng làm tham chiếu | (1) Người mua gửi khiếu nại qua email CSKH hoặc Trung tâm Hỗ trợ trong ứng dụng; trên app vào ShopeeFood → Đơn hàng → Chi tiết đơn → biểu tượng `?` (đơn đang giao) hoặc `...` (đơn đã giao). (2) Bộ phận CSKH tiếp nhận và chọn biện pháp hỗ trợ tùy tính chất, mức độ. (3) Ngoài thẩm quyền thì đề nghị các bên đưa ra cơ quan có thẩm quyền. Khiếu nại cần thông tin tài khoản và bằng chứng cụ thể. |
| Xử lý | Tóm tắt bằng lời của nhóm, không chép nguyên văn trang. |
| Nhãn | Thật · tài liệu công khai. |
| Giới hạn | Trang không nêu thời hạn gửi, loại bằng chứng cụ thể, mức hoàn tiền hay voucher cho thiếu/sai món/giao trễ. Các con số trong `policies.json` vì vậy là nhóm tự đặt. |
