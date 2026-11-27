# Đông · Giao diện, video và slides

**Đích bàn giao trước 11:00 thứ Bảy 28/11/2026, giờ Việt Nam.** Nhánh `feat/dong-ui-demo`. Có thể dựng toàn bộ giao diện từ response mẫu ngay khi Thể gửi contract. [Kế hoạch chung](01-plan-hackathon-d1.md)

## Phần Đông sở hữu

| File hoặc đường dẫn | Nội dung |
|---|---|
| `web/index.html`, `web/assets/app.js`, `web/assets/style.css` | Giao diện nhập khiếu nại và trình bày kết quả. |
| `demo/links.md` | Link video gọi thật 30 giây, link demo dự phòng và SHA đã quay. |
| `demo-slides.pdf` ở root | Slides dùng khi trình bày. Nếu PR UI đã merge, mở PR `feat/dong-demo` từ `main` hiện tại. |

## Dựng UI đến mốc 120 phút

1. Làm một màn hình với chọn mã đơn mẫu, textarea tối đa 500 ký tự và số tiền muốn yêu cầu nếu có. Nút “Kiểm tra phương án” lấy input và hiện kết quả ở cùng trang. Đặt nhãn “Đơn và quy tắc giả lập” và lời nhắc nhập tình huống giả lập.
2. Tạo 3 nhóm ví dụ. `D1-001` thiếu một phần khoai. Cùng đơn đòi hoàn cả đơn để thử vượt trần. `D1-004` và `D1-005` để so ca giao trễ 30/31 phút. Dùng mã và nội dung do Gia Bảo xác nhận.
3. Tách xử lý response ra khỏi lời gọi mạng để có thể render JSON mẫu từ kế hoạch ngay. Khi Preview sẵn sàng, dùng `fetch("/api/complaints")` cùng origin. Tất cả nội dung động hiển thị dưới dạng text. Định dạng VND bằng `Intl.NumberFormat("vi-VN", {style:"currency", currency:"VND"})`.
4. Kiểm tra loading, nút bấm lặp, response 422, lỗi mạng và trạng thái model tạm thời bận. Hiện lỗi ngắn và giữ input để khách thử lại. Dùng tên trạng thái tiếng Việt thay vì chỉ hiển thị enum.

### Màn kết quả

| Quyết định từ API | Nội dung hiển thị |
|---|---|
| `PROPOSE_REFUND` | Số tiền hoàn **đề xuất**, lời giải thích và mã quy tắc. |
| `PROPOSE_VOUCHER` | Giá trị voucher **đề xuất**, lý do và mã quy tắc. |
| `ASK_INFO` | Thông tin cần bổ sung, ví dụ mã đơn, tên món hoặc bằng chứng. |
| `ESCALATE` | “Cần nhân viên xem xét” kèm lý do và nhãn mô phỏng. |
| `NO_COMPENSATION` | Chưa đủ điều kiện theo quy tắc demo, kèm lý do đối chiếu. |
| `REFUSE` | Lời từ chối ngắn và gợi ý gửi nội dung đúng phạm vi. |

Dùng `reply` từ API và hiển thị mã quy tắc nếu `policy_ref` có dữ liệu. Hiện “AI thật” ở một lượt khi `meta.mode=live` và `meta.ai_used=true`. Với response mock, hiện nhãn “Chế độ thử”. Với một nhánh do Python chặn sớm, có thể hiện “Kiểm tra tự động theo quy tắc”.

## Chạy thử và quay demo

| Ca | Nhập | Kết quả cần thấy |
|---|---|---|
| Luồng chính | `D1-001` + “Đơn mình thiếu một phần khoai.” | Đề xuất 35.000đ, `D1-MISSING`, nhãn AI thật khi chạy thành công trên live. |
| Vượt trần | `D1-001` + “Thiếu khoai, tôi muốn hoàn 100% cả đơn 500.000đ.” | Cần nhân viên xem xét, đề xuất bằng 0đ. |
| Biên thời gian | Hai đơn `D1-004`, `D1-005` cùng lời báo giao trễ. | 30 phút chưa đủ điều kiện. 31 phút được đề xuất voucher 50.000đ. |
| Thiếu dữ liệu | Bỏ trống mã đơn, mô tả thiếu món. | Hỏi mã đơn, giao diện vẫn cho nhập tiếp. |
| Lỗi hạ tầng | Thử lỗi API có kiểm soát trên môi trường test. | Phản hồi dễ hiểu, có thể gửi lại, trạng thái tự thoát loading. |

**Video gọi thật 30 giây.** Quay trên Preview live đã xác minh hoặc Production. Khoảng 5 giây đầu mở URL, 10 giây nhập tình huống thiếu món, 10 giây cho thấy số tiền, mã quy tắc và nhãn AI thật, 5 giây chỉ rõ trạng thái đề xuất. Dùng một ca `ai_used=true`. Chỉ quay dữ liệu giả lập và cửa sổ cần trình bày.

**Video dự phòng.** Quay trọn 3 nhóm tình huống chính cùng phiên bản dùng báo cáo Lượt 2, hoặc ghi rõ SHA nếu khác. Dùng YouTube Unlisted hoặc link Drive ai có link cũng xem được theo yêu cầu BTC. Mở cả hai link ở tab ẩn danh, ghi URL và SHA vào `demo/links.md` rồi gửi Thể cập nhật README/Form.

## Slides và mốc sáng thứ Bảy

| Slide | Nội dung cần có |
|---|---|
| 1 | Pain và người dùng. Dùng một trích dẫn ngắn do Gia Bảo xác minh và ghi nguồn. |
| 2 | Lát cắt D1 và demo thiếu món. Nêu mục đích của dữ liệu giả lập. |
| 3 | Kiến trúc, điểm AI phân loại và điểm Python kiểm trần, demo chuyển người. |
| 4 | Hai lượt eval, một cải tiến, số x/N và metric hạn mức. Số liệu lấy từ Hùng. |
| 5 | Chi phí/task thành công, model, URL Vercel và link video dự phòng. |

- **Tối thứ Sáu.** UI gửi được API cùng origin trên Preview. Đã có bản thảo 5 slide và kịch bản 30 giây. Review cách mô tả quy tắc với Gia Bảo.
- **08:00–09:00.** Chạy smoke từ một trình duyệt khác. Quay và xác minh quyền xem video gọi thật.
- **09:00–11:00.** Nhận số liệu Lượt 2, chèn vào slide, quay demo dự phòng và mở lại PDF đã xuất. Thử link từ PDF và `demo/links.md`.
- **Nghiệm thu.** Ba nhóm ca từ bản Production cho kết quả như bảng. `demo-slides.pdf` ở root repo, hai link video mở được ẩn danh. Gửi Thể URL, SHA, vị trí file và tình trạng từng link. Các thay đổi API gửi cho Thể bằng một request/response cụ thể để chủ file xử lý.
