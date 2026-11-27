# Liên kết demo

| Hạng mục | URL | SHA đã quay |
|---|---|---|
| Video 30 giây gọi model thật | Chờ Đông cập nhật | |
| Video demo dự phòng | Chờ Đông cập nhật | |

Chưa quay hoặc xuất bản video. Chỉ điền SHA của bản thực sự được quay sau khi commit/triển khai; SHA nền của checkout không thay thế SHA bản quay.

## Điều kiện quay

- Thể cung cấp URL Preview/Production, SHA, model đã gọi thành công và một response `meta.mode=live`, `meta.ai_used=true`.
- Gia Bảo và Hùng xác nhận fixture/quy tắc đã tích hợp: D1-001 thiếu khoai 35.000đ, vượt mức chuyển xem xét 0đ, D1-004 trễ 30 phút chưa bồi thường, D1-005 trễ 31 phút đề xuất voucher 50.000đ.
- Xác minh phản hồi meta.mode=live, meta.ai_used=true trên URL thực sự dùng để quay.
- Response bị chặn trong kiểm thử trình duyệt chỉ là dữ liệu test, kể cả khi chứa metadata live. Không dùng làm bằng chứng gọi model thật.

## Kịch bản video gọi model thật · 30 giây

| Thời gian | Thao tác / hình ảnh | Lời dẫn gợi ý |
|---|---|---|
| 0–5 giây | Mở URL live đã xác minh, giữ tiêu đề Hỗ trợ đơn hàng trong khung hình. | “Đây là BDHT Food Support, bản thử nghiệm cho khiếu nại đơn giao đồ ăn.” |
| 5–15 giây | Nhập D1-001 và mô tả thiếu khoai, bấm “Kiểm tra phương án”. | “Khách nhập mã đơn và mô tả phần khoai bị thiếu.” |
| 15–25 giây | Chờ API; chỉ khi kết quả thật tới mới chỉ vào 35.000đ, D1-MISSING và nhãn AI hỗ trợ. | “AI hiểu sự cố; Python đối chiếu dữ liệu đã xác minh và trả mức đề xuất.” |
| 25–30 giây | Giữ màn kết quả và dòng giới hạn sử dụng. | “Đây là đề xuất hoàn phần bị ảnh hưởng. Chưa thực hiện chi trả.” |

Không cắt ghép một response mock thành lượt gọi AI thành công. Nếu model lỗi hoặc số tiền không như kỳ vọng, dừng quay, ghi lỗi và nhờ chủ Backend kiểm tra trước khi thử lại.

## Video demo dự phòng

Quay trên cùng build đã dùng Lượt 2; nếu khác, ghi rõ SHA và giới hạn so sánh.

1. Hiện URL và build được quay. Nêu rõ các ca trong video dùng đơn thử nghiệm.
2. Thiếu khoai D1-001 → đề xuất 35.000đ; trình bày rule và phương thức xử lý thực tế.
3. Yêu cầu cả đơn 500.000đ → cần nhân viên xem xét, 0đ; việc chuyển người là mô phỏng.
4. D1-004 rồi D1-005 → so sánh kết quả ở biên 30/31 phút. UI chỉ hiển thị response Backend.
5. Bỏ mã đơn → cần bổ sung; chỉ ra rằng khách có thể sửa dữ liệu rồi kiểm tra lại.
6. Kết thúc bằng giới hạn, số liệu eval/chi phí đã xác minh và link bản chạy.

Khi mạng lỗi trong buổi trình bày, mở bản video đã quay và ghi rõ build, thời điểm quay. Không thay response mạng lỗi bằng dữ liệu thành công giả.

## Bản thảo 5 slide theo phân công Đông

Đây là outline nội dung, chưa phải deck hoàn chỉnh và chưa xuất `demo-slides.pdf`. `slides/outline.md` hiện là mẫu chung 8 trang; bản phân công `03-phan-cong-dong.md` yêu cầu 5 trang nên outline bên dưới theo phân công cá nhân.

| Slide | Nội dung | Nguồn / thông tin còn chờ |
|---|---|---|
| 1 · Người dùng và pain | Khách vừa nhận đơn thiếu/sai/trễ, khó biết phải bổ sung gì; một trích dẫn đã ẩn danh cùng số mẫu. | Gia Bảo: `evidence/summary.md`, nguồn, phương thức thu và giới hạn mẫu. Chưa có số để trình bày. |
| 2 · Lát cắt D1 | Một khách, một đơn mẫu, một phương án có căn cứ. Demo thiếu khoai 35.000đ và ghi rõ đây là mức giả lập. | `spec.md` §4; fixture đã tích hợp và kết quả API do nhóm xác nhận. |
| 3 · Kiến trúc và kiểm soát | Form → API → AI phân loại → Python đối chiếu fixture/quy tắc → đề xuất; minh họa ca vượt quyền. | `spec.md` §4, contract, bản service đã tích hợp của Thể. |
| 4 · Hai lượt đánh giá | Bộ câu thử, x/N, Run ID, SHA, metric trước/sau, một lỗi thật và thay đổi tương ứng. | Hùng: `eval/report.md`, hai run, benchmark đã khóa và hạn mức. Không lấy số kiểm thử Frontend thay số eval AI. |
| 5 · Chi phí và bàn giao | Chi phí/task thành công, số phiên đo/mô phỏng, model, giới hạn, URL Vercel và video dự phòng. | Hùng: `cost/cost-estimate.md`; Thể: URL/build/model; Đông: video mở được ẩn danh. |

## Thông tin cần nhận trước khi chốt

| Người | Cần bàn giao |
|---|---|
| Thể | Build live, URL, SHA, model ID, response gọi thật thành công; xác nhận deploy đọc được fixture và static files. Cập nhật changelog `spec.md` §10 nếu thay đổi thuộc mốc sau CP2. |
| Gia Bảo | Fixture `demo-1` đã merge; xác nhận alias/mốc giao; một trích dẫn, nguồn và số đếm bằng chứng đã kiểm. |
| Hùng | Hai Run ID/SHA, x/N, bốn metric trước/sau, lỗi đã sửa, số phiên đo/gọi model/mô phỏng, token và chi phí/task thành công có nguồn giá. |
| Đông | Quay hai video; mở link ở tab ẩn danh; ghi đúng SHA; chèn số liệu có nguồn vào slide, xuất và kiểm PDF, bàn giao cho Thể. |

Chưa có link video, URL triển khai hoặc số eval/chi phí được xác minh trong phiên Frontend này. Không điền số hoặc link thay thế.
