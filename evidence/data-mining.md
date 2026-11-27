# Đào data — cách đếm và kết quả

> Điền ở guide bước 1.2. Ôn lại: ngày 2, ngày 6 · lab ngày 2, lab ngày 6.
> Không đào data thì xoá file này. Script / công thức đếm để trong repo (vd `evidence/count.py` hoặc ghi công thức Sheets ngay dưới), người khác chạy lại phải ra cùng số.
> Repo chỉ chứa số đã tổng hợp và vài dòng ví dụ — không chép lại nguyên file data.

## 1. Cách đếm — viết TRƯỚC khi chạy

> Viết lúc 12:43 ngày 27/11/2026, trước khi chạy collector và trước khi đọc review nào. Người chốt: Gia Bảo. Mọi số liệu ở §3 phải tính theo đúng các quy tắc dưới đây.

**Nguồn và cách thu**

| Nguồn | Trang | Cách thu | Cỡ mẫu đọc tay |
|---|---|---|---|
| Google Play VN | [com.deliverynow](https://play.google.com/store/apps/details?id=com.deliverynow&hl=vi) | Tự động: `scripts/data/collect_gplay.py` (thư viện `google-play-scraper`, `lang="vi"`, `country="vn"`, sắp mới nhất). Thu ~600 review, bỏ trùng theo mã review và nội dung, lọc theo từ khóa, lấy **30 review mới nhất khớp từ khóa**. Đối chiếu vài mẫu với trang chính thức. | 30 |
| App Store VN | [ID 1137866760](https://apps.apple.com/vn/app/shopeefood-food-delivery/id1137866760) | Thủ công: đọc mục Xếp hạng & Nhận xét trên trang web, lấy review gần nhất có nội dung đọc được, ghi tay vào cùng file mẫu với `store=appstore`. Không thử collector. | 10–20 |

- Tổng mẫu đọc tay dự kiến 40–50 review (kế hoạch yêu cầu 20–40, lấy dư để chắc đủ ≥5 trích dẫn).
- Từ khóa lọc (Google Play): thiếu món, thiếu đồ, thiếu, sai món, nhầm món, giao nhầm, giao sai, giao trễ, giao chậm, trễ, chậm, hoàn tiền, hoàn lại, bồi thường, khiếu nại, cskh, chăm sóc khách hàng, tổng đài, hỗ trợ, đền. Danh sách nằm trong script.
- Dữ liệu thô (nội dung review gốc) ở `data/raw/`, đã gitignore, không commit. Script không lưu tên người viết.

**Đếm gì và mẫu số**

| # | Đếm gì | Mẫu số |
|---|---|---|
| 1 | Review khớp từ khóa | Toàn bộ review Google Play thu được sau bỏ trùng |
| 2 | Review nói về một sự cố đơn giao đồ ăn (`su_co_don=y`) | Số review đã đọc tay ở cả hai store |
| 3 | Review nhắc khó khăn khi khiếu nại/hỗ trợ (`kho_khieu_nai=y`) — **số dùng để kiểm giả thuyết, ngưỡng ≥30%** | Số review có `su_co_don=y` |

**Quy tắc gắn nhãn tay**

- `su_co_don = y` khi review kể một đơn cụ thể bị thiếu món, sai món, giao trễ hoặc hỏng/đổ, hoặc kể việc đòi hoàn tiền cho đơn. `n` khi chỉ khen/chê chung, chê giá, phí ship, lỗi ứng dụng không liên quan đơn.
- `loai_su_co`: `thieu_mon` · `sai_mon` · `giao_tre` · `hoan_tien` (chỉ nói chuyện hoàn tiền/hủy đơn) · `khac`.
- `kho_khieu_nai = y` (chỉ xét khi `su_co_don = y`) khi review nhắc ít nhất một ý: không liên hệ được CSKH/tổng đài; phải gửi lại bằng chứng hoặc bị hỏi đi hỏi lại; đã báo nhưng không được hoàn tiền/bồi thường; phản hồi chậm hoặc chỉ là câu trả lời mẫu; không biết khiếu nại ở đâu. Chỉ chê món ăn hoặc tài xế thì `n`.
- Ca phân vân: ghi `n` và ghi lý do vào §2, không ép thành `y`.
- `trich_dan_an_danh`: đoạn ngắn nguyên văn tự đủ nghĩa, đã bỏ tên, tài khoản, số điện thoại, địa chỉ, mã đơn; phần cần che ghi `[đã ẩn]`. Mỗi trích dẫn lấy từ một review khác nhau.

**Script / cách chạy lại**

```bash
pip install google-play-scraper                                        # chỉ cần trên máy thu, không thêm vào requirements.txt
python scripts/data/collect_gplay.py                                  # thu + lọc → data/raw/review_sample.csv
python scripts/data/count_evidence.py data/raw/review_sample.csv --export   # đếm sau khi gắn nhãn → evidence/review_labels.csv
python scripts/data/count_evidence.py evidence/review_labels.csv      # người khác chạy lại từ file đã commit, ra cùng số
```

`evidence/review_labels.csv` chỉ chứa mã `R01`…, store, tháng review, số sao, nhãn và trích dẫn đã ẩn danh, không chứa nội dung review gốc. Review store thay đổi theo thời gian nên chạy lại collector ở ngày khác sẽ ra mẫu khác; số đếm chính thức là số tính từ `evidence/review_labels.csv`.

**Phương án dự phòng (chốt trước)**

Nếu đến **17:00 ngày 27/11/2026** chưa có ≥5 trích dẫn dùng được từ review, phỏng vấn ≥3 người ngoài nhóm có dùng ứng dụng giao đồ ăn, theo `evidence/interviews/TEMPLATE.md`. Hỏi về lần khiếu nại gần nhất, cách liên hệ, thông tin bị hỏi và kết quả. Báo Thể số thật trước khi làm slide.

## 2. Đọc trước, đếm sau

Đã đọc tay 40 review (30 Google Play R01–R30, 10 App Store R31–R40) trước khi chốt số. Các *kiểu* hành vi thấy được:
- Giao trễ 45 phút đến 2 tiếng, nhiều review đổ cho chế độ ghép đơn.
- Đơn bị hủy hoặc thanh toán lỗi nhưng đã trừ tiền, chờ hoàn tiền nhiều tuần đến nhiều tháng.
- Liên hệ hỗ trợ gặp chatbot trả lời lặp, không gọi được tổng đài, báo cáo trong app phản hồi chậm hoặc không phản hồi.
- Thiếu món được bù bằng mã giảm giá thay vì hoàn tiền.
- Ngoài phạm vi: lỗi app/định vị, chính sách phí và voucher, chính sách ghép đơn nói chung, review của tài xế.

Ca phân vân, đã gắn theo quy tắc "phân vân thì `n`":
- R11: bị trừ tiền nhưng không có đơn → `su_co_don=n` vì không có đơn giao đồ ăn cụ thể.
- R17: định vị sai, "không hỗ trợ hủy đơn" → sự cố đơn `khac`, `kho_khieu_nai=n` vì không thuộc 5 ý của định nghĩa.
- R18: người viết là tài xế → `n`.
- R23, R24: đơn bị hủy/không xác nhận, không được hoàn tiền nhưng không nói đã báo hỗ trợ → `kho_khieu_nai=n`.
- R26: hỗ trợ là chatbot nhưng sự việc là mua voucher, không phải đơn giao đồ ăn → `su_co_don=n`.
- R37, R39: chê ghép đơn làm giao lâu nhưng không kể một đơn cụ thể → `n`.

Nhãn gắn nháp với hỗ trợ của AI, Gia Bảo rà lại tay 40/40 dòng.

Kiểm tra và chỗ lệch so với §1:
- Đối chiếu Google Play: 3/3 review đang hiện trên trang chính thức (ngày 22/11 và 26/11/2026) có trong dữ liệu collector, đúng ngày và số sao. Kiểm lúc 13:5x ngày 27/11/2026.
- App Store: §1 dự kiến đọc tay 10–20 review gần nhất và không thử collector. Thực tế trang web chỉ hiện 10 review theo thứ tự mặc định (2018–2021), không có tùy chọn sắp mới nhất; nhóm thử thêm RSS công khai sắp mới nhất của Apple nhưng nhận 0 review. Vì vậy mẫu App Store là 10 review cũ, dùng làm tham khảo.

## 3. Kết quả

| Đếm gì | x / N | % | Ghi chú |
|---|---|---|---|
| (1) Review khớp từ khóa sự cố/khiếu nại | 43/411 | 10% | Google Play, 08/10–26/11/2026: thu 600, bỏ 189 trùng còn 411 |
| (2) Review nói về sự cố đơn giao đồ ăn | 17/40 | 42% | Google Play 15/30, App Store 2/10 |
| (3) Review có sự cố đơn nhắc khó khăn khi khiếu nại/hỗ trợ | **8/17** | **47%** | Google Play 6/15, App Store 2/2. Ngưỡng giả thuyết ≥30% → **đạt**. Riêng Google Play 2026 (6/15 = 40%) cũng đạt |
| Loại sự cố trong 17 review | giao trễ 7 · hoàn tiền 6 · khác 3 · thiếu món 1 · sai món 0 | | |

Chạy lại: `python scripts/data/count_evidence.py evidence/review_labels.csv`.

## 4. ≥5 ví dụ cụ thể (mã dòng / mã đã ẩn danh, không đoán ai là ai)

1. R10 · Google Play · 11/2026 · 1★ — "Quán giao món thiếu, shopfood xử lý bằng cách hoàn mã giảm giá, k hoàn tiền"
2. R29 · Google Play · 10/2026 · 1★ — "đã yêu cầu hỗ trợ nhưng toàn để chat bot hỗ trợ sao mà xử lý được. Gọi số tổng đài thì không liên lạc được."
3. R28 · Google Play · 10/2026 · 1★ — "mỗi lần đơn có vấn đề là t báo cáo lên app, nhưng con tép nó phản hồi lâu kinh khủng"
4. R02 · Google Play · 11/2026 · 1★ — "Đơn hàng bị hủy do ship nhưng 2 tháng trời bên shopee food ko hoàn lại tiền. Đòi t gửi sao kê giấy"
5. R19 · Google Play · 10/2026 · 1★ — "cskh cứ lặp lại 1 câu như đang chat với AI."
6. R35 · App Store · 09/2020 · 1★ — "mình báo cáo thì chưa lần nào được phản hồi lại."

Đủ danh sách 9 trích dẫn ở `evidence/summary.md` §3.

## 5. Giới hạn của data

Data cho biết người ta **làm gì**, không cho biết **vì sao**. Mẫu nhỏ (40 review đọc tay) và chọn theo từ khóa nên lệch về sự cố: không dùng được để ước tính tỷ lệ đơn lỗi thật. Review store lệch về đánh giá thấp (33/40 review mẫu là 1★). App Store chỉ công khai 10 review cũ (2018–2021, thời app còn tên Now) trên trang web, RSS sắp mới nhất trả 0 review, tùy chọn "gần đây nhất" chỉ có trên app iOS; vì vậy số chính dựa vào Google Play 2026, App Store giữ làm tham khảo. Chỉ 1 review về thiếu món và 0 review về sai món, nên bằng chứng mạnh nhất là về khâu hỗ trợ/hoàn tiền và giao trễ, chưa phải riêng cho thiếu/sai món. Không xác minh được đơn hay người viết.
→ Kiểm lại bằng: phỏng vấn ≥3 người dùng ứng dụng giao đồ ăn về lần khiếu nại thiếu/sai món gần nhất (cách liên hệ, thông tin bị hỏi, kết quả), nếu còn thời gian trước CP3.
