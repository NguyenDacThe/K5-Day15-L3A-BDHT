# BDHT — Khiếu nại đơn giao đồ ăn

Nhóm L3A · Track D · Bài D1. Khách gửi khiếu nại về một đơn mẫu. Hệ thống phân loại sự cố và đối chiếu quy tắc để đề xuất hướng xử lý. [Thành viên và phân công](TEAMS.md) · [Canvas](canvas.md) · [Thiết kế](spec.md)

## Nhóm làm gì, khung làm gì

| Người | Nhánh làm việc | Phần phụ trách |
|---|---|---|
| Nguyễn Đắc Thể | `feat/the-agent-deploy` | Contract, AI Core, API, CLI, merge `main`, Vercel và nộp bài. |
| Trần Quốc Đông | `feat/dong-ui-demo` | Giao diện `web/`, slide và [link video](demo/links.md). |
| Phan Gia Bảo | `feat/giabao-data` | Đơn và quy tắc giả lập trong `data/demo/`. Thu review ShopeeFood công khai từ Google Play và App Store Việt Nam trên nhánh `feat/giabao-evidence`. |
| Dương Mạnh Hùng | `feat/hung-rules-eval` | Đọc fixture, viết rules, xây benchmark, đánh giá và mô phỏng chi phí. |

Tạo nhánh làm việc từ `origin/main`. Gia Bảo gửi PR fixture trước để Hùng và Đông dùng chung mã đơn. PR giao diện có thể đi song song theo contract. Thể tích hợp service với rules và model trên `main`.

```bash
git fetch origin
git switch -c feat/dong-ui-demo origin/main
```

## Chạy trong 3 phút

Dùng Python 3.10 trở lên. Các lệnh sau chạy trong PowerShell từ root repo. Trên macOS/Linux, thay `.\.venv\Scripts\python.exe` bằng `.venv/bin/python`.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe run.py check
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

Mở `http://127.0.0.1:8000/api/health` để kiểm tra ứng dụng và `http://127.0.0.1:8000/docs` để xem schema. Khi Đông thêm `web/index.html`, FastAPI phục vụ trang ở `/` và UI gọi API cùng origin.

## Lệnh

| Lệnh | Công dụng |
|---|---|
| `python run.py` | Mở CLI. Dán một dòng JSON như mẫu bên dưới, hoặc gõ mô tả để thử nhánh hỏi mã đơn. |
| `python run.py check` | Kiểm `TEAMS.md`, sáu cột benchmark và metric. Ở mốc khởi tạo, benchmark còn là mẫu BTC. |
| `python run.py eval --try` | Thử ba ca đầu sau khi có benchmark và nối model. |
| `python run.py eval` | Chạy bộ câu thử, ghi CSV và trace theo format BTC. |
| `python run.py score eval/run-1.csv` | Tính tỷ lệ đạt từ cột `pass` đã chấm. |
| `python run.py simulate --rate-from eval/run-2.csv` | Mô phỏng chi phí từ lượt 2 sau khi chấm. |

## Bản chạy thử — viết ở đâu

Ở mốc khởi tạo, API và CLI cùng gọi `handle_complaint(request)` trong [service.py](src/d1/service.py). Hùng nối `decide(request, classify)` cho phần đối chiếu quy tắc. Thể cung cấp bộ phân loại trả về `TriageResult`. [Schema Python](src/d1/contracts.py)

**Request mẫu cho `POST /api/complaints`**

```json
{"order_id":"D1-001","message":"Đơn mình thiếu một phần khoai.","requested_amount_vnd":null}
```

`message` dài 1–500 ký tự sau khi bỏ khoảng trắng đầu cuối. `order_id` và `requested_amount_vnd` có thể bỏ trống hoặc gửi `null`. Số tiền nhập phải là số nguyên VND từ 0 trở lên. API trả HTTP 422 cho body sai và HTTP 200 cho quyết định nghiệp vụ.

**Response đích sau khi tích hợp fixture, rules và model**

```json
{
  "decision": "PROPOSE_REFUND",
  "issue_type": "MISSING_ITEM",
  "proposed_amount_vnd": 35000,
  "reason_code": "ITEM_ELIGIBLE",
  "policy_ref": {"rule_id":"D1-MISSING","version":"demo-1","kind":"demo"},
  "reply": "Mức đề xuất hoàn cho phần khoai là 35.000đ.",
  "meta": {"mode":"live","ai_used":true}
}
```

Bản khung hiện trả `ASK_INFO` khi thiếu mã đơn hoặc `ESCALATE / RULES_UNAVAILABLE` khi có mã đơn. Đông có thể dùng response đích để dựng màn kết quả.

## Phần nào thật, phần nào giả

- Bản khung chạy `mock`. Model ứng viên khi nối OpenAI là `gpt-4o-mini`. Tên biến cấu hình ở [.env.example](.env.example).
- Đơn, chính sách, đề xuất bồi thường và việc chuyển nhân viên đều thuộc mô phỏng. [Data card](data/DATA_CARD.md)
- Review công khai dùng để thu bằng chứng về khó khăn của khách. Gia Bảo thử collector khoảng 20 phút rồi chuyển sang lấy mẫu thủ công nếu cần. Mục tiêu là đọc 20–40 review và lưu ít nhất 5 đoạn trích ẩn danh. Dữ liệu thô để ở `data/raw/`, đã được Git bỏ qua. [Nhật ký nguồn](evidence/source_log.csv) · [Tổng hợp bằng chứng](evidence/summary.md)

## Dùng AI vào việc gì

Nhóm dùng Codex đọc phân công và dựng khung repo cùng schema. Thể phụ trách rà lại contract và kết quả chạy thử. Gia Bảo kiểm chứng nguồn và trích dẫn. [Khai báo dùng AI](docs/ai-usage.md)

## File mẫu — điền ở bước nào

| Mốc | File hoặc đầu mục |
|---|---|
| CP1 | [TEAMS.md](TEAMS.md), [canvas.md](canvas.md) và repo công khai. |
| CP2 | Thiết kế và ngưỡng ở [spec.md](spec.md), [data card](data/DATA_CARD.md), [benchmark](eval/benchmark.csv) và [metric](eval/metric_spec.yaml). |
| CP3 | [Bằng chứng](evidence/summary.md), bộ 20–30 ca, Lượt 1 và [video gọi thật](demo/links.md). |
| CP4 | [Báo cáo hai lượt](eval/report.md), [chi phí](cost/cost-estimate.md), slide PDF, video dự phòng và Vercel Production. |

## Bảy hạng mục bắt buộc — nằm ở file nào

| Hạng mục | File |
|---|---|
| Bằng chứng khó khăn của người dùng | [evidence/summary.md](evidence/summary.md) |
| Impact có số | [spec.md](spec.md) §2 |
| Thiết kế giải pháp | [spec.md](spec.md) §4 |
| Bản chạy thử | [app.py](app.py) và [run.py](run.py) |
| Định nghĩa đạt và bộ câu thử | [eval/](eval/) và [data/DATA_CARD.md](data/DATA_CARD.md) |
| Mô phỏng chi phí | [cost/cost-estimate.md](cost/cost-estimate.md) |
| Slide, demo và video | [demo/links.md](demo/links.md), Thể cập nhật URL Vercel sau khi triển khai |

Trên Vercel, chọn FastAPI và dùng root của repo. Khi đã tích hợp model, đặt cấu hình server cho Preview và Production theo `.env.example`. Mục nộp và điều kiện xét giải cần đối chiếu với Form 2. [Tài liệu FastAPI trên Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
