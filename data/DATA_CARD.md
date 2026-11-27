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

## Dataset 2 · Review công khai ShopeeFood trên Google Play và App Store Việt Nam

| | |
|---|---|
| Dùng để làm gì | Đào bằng chứng pain của khách khi khiếu nại đơn giao đồ ăn (thiếu món, sai món, giao trễ, hoàn tiền, CSKH). Kết quả ở `evidence/summary.md`. |
| Từ đâu | Google Play VN, package `com.deliverynow` ([trang app](https://play.google.com/store/apps/details?id=com.deliverynow&hl=vi)). App Store VN, ID `1137866760` ([trang app](https://apps.apple.com/vn/app/shopeefood-food-delivery/id1137866760)). |
| Cách thu | Google Play: `google-play-scraper` chạy local (`lang="vi"`, `country="vn"`), chạy thành công; đối chiếu 3/3 review đang hiện trên trang chính thức đều có trong dữ liệu thu. App Store: đọc tay mục Xếp hạng & Nhận xét trên trang web; thử RSS công khai sắp mới nhất của Apple nhưng nhận 0 review. Chi tiết cỡ mẫu, từ khóa, quy tắc gắn nhãn và mẫu số ở `evidence/data-mining.md` §1. Thiếu ≥5 trích dẫn đến 17:00 27/11 thì phỏng vấn ≥3 người ngoài nhóm. Phương thức thật đã dùng ghi ở `evidence/source_log.csv`. |
| Xử lý những bước gì | Lọc theo cụm "thiếu món", "sai món", "giao trễ", "hoàn tiền", "bồi thường", "khiếu nại", "CSKH" và cách nói tương đương. Bỏ review trùng. Đọc tay để xác nhận review nói về sự cố giao đồ ăn hoặc luồng hỗ trợ. Ẩn danh: bỏ tên, tài khoản, số điện thoại, địa chỉ, mã đơn; phần cần che trong câu ghi `[đã ẩn]`. Mỗi trích dẫn có mã nội bộ `R01`…, tháng review, ngày thu, số sao. Cách đếm viết trước ở `evidence/data-mining.md` §1. Nhãn tay đã ẩn danh (không có nội dung gốc) ở `evidence/review_labels.csv`, đếm lại bằng `scripts/data/count_evidence.py`. |
| Số dòng | Kế hoạch mẫu (chốt 12:43 27/11/2026): Google Play thu ~600 review mới nhất, đọc tay 30 review mới nhất khớp từ khóa; App Store đọc tay 10–20 review gần nhất. Giữ ≥5 trích dẫn. Số thực tế: Google Play thu 600 review, bỏ 189 trùng còn 411, 43/411 khớp từ khóa, đọc tay 30; App Store đọc tay 10 (trang công khai chỉ hiện 10). Tổng đọc tay 40, 17 nói về sự cố đơn, 8/17 nhắc khó khiếu nại, 9 trích dẫn dùng được. |
| Phiên bản / ngày lấy | Thu ngày 27/11/2026. Cửa sổ review: Google Play 08/10–26/11/2026; App Store 11/2018–04/2021. |
| Nhãn | Thật (dữ liệu công khai, đã ẩn danh). |
| Giới hạn | Review store lệch về đánh giá thấp và người có trải nghiệm xấu, không đại diện cho tỷ lệ sự cố thật. Không xác minh được đơn hay danh tính người viết. Mẫu nhỏ, lấy theo thời gian gần đây. App Store chỉ công khai 10 review cũ (2018–2021, thời app còn tên Now), RSS sắp mới nhất trả 0 review. Nhãn tay gắn nháp với hỗ trợ của AI, Gia Bảo rà lại. |

## Dataset 3 · Trang quy trình khiếu nại của ShopeeFood (tham chiếu)

| | |
|---|---|
| Dùng để làm gì | Tham chiếu luồng hiện tại cho `spec.md` §0 và thiết kế bước hỏi thêm bằng chứng/chuyển người. Không dùng làm số liệu bồi thường. |
| Từ đâu | [Quy trình giải quyết tranh chấp, khiếu nại](https://shopeefood.vn/adjustment-of-claims) (bản cập nhật 30/12/2022). [Hướng dẫn gửi khiếu nại đơn hàng](https://help.shopee.vn/portal/4/article/79520-%5BShopeeFood%5D-T%C3%B4i-mu%E1%BB%91n-khi%E1%BA%BFu-n%E1%BA%A1i-%C4%91%C6%A1n-h%C3%A0ng). Xem ngày 27/11/2026, khoảng 12:25 (+07:00). |
| Phần dùng làm tham chiếu | (1) Người mua gửi khiếu nại qua email CSKH hoặc Trung tâm Hỗ trợ trong ứng dụng; trên app vào ShopeeFood → Đơn hàng → Chi tiết đơn → biểu tượng `?` (đơn đang giao) hoặc `...` (đơn đã giao). (2) Bộ phận CSKH tiếp nhận và chọn biện pháp hỗ trợ tùy tính chất, mức độ. (3) Ngoài thẩm quyền thì đề nghị các bên đưa ra cơ quan có thẩm quyền. Khiếu nại cần thông tin tài khoản và bằng chứng cụ thể. |
| Xử lý | Tóm tắt bằng lời của nhóm, không chép nguyên văn trang. |
| Nhãn | Thật · tài liệu công khai. |
| Giới hạn | Trang không nêu thời hạn gửi, loại bằng chứng cụ thể, mức hoàn tiền hay voucher cho thiếu/sai món/giao trễ. Các con số trong `policies.json` vì vậy là nhóm tự đặt. |
