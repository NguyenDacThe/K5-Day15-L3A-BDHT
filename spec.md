# AI SPEC — Khiếu nại đơn giao đồ ăn · Nhóm BDHT · Lớp L3A

> Mốc nộp: §7 chốt chuẩn "đạt" tại **CP2 19:30 Thứ Sáu 27/11** · §0–§7 nộp **CP3 10:00 Thứ Bảy 28/11** · đủ §0–§10 **CP4 14:30 Thứ Bảy 28/11** · §10 changelog ghi tiếp đến **23:59 Thứ Bảy 28/11**.
> Đầu mỗi mục ghi bước guide (`02-guide.md` trong repo đề) chỉ cách điền. Mỗi mục ngắn, có số và nguồn; chi tiết để ở file được trỏ tới. Xoá dòng hướng dẫn trong ngoặc vuông khi điền xong.

Track: [ ] A · [ ] B · [ ] C · [x] D · [ ] E — bài D1, khiếu nại đơn giao đồ ăn.
Data BTC cấp đã dùng (nếu có — không commit nguyên file): Chưa dùng ở mốc khởi tạo.

## §0. Hiện tại việc này diễn ra thế nào *(guide 1.1)*
- Luồng hiện tại của việc này, trong khoá hoặc trên app thật (3–5 bước; ảnh chụp từ tài khoản của mình, đã che thông tin):
- Công cụ / AI đang được dùng cho việc này (nếu có) + nguồn. Không kiểm được thì ghi "chưa kiểm":

## §1. Người dùng & bằng chứng *(guide 1.1, 1.2)*
- Người dùng chính (một vai cụ thể): Khách đặt đồ ăn qua ứng dụng, vừa nhận đơn gặp sự cố.
- Việc họ cố làm xong: Gửi khiếu nại cho đơn giao thiếu, sai món hoặc giao trễ.
- Hôm nay họ giải bằng gì, hỏng ở đâu, vì sao chưa bỏ: Giả thuyết của nhóm là khách gửi yêu cầu qua kênh hỗ trợ và có thể phải bổ sung bằng chứng nhiều lần.
- Pain: Khách đang khiếu nại khó biết cần cung cấp thông tin nào và được xử lý ra sao.
- Bằng chứng — số chính + kết luận: Gia Bảo sẽ thu review ShopeeFood trên hai store Việt Nam và cập nhật `evidence/summary.md`.

## §2. Impact & quyết định chọn *(guide 1.3)*

| Hướng | Bao nhiêu người gặp | Bao nhiêu lần / tháng | Mỗi lần tốn gì | Impact / tháng | Làm kịp không | Chọn? |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

- **Impact / tháng** của hướng chọn = __ người × __ lần × __ phút = __ — nguồn từng thừa số: __ (không có nguồn thì ghi rõ *(tự ước tính)*)
- Hướng ĐÃ LOẠI + vì sao (giữ lại, đừng xoá):
- Số lần / tháng của từng kiểu người dùng (dùng cho persona ở §8):

## §3. Giải pháp tương tự *(guide 2.1)*
- [sản phẩm / tính năng gần giống]: một điều đáng học · một điều đáng né · mình khác gì

## §4. Thiết kế *(guide 2.2, 3.2)*
- **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả): Khách gửi khiếu nại về đơn mẫu, AI nhận diện loại sự cố và hệ thống trả phương án dựa trên dữ kiện và quy tắc của đơn.
- Không làm (≥3 điều): Hoàn tiền thật, cấp voucher thật, liên hệ nhân viên thật hoặc truy cập đơn thật.
- **Sơ đồ**

  ```mermaid
  flowchart LR
      A["Nhập mã đơn và mô tả"] --> B["Kiểm tra đầu vào"]
      B --> C["AI phân loại và trích tên món"]
      C --> D["Python đối chiếu đơn, bằng chứng và trần"]
      F["Đơn và quy tắc demo"] --> D
      D --> E["Phương án, lý do và mã quy tắc"]
      B -->|"Thiếu dữ kiện hoặc yêu cầu cần chặn"| E
      C -->|"Lỗi model"| E
  ```

- **Hình dạng:** [x] workflow cố định · [ ] một agent · [ ] nhiều agent. AI chỉ phân loại và trích thông tin. Python đối chiếu dữ liệu và tính hạn mức để mỗi kết quả có thể kiểm tra lại.
- **AI dựa vào đâu** — các bước và dữ liệu dự kiến khi tích hợp:

  | Công cụ | Input | Output | Tác động ra ngoài? |
  |---|---|---|---|
  | Phân loại khiếu nại | Mô tả sự cố | Loại sự cố, cụm tên món, loại yêu cầu bồi thường | Gọi model ở chế độ live |
  | Tra đơn và quy tắc | Mã đơn, loại sự cố, tên món | Dữ kiện xác minh và quy tắc demo áp dụng | Đọc JSON trong repo |

- **Mức tự động:** [x] AI gợi ý, người quyết · [ ] AI tự làm khi chắc, chuyển người khi không · [ ] AI tự làm. Quyết định sai có thể ảnh hưởng đến khách và cửa hàng nên ca vượt quyền cần người xem xét.
- **Chỗ chặn rủi ro:** Python kiểm schema của model, đối chiếu bằng chứng, hạn mức và số tiền khách yêu cầu trước khi đề xuất. Thiếu dữ kiện thì hỏi thêm. Lỗi model hoặc vượt mức thì chuyển xem xét. Từ chối yêu cầu tiết lộ dữ liệu cá nhân hoặc bỏ qua bước duyệt.
- **Chỗ người duyệt:** Nhân viên quyết định có thực hiện hoàn tiền, cấp voucher hoặc xử lý trường hợp đặc biệt.
- **Nguyên tắc thiết kế** (≥3, bắt buộc G10):

  | Nguyên tắc | Chỗ cụ thể trên sơ đồ / trong bản chạy thử |
  |---|---|
  | G10 — thu hẹp phạm vi khi không chắc | Hỏi thêm khi không xác định được đơn, món hoặc bằng chứng. |
  | Đối chiếu với dữ kiện xác minh | Mã quy tắc và số tiền đến từ fixture, không lấy từ nội dung model sinh. |
  | Chuyển người khi vượt quyền | Python trả `ESCALATE` và 0đ khi ca cần nhân viên xem xét. |

- Phần nào còn giả: Đơn, quy tắc và mọi thao tác bồi thường hoặc chuyển người đều mô phỏng. Bản khung hiện trả `meta.mode=mock`, `meta.ai_used=false`.

- **Hợp đồng fixture**
  - `data/demo/orders.json` là mảng đơn. Mỗi đơn có `order_id`, `amount_paid_vnd`, `promised_at`, `delivered_at` và `items`. Mỗi mốc dùng ISO 8601 có múi giờ hoặc `null`. Mỗi món có `item_id`, `name`, `aliases`, `qty`, `unit_paid_vnd`, `missing_qty` và `wrong_qty`. Số lượng sự cố bằng `null` khi chưa xác minh, bằng 0 khi xác minh đã giao đúng hoặc đủ.
  - `data/demo/policies.json` có `version: demo-1`, `kind: demo` và mảng `rules`. Mỗi quy tắc có `rule_id`, `issue_type` và `max_amount_vnd`. Quy tắc giao trễ thêm `late_after_minutes` và `voucher_vnd`.
  - `D1-MISSING` và `D1-WRONG` đề xuất hoàn theo giá trị phần đã xác minh, tối đa 50.000đ. Ca thiếu khoai trong đơn `D1-001` có mức đề xuất 35.000đ. Yêu cầu vượt mức cho phép thì chuyển nhân viên.
  - `D1-LATE` đề xuất voucher 50.000đ khi giao muộn hơn 30 phút. `D1-004` trễ đúng 30 phút và `D1-005` trễ 31 phút.

## §5. Chỗ khó — 4 lớp + ≥6 kịch bản + 2 tấn công *(guide 2.3)*

| Kịch bản | Lớp (1–4) | Hành vi mong muốn (nói gì, hiện gì, cho làm gì tiếp) | Câu thử |
|---|---|---|---|
|  |  |  |  |
| *(tấn công)* |  |  |  |
| *(tấn công)* |  |  |  |

(1) nguồn sự thật · (2) mơ hồ / thiếu thông tin · (3) ngoài phạm vi / thẩm quyền · (4) đặc thù lĩnh vực (sai thì người dùng mất gì đắt nhất)

## §6. Bốn đường đi của trải nghiệm
- Mọi thứ suôn sẻ: · Không chắc (lớp 2): · Không có căn cứ (lớp 1): · Người dùng sửa:
- Bị đòi ngoài phạm vi (lớp 3): · Trường hợp đặc thù lĩnh vực (lớp 4):

## §7. Đánh giá & chuẩn "đạt" *(guide 2.4, 4.1)*
- Data card: `data/DATA_CARD.md` · bộ câu thử: `eval/benchmark.csv`. Mục tiêu là 24 ca, gồm ít nhất 5 ca khó và 2 ca từ chối. Metric nằm ở `eval/metric_spec.yaml`.
- **Chuẩn "đạt"** (chốt trước CP2): 100% phản hồi trong hạn mức, ≥85% quyết định đúng (ít nhất 21/24), ≥90% tham chiếu quy tắc đúng trên các ca có quy tắc kỳ vọng và 100% ca cần từ chối được chặn.
- Một task thành công khi đúng quyết định, số tiền, tham chiếu quy tắc và yêu cầu an toàn. Ca cần AI bị lỗi model tính trượt.
- Kết quả: Chưa chạy Lượt 1 và Lượt 2. Sau khi chạy, ghi số câu đạt, tỷ lệ và Run ID vào `eval/report.md` và `eval/README.md`.

## §8. Chi phí khi dùng thật *(guide 4.2)*
- Persona + giá: `cost/personas.yaml` · lượt mô phỏng: `cost/simulate-__.csv` (__ phiên)
- Chi phí / task thành công: __ (model __) · __ (model __)
- Chi phí / tháng ở quy mô thật: thấp __ · cơ sở __ · cao __ → chi tiết `cost/cost-estimate.md`
- So với impact / người / tháng (§2): đáng làm không, vì sao:

## §9. Rủi ro & an toàn
- Dữ liệu: đã ẩn danh gì, không thu gì, không đưa gì vào model gói miễn phí:
- AI **không được** làm gì kể cả khi người dùng yêu cầu:
- Ai có thể bị hại nếu AI sai, và nhóm chặn thế nào:

## §10. Phân công & changelog
- Phân công có tên: Thể phụ trách tích hợp và nộp bài. Đông phụ trách UI, slide và video. Gia Bảo phụ trách fixture, crawl review và bằng chứng. Hùng phụ trách rules, benchmark, chấm và mô phỏng.
- Dùng AI vào việc gì: Codex hỗ trợ dựng khung repo và schema theo tài liệu nhóm. Thể rà contract và kết quả chạy thử. Chi tiết ở `docs/ai-usage.md`.
- Nhật ký thay đổi — **mọi thay đổi sau CP2 19:30 Thứ Sáu 27/11 phải có dòng ở đây**:

**CP2 → CP4** (vd thu hẹp lát cắt, hỏi thêm người dùng, lần cải tiến trước lượt 2)

| Thời điểm | Đổi gì | Vì sao (trỏ về câu thử / lỗi / bằng chứng nào) |
|---|---|---|
|  |  |  |

**Sau CP4 (đến 23:59 Thứ Bảy 28/11)** (sửa theo góp ý — không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
|  |  |  |
