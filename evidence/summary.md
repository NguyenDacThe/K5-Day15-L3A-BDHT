# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Người phụ trách: Gia Bảo. Thu và đọc review ngày 27/11/2026, theo đúng đề D1 (thiếu món, sai món, giao trễ). Cách đếm viết trước ở `evidence/data-mining.md` §1, giả thuyết ở `evidence/hypothesis.md`, nhật ký nguồn ở `evidence/source_log.csv`.

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ 5.433 review Google Play, 40 review đọc tay, 14 trích dẫn đúng đề D1 | `evidence/data-mining.md` · `evidence/review_labels.csv` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ Chưa làm | `evidence/interviews/` |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☐ Không làm | `evidence/survey/` |

**Cách thu, ngày 27/11/2026**
- Google Play VN (`com.deliverynow`): thu tự động 10.174 review (5.000 mới nhất + 1.000 liên quan nhất + 3.000 review 1★ + 1.174 review 2★ — Google Play chỉ trả 1.174 review 2★), bỏ 4.741 trùng còn 5.433 bằng `scripts/data/collect_gplay.py`. Lọc theo tình huống D1, đọc tay 40 review (15 thiếu món, 10 sai món, 15 giao trễ; 35/40 thuộc năm 2026).
- Lần thu đầu (600 review mới nhất, 7 tuần) bị thay vì lệch đề: chỉ 1 review thiếu món, 0 sai món. Lý do và thay đổi ghi ở `data-mining.md` §1.
- Ẩn danh: không lưu tên người viết; nội dung gốc chỉ ở `data/raw/` (không commit). Các trích dẫn dưới đây không chứa tên, số điện thoại, địa chỉ hay mã đơn nên không cần `[đã ẩn]`.

## 2. Số chính

- Đào data:
  - Review khớp tình huống D1 (thiếu/sai/trễ): **687/5.433 (13%)** review Google Play. Theo loại: thiếu món 32 · sai món 12 · giao trễ 650.
  - Tình huống khó trên thẻ đề xuất hiện trong 5.433 review: đòi bồi thường/voucher 285 · nhắc khiếu nại/CSKH 217 · khiếu nại nhiều lần 169 · dọa 1 sao/tẩy chay 118.
  - Review nói về sự cố đơn D1: **31/40 (78%)** review đọc tay. Loại: thiếu món 12 · sai món 7 · giao trễ 12.
  - Trong đó nhắc khó khăn khi khiếu nại/hỗ trợ: **13/31 (42%)**. Theo loại: thiếu món 7/12 · sai món 5/7 · giao trễ 1/12.
- Phân bố sao của 40 review đọc tay: 34 review 1★, 4 review 2★, 2 review 4–5★ → mẫu lệch mạnh về đánh giá thấp.
- Ca khiếu nại được xử lý ổn: không có review nào trong mẫu kể đã khiếu nại và được xử lý thỏa đáng.
- Phỏng vấn: chưa làm.
- Khảo sát: không làm.

| Nguồn | Thu được | Trùng | Đọc tay | Có sự cố D1 | Khó khiếu nại | Trích dẫn |
|---|---|---|---|---|---|---|
| Google Play | 10.174 (5.433 sau bỏ trùng) | 4.741 | 40 | 31 | 13 | 14 |

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

Nguồn ghi ở cấp trang app (Google Play VN). Ngày thu: 27/11/2026.

| Mã | Tình huống D1 | Tháng review | Sao | Trích dẫn nguyên văn |
|---|---|---|---|---|
| R108 | Thiếu món | 11/2026 | 1★ | "Quán giao món thiếu, shopfood xử lý bằng cách hoàn mã giảm giá, k hoàn tiền" |
| R120 | Thiếu món | 09/2026 | 1★ | "shop làm thiếu món mà yêu cầu hỗ trợ thì load mãi kh trl" |
| R132 | Thiếu món | 04/2026 | 1★ | "đồ ăn bị thiếu không được hoàn tiền hỗ trợ" |
| R134 | Thiếu món | 01/2026 | 1★ | "giao thiếu, khiếu nại Shopeefood thì nó cho bot nói chuyện, nói tới lui thì đòi gừi theo form báo cáo mà lại bị lỗi ko up ảnh" |
| R136 | Thiếu món | 10/2025 | 1★ | "đơn hàng bị giao thiếu gửi biểu mẫu gần tuần nay mà không phản hồi hay xử lý" |
| R137 | Thiếu món | 10/2025 | 1★ | "cũng chả liên hệ đc với tổng đài shopee để nhờ hỗ trợ" |
| R123 | Sai món | 08/2026 | 1★ | "giao sai đơn+ thiếu món là bên app hay quán giải quyết vậy" |
| R124 | Sai món | 08/2026 | 1★ | "bán sai món nhưng thu đủ tiền" |
| R126 | Sai món | 06/2026 | 1★ | "Quán làm sai món rồi vứt cho khách cái vorcher 15k ko bồi hoàn dc" |
| R130 | Sai món | 05/2026 | 4★ | "khi shipper giao nhầm món thì khi phát hiện ra shipper từ chối quay lại, và nói là do đã đi xa rồi, mà KH cũng ko báo đc cho ai để xử lý?" |
| R135 | Sai món | 01/2026 | 1★ | "sai món k cách nào liên hệ đc tài xế" |
| R139 | Sai món | 07/2025 | 1★ | "dù đã gửi đủ chứng cứ và lịch sử đơn hàng cũng có thể chứng minh app gửi sai món cho quán nhưng vẫn đơn phương kết thúc hỗ trợ" |
| R104 | Giao trễ | 11/2026 | 1★ | "đặt từ 10h37 mà 12h07 mới nhận đồ ăn." |
| R111 | Giao trễ | 11/2026 | 1★ | "đt cho tổng tài thì ko nhận đc kết quả nhắn tin cx ko có tác dụng j hết" |

## 4. Các nguồn có khớp nhau không

Review khớp với trang quy trình của ShopeeFood ở chỗ khiếu nại đi qua CSKH/Trung tâm Hỗ trợ và cần bằng chứng cụ thể. Nhưng trang không nêu thời hạn xử lý hay mức bù, và review cho thấy chính bước này gây khó: biểu mẫu lỗi không gửi được ảnh (R134), gửi biểu mẫu cả tuần không phản hồi (R136), gửi đủ chứng cứ vẫn bị kết thúc hỗ trợ (R139), không biết app hay quán giải quyết (R123). Lệch: với giao trễ, khách chủ yếu bực vì chờ lâu và đồ nguội (1/12 nhắc khó khiếu nại); khó khiếu nại tập trung ở thiếu/sai món (12/19).

## 5. Kết luận

Giả thuyết ở `evidence/hypothesis.md`: **đúng** — 13/31 (42%) review có sự cố D1 nhắc khó khăn khi khiếu nại/hỗ trợ, cao hơn ngưỡng ≥30%. Rõ nhất ở thiếu món (7/12) và sai món (5/7). Pain cụ thể:
1. Thiếu/sai món: khách báo nhưng gặp chatbot, biểu mẫu lỗi, chờ cả tuần không phản hồi hoặc không biết ai giải quyết.
2. Bù không tương xứng: chỉ được mã giảm giá hoặc voucher nhỏ thay vì hoàn đúng phần thiếu/sai.
3. Giao trễ 40 phút đến 2 tiếng là sự cố phổ biến nhất (650/5.433 review khớp), nhưng ít liên quan khâu khiếu nại.

Điều này ủng hộ đúng lát cắt D1: trả ngay phương án có lý do (hoàn đúng phần thiếu/sai trong hạn mức, voucher khi trễ quá ngưỡng) và nói rõ khi chuyển nhân viên.

Điều vẫn chưa biết: tỷ lệ đơn lỗi thật (mẫu chọn theo từ khóa, lệch về 1★); khách nhận được gì khi khiếu nại thành công (không review nào kể trường hợp xử lý ổn). Phỏng vấn ≥3 người về lần gần nhất bị giao thiếu/sai món sẽ kiểm lại phần này.
