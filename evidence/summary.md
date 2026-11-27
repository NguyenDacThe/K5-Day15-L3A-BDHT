# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Người phụ trách: Gia Bảo. Thu và đọc review ngày 27/11/2026. Cách đếm viết trước ở `evidence/data-mining.md` §1, giả thuyết ở `evidence/hypothesis.md`, nhật ký nguồn ở `evidence/source_log.csv`.

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ 40 review đọc tay từ 2 store, 9 trích dẫn | `evidence/data-mining.md` · `evidence/review_labels.csv` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ Chưa làm | `evidence/interviews/` |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☐ Không làm | `evidence/survey/` |

**Cách thu, ngày 27/11/2026**
- Google Play VN (`com.deliverynow`): thu tự động 600 review mới nhất, bỏ 189 trùng còn 411 (08/10–26/11/2026) bằng `scripts/data/collect_gplay.py`, lọc từ khóa, đọc tay 30 review mới nhất khớp từ khóa.
- App Store VN (ID `1137866760`): đọc tay cả 10 review mà trang công khai hiển thị (11/2018–04/2021). RSS sắp mới nhất của Apple trả 0 review. Trang web không có tùy chọn sắp "gần đây nhất" (chỉ có trên app iOS), nên nhóm không lấy được review App Store mới hơn và giữ 10 review này làm tham khảo.
- Bộ lọc: thiếu món, sai món, giao trễ/chậm, hoàn tiền, bồi thường, khiếu nại, CSKH, tổng đài, hỗ trợ và cách nói tương đương (danh sách đủ trong script).
- Ẩn danh: không lưu tên người viết; nội dung gốc chỉ ở `data/raw/` (không commit). Các trích dẫn dưới đây không chứa tên, số điện thoại, địa chỉ hay mã đơn nên không cần `[đã ẩn]`.

## 2. Số chính

- Đào data:
  - Review khớp từ khóa sự cố/khiếu nại: **43/411 (10%)** review Google Play.
  - Review nói về sự cố đơn giao đồ ăn: **17/40 (42%)** review đọc tay (Google Play 15/30, App Store 2/10).
  - Trong đó nhắc khó khăn khi khiếu nại/hỗ trợ: **8/17 (47%)** (Google Play 6/15, App Store 2/2).
  - Loại sự cố trong 17 review: giao trễ 7 · hoàn tiền đơn bị hủy/lỗi thanh toán 6 · khác 3 · thiếu món 1 · sai món 0.
- Phân bố sao của 40 review đọc tay: 33 review 1★, 7 review 2–5★ → mẫu lệch mạnh về đánh giá thấp.
- Ca khiếu nại được xử lý ổn: không có review nào trong 40 review mẫu kể đã khiếu nại và được xử lý thỏa đáng.
- Phỏng vấn: chưa làm.
- Khảo sát: không làm.

| Nguồn | Thu được | Trùng | Đọc tay | Có sự cố đơn | Khó khiếu nại | Trích dẫn |
|---|---|---|---|---|---|---|
| Google Play | 600 (411 sau bỏ trùng) | 189 | 30 | 15 | 6 | 7 |
| App Store | 10 | 0 | 10 | 2 | 2 | 2 |
| **Tổng** | | | **40** | **17** | **8** | **9** |

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

Nguồn ghi ở cấp trang app. Ngày thu: 27/11/2026.

| Mã | Nguồn | Tháng review | Sao | Trích dẫn nguyên văn |
|---|---|---|---|---|
| R10 | Google Play | 11/2026 | 1★ | "Quán giao món thiếu, shopfood xử lý bằng cách hoàn mã giảm giá, k hoàn tiền" |
| R29 | Google Play | 10/2026 | 1★ | "đã yêu cầu hỗ trợ nhưng toàn để chat bot hỗ trợ sao mà xử lý được. Gọi số tổng đài thì không liên lạc được." |
| R28 | Google Play | 10/2026 | 1★ | "mỗi lần đơn có vấn đề là t báo cáo lên app, nhưng con tép nó phản hồi lâu kinh khủng" |
| R02 | Google Play | 11/2026 | 1★ | "Đơn hàng bị hủy do ship nhưng 2 tháng trời bên shopee food ko hoàn lại tiền. Đòi t gửi sao kê giấy" |
| R19 | Google Play | 10/2026 | 1★ | "cskh cứ lặp lại 1 câu như đang chat với AI." |
| R22 | Google Play | 10/2026 | 1★ | "Muốn liên hệ tổng đài thì không có bất cứ thông tin gì." |
| R14 | Google Play | 11/2026 | 1★ | "Đơn tới mình thì thiếu sót đồ, không thì đồ ăn nguội lạnh" |
| R34 | App Store | 06/2020 | 1★ | "mình đã gọi bên bộ phận chăm sóc khách hàng rồi nhưng chỉ kêu "đợi"" |
| R35 | App Store | 09/2020 | 1★ | "mình báo cáo thì chưa lần nào được phản hồi lại." |

## 4. Các nguồn có khớp nhau không

Hai store khớp nhau ở khâu hỗ trợ: review Google Play 2026 và App Store 2020 đều kể đã báo nhưng không được phản hồi hoặc chỉ được bảo chờ, và chưa được hoàn tiền. Trang quy trình của ShopeeFood mô tả CSKH tiếp nhận khiếu nại qua email hoặc Trung tâm Hỗ trợ trong app và yêu cầu bằng chứng cụ thể, nhưng không nêu thời hạn xử lý hay mức hoàn tiền; review cho thấy khách không biết khi nào và bằng cách nào được xử lý. Lệch: review nói nhiều về giao trễ và hoàn tiền đơn bị hủy hơn là thiếu/sai món (chỉ 1 review thiếu món).

## 5. Kết luận

Giả thuyết ở `evidence/hypothesis.md`: **đúng** — 8/17 (47%) review có sự cố đơn nhắc khó khăn khi khiếu nại/hỗ trợ, cao hơn ngưỡng ≥30%. Riêng Google Play (review 10–11/2026) cũng đạt: 6/15 (40%) và 7 trích dẫn, nên kết luận không phụ thuộc vào 10 review App Store cũ. Pain nổi bật: gửi khiếu nại xong không biết kết quả, gặp chatbot trả lời lặp hoặc không liên lạc được tổng đài, và không được hoàn tiền (hoặc chỉ được bù mã giảm giá). Điều này ủng hộ việc trả lời ngay một phương án có lý do và mã quy tắc thay vì chờ phản hồi.

Điều vẫn chưa biết: tỷ lệ đơn lỗi thật (mẫu chọn theo từ khóa và lệch về 1★); trải nghiệm khiếu nại riêng cho thiếu/sai món (mẫu chỉ có 1 review thiếu món); review App Store mới (trang công khai chỉ hiện review 2018–2021). Phỏng vấn ≥3 người về lần khiếu nại thiếu/sai món gần nhất sẽ kiểm lại phần này nếu còn thời gian.
