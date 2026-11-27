# Gia Bảo · Đơn mẫu, chính sách và bằng chứng

**Giao JSON đầu tiên trong 60–90 phút từ lúc bắt đầu.** Chốt bằng chứng trước 09:00 thứ Bảy 28/11/2026, giờ Việt Nam. Nhánh `feat/giabao-data` cho fixture và `feat/giabao-evidence` từ `main` cho phần bằng chứng sau khi merge fixture. [Kế hoạch chung](01-plan-hackathon-d1.md)

## Phần Gia Bảo sở hữu

| File hoặc đường dẫn | Nội dung |
|---|---|
| `data/demo/orders.json`, `data/demo/policies.json` | Đơn, bằng chứng xác minh dựng sẵn và quy tắc demo. |
| `scripts/data/` | Script thu mẫu chạy local nếu dùng. Ghi kết quả thô vào `data/raw/` đã đặt trong gitignore. |
| `evidence/source_log.csv`, `evidence/summary.md`, `DATA_CARD.md` | Nhật ký nguồn, trích dẫn ẩn danh, cách chọn mẫu và mục đích sử dụng dữ liệu. |

## Bàn giao dữ liệu để cả nhóm code ngay

1. Dùng schema `orders.json` và `policies.json` trong kế hoạch. Tạo ba đơn `D1-001`, `D1-004`, `D1-005` và ba rule `demo-1` trước. Chạy kiểm tra JSON rồi mở PR nhỏ. Gửi Hùng và Đông mã đơn, tên/alias món và kết quả kỳ vọng.
2. Bổ sung các ca còn lại trong bảng. Mốc hẹn và mốc giao ghi theo ISO 8601 với offset `+07:00`. Đơn giá là phần đã trả sau giảm giá. Hai trường số lượng xác minh dùng số nguyên từ 0 đến `qty` hoặc `null` khi cần thêm bằng chứng.
3. Đối chiếu `rule_id`, `issue_type`, `version` và `max_amount_vnd`. Rule giao trễ dùng `late_after_minutes=30`, `voucher_vnd=50000`. Nhãn `kind=demo` xuất hiện trong `policies.json`, DATA_CARD và nội dung Đông đưa lên demo.

| Đơn mẫu | Dữ kiện cần dựng | Kỳ vọng để bàn giao |
|---|---|---|
| `D1-001` | Tổng 500.000đ. Dòng “Khoai chiên” alias “khoai”, giá 35.000đ, thiếu đúng 1 phần đã xác minh. Dòng còn lại có giá trị 465.000đ. | Đề xuất 35.000đ. Nếu đòi hoàn toàn đơn thì chuyển người và đề xuất 0đ. |
| `D1-002` | Hai tên hoặc alias dễ lẫn, ít nhất một món có `missing_qty=null`. | Hỏi rõ món hoặc xin thêm bằng chứng. |
| `D1-003` | Trễ 29 phút. | Chưa đủ điều kiện voucher. |
| `D1-004` | Trễ đúng 30 phút. | Chưa đủ điều kiện voucher. |
| `D1-005` | Trễ 31 phút. | Đề xuất voucher 50.000đ. |
| `D1-006` | Một dòng món giá 45.000đ, xác minh giao sai 1 phần. Chốt với Hùng tên và alias. | Đề xuất hoàn phần giao sai 45.000đ. |
| `D1-007` | Giao đúng, đủ, đúng giờ. Cả hai số lượng sự cố bằng 0. Câu thử có thể nhắc đã gửi khiếu nại nhiều lần. | Quyết định dựa trên bằng chứng của đơn hiện tại. |
| `D1-008` | Thiếu xác minh một món 65.000đ. | Vượt trần 50.000đ, chuyển người và đề xuất 0đ. |
| `D1-009` | Thiếu một mốc thời gian dùng để tính trễ. | Hỏi thêm về mốc giao. |

```bash
python -m json.tool data/demo/orders.json
python -m json.tool data/demo/policies.json
```

## Thu review công khai trên hai store

| Nguồn | Cách làm |
|---|---|
| **Google Play VN** | Package `com.deliverynow`. Thử lấy một trang review gần đây với `lang="vi"`, `country="vn"` qua collector của BTC nếu có hoặc `google-play-scraper` chạy local. Đối chiếu một số mẫu với trang chính thức. [Google Play](https://play.google.com/store/apps/details?id=com.deliverynow&hl=vi) · [Thư viện collector](https://pypi.org/project/google-play-scraper/) |
| **App Store VN** | App ID `1137866760`. Thử luồng công khai của store hoặc collector có sẵn. Mở mục Xếp hạng & Nhận xét để xác minh và lấy mẫu thủ công nếu tự động không ra dữ liệu. Ghi rõ phương thức nào đã dùng. [App Store](https://apps.apple.com/vn/app/shopeefood-food-delivery/id1137866760) |

1. Giới hạn thử collector khoảng 20 phút. Lấy mẫu gần đây theo cách ghi lại được, ưu tiên 20–40 review đọc được và có cả hai store nếu khả thi. Đếm số review thu được, số loại trùng, số đọc và số dùng được theo từng nguồn.
2. Lọc theo “thiếu món”, “sai món”, “giao trễ”, “hoàn tiền”, “bồi thường”, “khiếu nại”, “CSKH” và cách nói tương đương. Đọc tay để xác nhận review nói về một sự cố giao đồ ăn hoặc luồng hỗ trợ. Giữ cả ca được xử lý nếu xuất hiện trong mẫu. Nêu giới hạn khi phần lớn review là đánh giá thấp.
3. Lấy ít nhất 5 đoạn ngắn nguyên văn từ các review khác nhau. Chọn đoạn tự đủ nghĩa và có thể công khai sau khi bỏ tên, tài khoản, số điện thoại, địa chỉ, mã đơn và thông tin nhận diện khác. Nếu có phần cần che trong câu, ghi rõ ký hiệu `[đã ẩn]` hoặc dùng đoạn khác. Ghi nguồn ở cấp trang app, tháng review, ngày thu, số sao nếu có và mã nội bộ như `R01`.
4. Khi nguồn tự động lỗi, tiếp tục đọc hai trang công khai bằng tay. Nếu vẫn thiếu bằng chứng, huy động ít nhất 3 phỏng vấn ngoài nhóm hoặc ít nhất 20 phản hồi khảo sát. Hỏi về lần khiếu nại gần nhất, cách liên hệ, thông tin bị hỏi và kết quả. Giữ 5 trích dẫn đã ẩn tên làm mục tiêu bắt buộc của bản nộp. Nếu thiếu, báo Thể số thật và nguồn còn thiếu trước khi viết slides.

**Mẫu cột nhật ký.** `source_id,platform,source_url,method,collected_at,window,seen_count,duplicate_count,relevant_count,note`. Trong `evidence/summary.md`, nêu ngày thu, bộ lọc, số đếm từng nguồn, bảng trích dẫn và kết luận pain ở mức mẫu. Gửi Đông một trích dẫn mạnh nhất và gửi Hùng 2–3 dạng lỗi quan sát được để viết lại thành ca giả lập.

## Nguồn quy trình và DATA_CARD

- Đọc trang quy trình ShopeeFood. Tóm tắt các bước tiếp nhận khiếu nại, đối chiếu bằng chứng và chuyển người xem xét khi cần. Ghi URL, thời điểm xem và phần dùng làm tham chiếu trong `DATA_CARD.md`. [Quy trình giải quyết tranh chấp, khiếu nại](https://shopeefood.vn/adjustment-of-claims) · [Hướng dẫn gửi khiếu nại](https://help.shopee.vn/portal/4/article/79520-%5BShopeeFood%5D-T%C3%B4i-mu%E1%BB%91n-khi%E1%BA%BFu-n%E1%BA%A1i-%C4%91%C6%A1n-h%C3%A0ng)
- Ghi ba mục trong DATA_CARD gồm review công khai dùng làm bằng chứng, trang quy trình dùng làm tham chiếu và fixture giả lập dùng cho API/eval. Nêu số mẫu, thời điểm/cách thu, cách ẩn danh, quy tắc dựng fixture, phiên bản `demo-1` và giới hạn.
- Khi chuẩn bị repo public, chỉ đưa lên JSON giả lập, nhật ký nguồn và những đoạn trích đã duyệt. Đối chiếu lần cuối để giữ thông tin định danh và dữ liệu thô ngoài commit. Những câu thử gửi qua OpenAI API được viết từ tình huống giả lập.

## Nghiệm thu

- **Tối thứ Sáu.** Hùng load được JSON, Đông có ID thử và rule ref ổn định. Kiểm chứng ít nhất một nguồn review truy cập được và báo số trích dẫn đã dùng được.
- **Trước 09:00 thứ Bảy.** `DATA_CARD.md`, `evidence/summary.md` và nhật ký nguồn đã merge. Bằng chứng có ≥1 nguồn hợp lệ và ≥5 trích dẫn thật, ẩn tên. Gửi Thể trạng thái, số mẫu và đường dẫn. Review câu chữ cho slide và đối chiếu nhãn quy tắc demo.
- **Khi cần chỉnh schema hoặc phạm vi.** Gửi đề xuất cho Thể và tác động cho Hùng. Hùng sở hữu code load và benchmark. Gia Bảo sửa fixture và evidence trong đúng nhánh. Sau khi chốt benchmark, mọi thay đổi phiên bản fixture phải được xét cùng kế hoạch chạy lại hai lượt.
