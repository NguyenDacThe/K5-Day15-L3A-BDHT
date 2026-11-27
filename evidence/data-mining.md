# Đào data — cách đếm và kết quả

> Điền ở guide bước 1.2. Ôn lại: ngày 2, ngày 6 · lab ngày 2, lab ngày 6.
> Không đào data thì xoá file này. Script / công thức đếm để trong repo (vd `evidence/count.py` hoặc ghi công thức Sheets ngay dưới), người khác chạy lại phải ra cùng số.
> Repo chỉ chứa số đã tổng hợp và vài dòng ví dụ — không chép lại nguyên file data.

## 1. Cách đếm — viết TRƯỚC khi chạy

> Viết lúc 16:15, cập nhật lúc 16:21 (mở rộng mẫu, xem cuối mục) ngày 27/11/2026 — trước khi chạy lần thu dùng cho số liệu chính và trước khi đọc mẫu đó. Người chốt: Gia Bảo. Mọi số ở §2–§5 tính theo đúng các quy tắc dưới đây.

**Phạm vi theo đề D1.** Khách báo đơn giao đồ ăn bị thiếu món, sai món hoặc giao trễ; hệ thống đề xuất trong hạn mức hoặc chuyển nhân viên. Chỉ đếm review về ba sự cố này.

**Nguồn và cách thu**

| Nguồn | Trang | Cách thu | Cỡ mẫu đọc tay |
|---|---|---|---|
| Google Play VN | [com.deliverynow](https://play.google.com/store/apps/details?id=com.deliverynow&hl=vi) | Tự động: `scripts/data/collect_gplay.py` (`google-play-scraper`, `lang="vi"`, `country="vn"`). Thu ~5.000 review mới nhất + ~1.000 review "liên quan nhất" + ~3.000 review 1★ và ~1.500 review 2★ mới nhất (khách hay kể sự cố ở review sao thấp), bỏ trùng theo mã review và nội dung. | Tối đa 40 |

- Các file hướng dẫn không quy định số review thu về, chỉ quy định đọc tay 20–40 review và thử collector khoảng 20 phút. Thu ~10.500 review để đủ rộng tìm review thiếu/sai món (rất hiếm) và đạt khoảng 30 review dùng được, chạy trong vài phút.
- Lọc theo tình huống lõi D1 (biểu thức đầy đủ trong script): `thieu_mon` (thiếu món/đồ/phần, giao thiếu, quên món…), `sai_mon` (sai món, nhầm món, giao nhầm/giao sai món…), `giao_tre` (giao trễ/chậm/lâu, chờ/đợi N phút/tiếng…).
- Chọn mẫu đọc tay theo tình huống, mới nhất trước: tối đa 15 review `thieu_mon`, 10 `sai_mon`, phần còn lại là `giao_tre` cho đủ 40 (một review chỉ tính một lần). Mã `R101`…
- Gắn thêm thẻ để đọc, không dùng chọn mẫu, theo các tình huống khó trên thẻ đề: `boi_thuong`, `khieu_nai`, `nhieu_lan` (khiếu nại nhiều lần), `doa_danh_gia` (dọa 1 sao, bóc phốt), `doi_hoan_ca_don` (đòi hoàn 100%/cả đơn).
- Dữ liệu thô (nội dung review gốc) ở `data/raw/`, đã gitignore, không commit. Script không lưu tên người viết.

**Đếm gì và mẫu số**

| # | Đếm gì | Mẫu số |
|---|---|---|
| 1 | Review khớp tình huống lõi D1 (thiếu/sai/trễ) | Toàn bộ review Google Play sau bỏ trùng |
| 2 | Review nói về một sự cố D1 (`su_co_don=y`) | Số review đọc tay |
| 3 | Review nhắc khó khăn khi khiếu nại/hỗ trợ (`kho_khieu_nai=y`) — **số kiểm giả thuyết, ngưỡng ≥30%** | Số review có `su_co_don=y` |

**Quy tắc gắn nhãn tay**

- `su_co_don = y` khi review kể một đơn cụ thể bị thiếu món, sai món hoặc giao trễ (kể cả đòi hoàn tiền/bồi thường cho các sự cố đó). `n` khi chỉ khen/chê chung, chê giá, phí ship, lỗi ứng dụng, khách tự đặt nhầm, đơn bị hủy, lỗi thanh toán, trừ tiền không có đơn.
- `loai_su_co`: `thieu_mon` · `sai_mon` · `giao_tre`.
- `kho_khieu_nai = y` (chỉ xét khi `su_co_don = y`) khi review nhắc ít nhất một ý: không liên hệ được CSKH/tổng đài; phải gửi lại bằng chứng hoặc bị hỏi đi hỏi lại; đã báo nhưng không được hoàn tiền/bồi thường; phản hồi chậm hoặc chỉ là câu trả lời mẫu; không biết khiếu nại ở đâu/ai giải quyết. Chỉ chê món ăn hoặc tài xế thì `n`.
- Ca phân vân: ghi `n` và ghi lý do vào §2, không ép thành `y`.
- `trich_dan_an_danh`: đoạn ngắn nguyên văn tự đủ nghĩa, đã bỏ tên, tài khoản, số điện thoại, địa chỉ, mã đơn; phần cần che ghi `[đã ẩn]`. Mỗi trích dẫn lấy từ một review khác nhau.

**Script / cách chạy lại**

```bash
pip install google-play-scraper                                         # chỉ cần trên máy thu, không thêm vào requirements.txt
python scripts/data/collect_gplay.py                                   # thu + lọc → data/raw/review_sample_d1.csv
python scripts/data/count_evidence.py data/raw/review_sample_d1.csv --export   # đếm sau khi gắn nhãn → evidence/review_labels.csv
python scripts/data/count_evidence.py evidence/review_labels.csv       # người khác chạy lại từ file đã commit, ra cùng số
```

`evidence/review_labels.csv` chỉ chứa mã, nguồn, tháng review, số sao, nhãn và trích dẫn đã ẩn danh, không chứa nội dung review gốc. Review store thay đổi theo thời gian nên chạy lại collector ở ngày khác sẽ ra mẫu khác; số đếm chính thức là số tính từ `evidence/review_labels.csv`.

**Phương án dự phòng.** Nếu chưa có ≥5 trích dẫn đúng đề D1, phỏng vấn ≥3 người ngoài nhóm có dùng ứng dụng giao đồ ăn theo `evidence/interviews/TEMPLATE.md`, hỏi về lần gần nhất bị giao thiếu/sai món hoặc trễ: cách liên hệ, thông tin bị hỏi, kết quả.

**Lần thu trước (đã bỏ).** Lần thu đầu lúc ~12:48 cùng ngày (600 review mới nhất, phủ 7 tuần, cách đếm viết lúc 12:43) lệch đề D1: chỉ 1 review thiếu món, 0 sai món, nhiều review về đơn bị hủy; từ khóa "thiếu", "hỗ trợ", "chậm" quá rộng. Nhóm thu lại theo cách trên. App Store VN không dùng: trang web công khai chỉ hiện 10 review cũ (2018–2021) không có ca D1, RSS sắp mới nhất của Apple trả 0 review. Ngưỡng giả thuyết và định nghĩa `kho_khieu_nai` giữ nguyên giữa hai lần.

**Mở rộng mẫu (16:20).** Lần chạy 2.500 review chỉ cho 19 review đọc tay, 15 dùng được. Để đạt khoảng 30 review dùng được, nhóm tăng số thu lên ~10.500 (thêm review 1★, 2★), mở rộng cách nói thiếu/sai món (giao không đủ, nhận thiếu, nhận nhầm, đơn của người khác, sai size/topping…) và cỡ mẫu đọc tay lên 40 như trên; quy tắc gắn nhãn, mẫu số và ngưỡng không đổi. Số ở §2–§5 tính trên mẫu mở rộng.

## 2. Đọc trước, đếm sau

Thu ngày 27/11/2026 lúc ~16:23: 10.174 review (5.000 mới nhất + 1.000 liên quan nhất + 3.000 review 1★ + 1.174 review 2★ — Google Play chỉ trả 1.174 review 2★), bỏ 4.741 trùng còn 5.433 (03/09/2016–26/11/2026, phần lớn 2025–2026). Mẫu đọc tay 40 review (R101–R140): 15 `thieu_mon`, 10 `sai_mon`, 15 `giao_tre`, mới nhất trước; 35/40 review mẫu thuộc năm 2026.

Các *kiểu* hành vi thấy được:
- Giao trễ 40 phút đến 2 tiếng, gần như luôn đổ cho chế độ ghép đơn; đồ ăn nguội khi tới.
- Thiếu món hoặc sai món, có khi lặp lại nhiều lần; khách không biết app, quán hay tài xế chịu trách nhiệm.
- Khi báo sự cố: gặp chatbot, biểu mẫu báo cáo lỗi không gửi được ảnh, gửi biểu mẫu cả tuần không phản hồi, không gọi được tổng đài, bị kết thúc hỗ trợ dù đủ bằng chứng.
- Bù không tương xứng: thiếu/sai món chỉ được mã giảm giá hoặc voucher 15k thay vì hoàn tiền phần lỗi.
- Ngoài phạm vi D1: khách tự đặt nhầm và không hủy được, hủy đơn, khen chung.

Ca phân vân, gắn theo quy tắc "phân vân thì `n`":
- R105: chê ghép đơn làm giao lâu nhưng không kể một đơn cụ thể → `n`.
- R110, R115: chờ để được hủy đơn, không phải sự cố giao trễ → `n`.
- R113: review 5★ khen, chỉ nhắc "có ship giao trễ xíu nhưng hog sao" → `n`.
- R121, R122, R138: khách tự đặt nhầm món, không hủy được → `n`.
- R129: "quán làm thiếu đồ nhưng shipper phải chịu hết trách nhiệm" — không rõ người viết là khách hay tài xế → `n`.
- R140: chỉ hai chữ "sai món", không đủ ngữ cảnh → `n`.
- R116, R119, R125, R131: kể sự cố lặp lại ("lúc nào cũng", "toàn") thay vì một đơn — đúng loại sự cố D1 → `y`.
- R133: "chính sách giải quyết đơn giao thiếu quá dổm" — có thể là khó khiếu nại nhưng không nêu ý cụ thể nào trong định nghĩa → `kho_khieu_nai=n`.
- R114: kêu gọi tẩy chay (dọa) nhưng không nói chuyện khiếu nại → `kho_khieu_nai=n`.
- R128: "hỗ trợ khách hàng thì lằng nhằng" → `kho_khieu_nai=y` (hỗ trợ chậm/vòng vo).
- R118: trích dẫn trước đây dùng `[đã ẩn]` cho địa bàn; lần này không chọn làm trích dẫn.

Kiểm tra: đã đối chiếu 3/3 review đang hiện trên trang Google Play có trong dữ liệu collector (lần thu đầu); các review R101–R112 của lần trước đều có lại trong mẫu này với cùng nội dung.

Nhãn gắn nháp với hỗ trợ của AI, Gia Bảo rà lại tay 40/40 dòng.

## 3. Kết quả

| Đếm gì | x / N | % | Ghi chú |
|---|---|---|---|
| (1) Review khớp tình huống lõi D1 (thiếu/sai/trễ) | 687/5.433 | 13% | Theo thẻ: thiếu món 32 · sai món 12 · giao trễ 650 |
| Thẻ tình huống khó trên 5.433 review | | | bồi thường/voucher 285 · khiếu nại/CSKH 217 · khiếu nại nhiều lần 169 · dọa 1 sao/tẩy chay 118 · đòi hoàn cả đơn 0 |
| (2) Review nói về sự cố đơn D1 | 31/40 | 78% | Mẫu chọn theo từ khóa thiếu/sai/trễ |
| (3) Review có sự cố đơn nhắc khó khăn khi khiếu nại/hỗ trợ | **13/31** | **42%** | Ngưỡng giả thuyết ≥30% → **đạt** |
| Loại sự cố trong 31 review | thiếu món 12 · sai món 7 · giao trễ 12 | | |
| Khó khiếu nại theo loại | thiếu món 7/12 · sai món 5/7 · giao trễ 1/12 | | |

Chạy lại: `python scripts/data/count_evidence.py evidence/review_labels.csv`.

## 4. ≥5 ví dụ cụ thể (mã dòng / mã đã ẩn danh, không đoán ai là ai)

1. R108 · 11/2026 · 1★ · thiếu món — "Quán giao món thiếu, shopfood xử lý bằng cách hoàn mã giảm giá, k hoàn tiền"
2. R134 · 01/2026 · 1★ · thiếu món — "giao thiếu, khiếu nại Shopeefood thì nó cho bot nói chuyện, nói tới lui thì đòi gừi theo form báo cáo mà lại bị lỗi ko up ảnh"
3. R136 · 10/2025 · 1★ · thiếu món — "đơn hàng bị giao thiếu gửi biểu mẫu gần tuần nay mà không phản hồi hay xử lý"
4. R126 · 06/2026 · 1★ · sai món — "Quán làm sai món rồi vứt cho khách cái vorcher 15k ko bồi hoàn dc"
5. R123 · 08/2026 · 1★ · sai món — "giao sai đơn+ thiếu món là bên app hay quán giải quyết vậy"
6. R104 · 11/2026 · 1★ · giao trễ — "đặt từ 10h37 mà 12h07 mới nhận đồ ăn."

Đủ danh sách 14 trích dẫn ở `evidence/summary.md` §3.

## 5. Giới hạn của data

Data cho biết người ta **làm gì**, không cho biết **vì sao**. Review thiếu/sai món hiếm trên store (32 + 12 trong 5.433 review), nên nhóm thu thêm review 1★/2★ để tìm; vì vậy mẫu lệch mạnh về đánh giá thấp (38/40 review mẫu là 1–2★) và không dùng được để ước tính tỷ lệ đơn lỗi thật. Mẫu chọn theo từ khóa, mới nhất trước; 5/40 review cũ hơn 2026 (2022–2025). Tỷ lệ theo loại có mẫu số nhỏ (7–12 review). Chỉ dùng một nguồn là Google Play (lý do ở §1). Không xác minh được đơn hay người viết.
→ Kiểm lại bằng: phỏng vấn ≥3 người dùng ứng dụng giao đồ ăn về lần gần nhất bị giao thiếu/sai món (cách liên hệ, thông tin bị hỏi, kết quả).
