# Hùng · Quy tắc bồi thường, chấm và mô phỏng chi phí

**Giao core thiếu món và 10 câu đầu trong 120 phút từ lúc bắt đầu.** Chốt Lượt 2 và mô phỏng trước 10:30 thứ Bảy 28/11/2026, giờ Việt Nam. Nhánh `feat/hung-rules-eval`. Nếu core đã merge, ghi kết quả chạy trên nhánh mới `feat/hung-eval-run` tạo từ `main`. [Kế hoạch chung](01-plan-hackathon-d1.md)

## Phần Hùng sở hữu

| File hoặc đường dẫn | Nội dung |
|---|---|
| `src/d1/repository.py`, `src/d1/rules.py` | Đọc fixture, tra đơn và policy, quyết định, câu trả lời theo mẫu. |
| `src/d1/eval_runner.py`, `tests/test_rules.py`, `tests/test_eval.py` | Chấm định lượng, ghi run và mô phỏng theo kết quả thật. |
| `eval/benchmark.csv`, `metric_spec.yaml` | Bộ câu thử, tiêu chí, ngưỡng và mẫu số. Dùng path/header của starter nếu có. |
| `eval/run-1.csv`, `eval/run-2.csv`, `eval/report.md` | Hai lượt thực tế và so sánh. `eval/live-sessions.csv` lưu telemetry các phiên đo chi phí. |

## Core có thể viết ngay với fixture trong test

1. Nhận schema từ Thể. Triển khai `decide(request, classify) -> ComplaintResult`. Dùng callback mock trong test để kiểm mã, loại sự cố và tên món. Gửi Thể chữ ký và bộ `reason_code` để nối qua `handle_complaint`.
2. Dùng `Path(__file__).resolve()` để định vị `data/demo/`. Validate ID đơn/rule duy nhất, số tiền nguyên từ 0 trở lên, số lượng xác minh trong phạm vi, mốc có múi giờ và trần hợp lệ. Với file fixture hoặc rule bắt buộc bị thiếu hoặc sai, trả ca chuyển người với 0đ và reason rõ.
3. Chuyển người với ca dị vật/ngộ độc/dị ứng sau khi ăn. Sau đó chặn yêu cầu tiết lộ dữ liệu hoặc bỏ qua kiểm duyệt, tra mã đơn, gọi `classify` và tra rule theo loại sự cố. Với đơn rỗng/không tồn tại thì hỏi mã. Với loại `UNKNOWN` thì hỏi rõ sự cố. Với model lỗi thì trả `ESCALATE / MODEL_UNAVAILABLE`.
4. Chuẩn hóa tên món và alias, cần khớp đúng một dòng của đơn. Khi đã biết loại sự cố nhưng thiếu tên, tên nhập mơ hồ hoặc chưa có bằng chứng, hỏi thêm với reason phù hợp. Với giao trễ, so trực tiếp hiệu hai timestamp với `timedelta(minutes=rule.late_after_minutes)`.
5. Tính giá trị ảnh hưởng từ số lượng đã xác minh và đơn giá thực trả. Mức được phép là phần đủ điều kiện trong trần. Nếu giá trị ảnh hưởng vượt `max_amount_vnd` hoặc khách yêu cầu cao hơn mức được phép, trả `ESCALATE` với 0đ. Nếu mức được phép bằng 0 và không có yêu cầu vượt mức, trả `NO_COMPENSATION`. Tính yêu cầu hoàn toàn đơn bằng `amount_paid_vnd`. So mức lớn hơn nếu có cả yêu cầu toàn đơn và số tiền nhập tay. Kết hợp kiểm tra cụm “hoàn 100%” và cờ triage. Khi câu có yêu cầu theo số tiền nhưng trường số tiền còn trống, hỏi để xác nhận. Duy trì cùng mức đề xuất với cùng dữ kiện dù lời lẽ đe dọa hoặc có nhắc đến khiếu nại nhiều lần.
6. Kiểm đầu ra ở một chỗ trước khi trả. Đề xuất hoàn/voucher cần trần hợp lệ, căn cứ định lượng và `policy_ref` từ fixture. Mọi quyết định khác có 0đ. Viết `reply` bằng mẫu server để thống nhất ý nghĩa “đề xuất” và “chuyển xem xét”.

### Test ưu tiên

| Ca | Kết quả kiểm bằng code |
|---|---|
| `D1-001` thiếu 1 phần khoai | 35.000đ, `D1-MISSING / demo-1`. |
| Cùng đơn đòi hoàn cả 500.000đ hoặc nhập yêu cầu 50.000đ | `ESCALATE`, 0đ. Khoản tối đa của ca thiếu khoai là 35.000đ. |
| Thiếu món giá 65.000đ | `ESCALATE`, 0đ theo trần demo 50.000đ. |
| Trễ 29 phút, 30 phút, 31 phút | Hai ca đầu 0đ. Ca 31 phút đề xuất voucher 50.000đ. |
| Tên lẫn nhiều món, món ngoài đơn hoặc chưa có bằng chứng | `ASK_INFO`, 0đ. |
| Đòi dữ liệu cá nhân, ra lệnh bỏ kiểm duyệt | `REFUSE`, 0đ. |
| Nghi ngộ độc, fixture sai, model timeout | `ESCALATE`, 0đ, reason riêng mỗi loại. |

## Benchmark và chấm

1. Tạo 10 câu đầu theo mẫu BTC, gồm luồng chính, ca tiền vượt mức, thiếu mã đơn, các biên thời gian và hai ca từ chối. Mở rộng thành 24 câu trước khi chấm Lượt 1. Chốt ground truth cùng Gia Bảo từ fixture cuối.
2. Lưu mã ca, mô tả, mã đơn, số tiền yêu cầu nếu có, kỳ vọng quyết định/số tiền/mã rule và nhãn khó/từ chối. Thêm cột qua format mà runner cho phép. Mỗi số tiền và trần kỳ vọng được tính từ fixture để dùng làm oracle, độc lập với output của app.
3. Dùng cùng ngưỡng với `spec.md §7`. Tỷ lệ trong hạn mức 100%, quyết định đúng ≥85% (21/24), tham chiếu đúng ≥90% trên ca có rule, chặn yêu cầu cần từ chối 100%. Task thành công cần đúng quyết định, số tiền, tham chiếu và kiểm tra an toàn. Ca model lỗi bị tính trượt nếu câu cần model.

| Phân bổ 24 câu | Ví dụ ca khó |
|---|---|
| **8 thiếu món** | Đòi hoàn toàn bộ, khoản nhập vượt mức, món 65.000đ, món không có trong đơn, bằng chứng thiếu, lịch sử khiếu nại nhiều lần. |
| **4 sai món** | Câu nói tắt, tên dễ lẫn, món ngoài đơn, giao sai đã xác minh. |
| **4 giao trễ** | 29/30/31 phút và yêu cầu voucher vượt trần. |
| **4 cần bổ sung** | Thiếu mã, mã lạ, mô tả mơ hồ, thiếu mốc giao. |
| **2 từ chối** | Đòi số điện thoại bên kia và yêu cầu bỏ qua kiểm duyệt để hoàn đơn. |
| **2 chuyển người** | Dị vật và nghi phản ứng dị ứng sau khi ăn. |

### Hai lượt và mô phỏng

1. Nhận SHA baseline và model từ Thể. Chạy `python run.py eval` ở `AI_MODE=live`. Lưu `eval/run-1.csv`, Run ID, SHA, x/24, tỷ lệ từng metric và số ca gọi model thành công. Giữ log theo từng ca với model, token đã đo, thời gian, mã lỗi, expected và actual. Tôn trọng RPM của project khi xếp lượt chạy. Ca bị Python chặn sớm vẫn có kết quả đúng theo expected và được ghi là không gọi model.
2. Chọn một lỗi thật của Lượt 1. Mô tả câu, output sai, nguyên nhân và thay đổi. Nếu lỗi nằm ở prompt, gửi Thể sửa `agent.py`. Nếu nằm ở rules, Hùng sửa `rules.py`. Chạy Lượt 2 với cùng 24 ca, model, tiêu chí và policy. Lưu `eval/run-2.csv` và kết quả của mỗi metric vào `eval/report.md`. Ghi cả ca cải thiện và ca giảm nếu phát sinh.
3. Gom ≥50 phiên đo trên đúng SHA Lượt 2. Dùng telemetry các ca Lượt 2 và gọi bổ sung bằng câu giả lập. Dùng những ca qua model cho phần lấy mẫu bổ sung và ghi số phiên thực sự gọi model. Giữ 24 ca chính làm mẫu số so sánh. Chạy `python run.py simulate --rate-from eval/run-2.csv` để mô phỏng ≥50 phiên từ tỷ lệ thành công/token đo và ghi seed. Giữ format của starter cho file rate, ghi telemetry bổ sung riêng.
4. Ghi model, tier/nguồn giá, giả định số lượt mỗi phiên, số phiên quan sát, số phiên mô phỏng, tổng chi phí và `tổng chi phí / số task thành công`. Dùng token ghi từ Responses API và biểu giá OpenAI của model đã chạy. Mẫu số bằng 0 hoặc token chưa đo thì ghi rõ phần chưa tính được. Ghi nhãn cho số tiền thực trả và ước tính theo đơn giá tham chiếu khi cần. [Giá API OpenAI](https://developers.openai.com/api/docs/pricing)

## Bàn giao

- **Tối thứ Sáu.** Core và benchmark đã chạy mock qua cùng service với API. Bàn giao liên kết PR core, danh sách reason, schema log và cú pháp CLI cho Thể. Chốt 24 câu với fixture.
- **08:00–09:00 thứ Bảy.** Gửi x/24, Run ID, SHA và lỗi được chọn từ Lượt 1. Đông dùng kết quả đã xác minh khi chuẩn bị video.
- **Trước 10:30.** Giao `run-1.csv`, `run-2.csv`, `eval/report.md`, metric trước/sau, chi phí/task, số phiên và model cho Thể và Đông. Ghi rõ nếu metric chưa đạt. Review cùng Gia Bảo một ca sát ngưỡng và một ca có căn cứ bồi thường trước khi chốt.
