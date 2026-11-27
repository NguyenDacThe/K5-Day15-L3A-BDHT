# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Người phụ trách: Gia Bảo. Thu và đọc review ngày 27/11/2026, theo đúng đề D1 (thiếu món, sai món, giao trễ). Cách đếm viết trước ở `evidence/data-mining.md` §1, giả thuyết ở `evidence/hypothesis.md`, nhật ký nguồn ở `evidence/source_log.csv`.

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ 5.433 review Google Play, 40 review đọc tay, 14 trích dẫn đúng đề D1 | `evidence/data-mining.md` · `evidence/review_labels.csv` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ Chưa có phiếu phỏng vấn thực tế. P1–P3 do AI tạo được dùng trong bộ câu thử bổ sung. | [Benchmark bổ sung](../eval/benchmark-supplemental.csv) |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☐ 16/21 phiếu đủ điều kiện, còn thiếu 4 để đạt ngưỡng. | [Câu hỏi](survey/questions.md) · [Phản hồi đã ẩn danh](survey/results.csv) |

**Cách thu, ngày 27/11/2026**
- Google Play VN (`com.deliverynow`): thu tự động 10.174 review (5.000 mới nhất + 1.000 liên quan nhất + 3.000 review 1★ + 1.174 review 2★ — Google Play chỉ trả 1.174 review 2★), bỏ 4.741 trùng còn 5.433 bằng `scripts/data/collect_gplay.py`. Lọc theo tình huống D1, đọc tay 40 review (15 thiếu món, 10 sai món, 15 giao trễ; 35/40 thuộc năm 2026).
- Lần thu đầu (600 review mới nhất, 7 tuần) bị thay vì lệch đề: chỉ 1 review thiếu món, 0 sai món. Lý do và thay đổi ghi ở `data-mining.md` §1.
- Ẩn danh: không lưu tên người viết; nội dung gốc chỉ ở `data/raw/` (không commit). Các trích dẫn dưới đây không chứa tên, số điện thoại, địa chỉ hay mã đơn nên không cần `[đã ẩn]`.

- Google Forms, ngày 27/11/2026. Tệp đính kèm chứa 11 phiếu đầu và bảng đầy đủ nhóm cung cấp có 21 phiếu. Các phiếu được gửi trong khoảng 19:14 đến 19:22 theo dấu thời gian hiển thị. Nhóm gán mã theo thứ tự phiếu và bỏ dấu thời gian chi tiết khỏi [CSV đã ẩn danh](survey/results.csv).

## 2. Số chính

- Đào data:
  - Review khớp tình huống D1 (thiếu/sai/trễ): **687/5.433 (13%)** review Google Play. Theo loại: thiếu món 32 · sai món 12 · giao trễ 650.
  - Tình huống khó trên thẻ đề xuất hiện trong 5.433 review: đòi bồi thường/voucher 285 · nhắc khiếu nại/CSKH 217 · khiếu nại nhiều lần 169 · dọa 1 sao/tẩy chay 118.
  - Review nói về sự cố đơn D1: **31/40 (78%)** review đọc tay. Loại: thiếu món 12 · sai món 7 · giao trễ 12.
  - Trong đó nhắc khó khăn khi khiếu nại/hỗ trợ: **13/31 (42%)**. Theo loại: thiếu món 7/12 · sai món 5/7 · giao trễ 1/12.
- Phân bố sao của 40 review đọc tay: 34 review 1★, 4 review 2★, 2 review 4–5★ → mẫu lệch mạnh về đánh giá thấp.
- Ca khiếu nại được xử lý ổn: không có review nào trong mẫu kể đã khiếu nại và được xử lý thỏa đáng.
- Khảo sát Google Forms
  - **16/21 phiếu đủ điều kiện.** Tất cả tự xác nhận ở ngoài nhóm và đồng ý tham gia. Câu 2 có 4 phiếu trả lời “Không” và 1 phiếu trả lời “Không nhớ”.
  - Ở lần gần nhất, 7/16 chọn thiếu món, 7/16 chọn sai món và 5/16 chọn giao trễ. Câu hỏi cho chọn nhiều sự cố trên một đơn.
  - Kênh xử lý đầu tiên trong 16 phiếu đủ điều kiện gồm ứng dụng ShopeeFood (7), tài xế (5) và quán (4). 8/15 người nhớ số lần liên hệ cho biết đã chủ động liên hệ từ hai lượt trở lên.
  - **13/14 người có câu trả lời xác định ở câu 6 gặp vướng mắc.** Có 8 người khó tìm kênh liên hệ, 6 người phải liên hệ lại hoặc gửi lại thông tin, 4 người không rõ cần bằng chứng gì, 4 người chờ phản hồi lâu hơn dự kiến và 3 người không rõ kết quả hoặc bước tiếp theo. Một người có thể chọn nhiều phương án.
  - Câu 6 loại KS-P18 khỏi mẫu số vì vừa chọn vướng mắc vừa chọn “Không gặp vướng mắc”. Phiếu KS-P21 chọn “Không nhớ”. Cả hai phiếu vẫn tính vào số đủ điều kiện và được lưu nguyên câu trả lời.
  - Kết quả tự báo cáo trong 16 phiếu đủ điều kiện gồm 8 xử lý đầy đủ, 6 xử lý một phần, 1 đã kết thúc nhưng vấn đề còn tồn tại và 1 không nhớ.

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

### Phản hồi mở từ khảo sát

Ba câu dưới đây chép từ câu 10 của khảo sát Google Forms ngày 27/11/2026. Mã phiếu trỏ tới [CSV đã ẩn danh](survey/results.csv).

| Mã phiếu | Tình huống D1 | Trích dẫn nguyên văn |
|---|---|---|
| KS-P01 | Giao trễ hơn giờ hẹn | “vừa phải liên hệ với shiper vừa phải liên hệ với quán” |
| KS-P17 | Giao trễ hơn giờ hẹn | “Tài xế không hỗ trợ, mà báo là bị ghép đơn nên thời gian giao lâu” |
| KS-P19 | Thiếu món | “liên hệ ship thì ship bảo liên hệ quán xong lại phải liên hệ lại với ship lần nữa mới giải quyết xong” |

## 4. Các nguồn có khớp nhau không

Review khớp với trang quy trình của ShopeeFood ở chỗ khiếu nại đi qua CSKH/Trung tâm Hỗ trợ và cần bằng chứng cụ thể. Nhưng trang không nêu thời hạn xử lý hay mức bù, và review cho thấy chính bước này gây khó: biểu mẫu lỗi không gửi được ảnh (R134), gửi biểu mẫu cả tuần không phản hồi (R136), gửi đủ chứng cứ vẫn bị kết thúc hỗ trợ (R139), không biết app hay quán giải quyết (R123). Lệch: với giao trễ, khách chủ yếu bực vì chờ lâu và đồ nguội (1/12 nhắc khó khiếu nại); khó khiếu nại tập trung ở thiếu/sai món (12/19).

Khảo sát cũng ghi nhận khó tìm kênh hỗ trợ và việc phải gửi lại hoặc liên hệ lại. Ngoài ra, 8/16 người trả lời cho biết sự cố đã được xử lý đầy đủ. Khảo sát hỏi trực tiếp về từng vướng mắc và dùng mẫu nhỏ, còn review là lời kể tự phát. Mỗi tỷ lệ chỉ mô tả mẫu mà nó được tính từ đó.

## 5. Kết luận

Giả thuyết ở `evidence/hypothesis.md`: **đúng** — 13/31 (42%) review có sự cố D1 nhắc khó khăn khi khiếu nại/hỗ trợ, cao hơn ngưỡng ≥30%. Rõ nhất ở thiếu món (7/12) và sai món (5/7). Pain cụ thể:
1. Thiếu/sai món: khách báo nhưng gặp chatbot, biểu mẫu lỗi, chờ cả tuần không phản hồi hoặc không biết ai giải quyết.
2. Bù không tương xứng: chỉ được mã giảm giá hoặc voucher nhỏ thay vì hoàn đúng phần thiếu/sai.
3. Giao trễ 40 phút đến 2 tiếng là sự cố phổ biến nhất (650/5.433 review khớp), nhưng ít liên quan khâu khiếu nại.

Điều này ủng hộ đúng lát cắt D1: trả ngay phương án có lý do (hoàn đúng phần thiếu/sai trong hạn mức, voucher khi trễ quá ngưỡng) và nói rõ khi chuyển nhân viên.

Tỷ lệ đơn lỗi trên toàn nền tảng và hình thức xử lý ở các ca thành công vẫn chưa rõ. Khảo sát cho biết kết quả được giải quyết đến đâu, còn mức hoàn tiền hoặc loại bồi thường không được hỏi.
