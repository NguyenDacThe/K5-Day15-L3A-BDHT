# Thể · Tích hợp, agent, Vercel và nộp bài

**Đích bàn giao 11:30 thứ Bảy 28/11/2026, giờ Việt Nam.** Nhánh làm việc `feat/the-agent-deploy`. Bàn giao sớm nhất là commit starter và contract để ba người còn lại phát triển song song. [Kế hoạch chung](01-plan-hackathon-d1.md)

## Phần Thể sở hữu

| File hoặc đường dẫn | Nội dung |
|---|---|
| `TEAMS.md`, `canvas.md`, `spec.md`, `README.md` | Mẫu BTC, contract, kiến trúc, chuẩn đạt và thông tin nộp. |
| `app.py`, `run.py`, `requirements.txt`, `.env.example`, `.gitignore` | Bootstrap FastAPI, nối CLI với service và cấu hình chạy. Dùng manifest của starter nếu đã có. |
| `src/d1/__init__.py`, `src/d1/contracts.py`, `src/d1/agent.py`, `src/d1/service.py`, `tests/test_api.py` | Contract, adapter mock/live, service tích hợp và kiểm thử HTTP. |
| GitHub, Vercel, Form 2 | Quyền truy cập repo, deploy Preview và Production, merge, đối chiếu bản nộp. |

## 30 phút đầu

1. Tạo repo public từ `starter-repo/` theo tên `K5-Day15-<lớp>-<tên>`. Điền bốn người vào `TEAMS.md`, đội trưởng đầu danh sách. Dùng mẫu 7 dòng trong `canvas.md`, mô tả bài toán bằng 1–2 câu không dùng từ “AI” và điền một câu lát cắt D1.
2. Mở Form 2 và starter, ghi chính xác bốn điều kiện xét giải, các mục CP, path/header của file chấm và yêu cầu 50 phiên. Kiểm tra các lựa chọn CLI mà BTC đã cung cấp. Dùng các lệnh chính thức trong README.
3. Đưa starter, cấu trúc và `contracts.py` lên `main`. Định nghĩa các schema theo kế hoạch, cung cấp một request/response mẫu. Chốt ID demo `D1-001`, số tiền 35.000đ, enum, HTTP status và đường dẫn `POST /api/complaints`. Gửi cả nhóm SHA và contract.
4. Điền `spec.md §4` theo luồng Input → AI Core → Chặn rủi ro → Output. Chốt `§7` với Hùng ngay lúc bootstrap gồm 100% trong hạn mức, ≥85% quyết định đúng, ≥90% tham chiếu quy tắc đúng, 100% ca từ chối cần chặn. Commit ngưỡng trước mọi lượt chấm và dùng bộ ngưỡng đó để báo hai lượt.

## Tối thứ Sáu

### Agent và tích hợp

1. Viết adapter với hai chế độ `AI_MODE=mock|live`. Mock trả cùng schema qua service thật. Ở chế độ live, khởi tạo SDK `openai` bằng `OPENAI_API_KEY` và gọi Responses API bằng model trong `OPENAI_MODEL`. Dùng `client.responses.parse(..., text_format=TriageResult)` và đọc `response.output_parsed`. System prompt yêu cầu trả loại sự cố, cụm tên món từ câu và loại yêu cầu bồi thường. Truyền mô tả dưới vai trò người dùng và kiểm tra đã parse được đúng schema. [Structured Outputs của OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs)
2. Trong `service.py`, tiêm `classify(message)` cho `decide(request, classify)` của Hùng. Ghi `RunMeta` theo từng lần xử lý gồm chế độ, cờ gọi model, model trả về, token lấy từ `response.usage` khi có, thời gian và mã lỗi. Đánh dấu rõ khi chỉ biết model cấu hình. Trả `meta.ai_used=true` khi model thật đã trả payload hợp lệ. Timeout, lỗi quyền gọi model, 429 và output rỗng hoặc lỗi vào `ESCALATE / MODEL_UNAVAILABLE`. Rút gọn phản hồi lỗi trước khi hiển thị hoặc ghi log.
3. Giữ `python run.py check` chạy kiểm tra theo starter. Nối chế độ mặc định `python run.py` vào luồng issue thiếu món. Cho `eval` và `simulate` gọi các hàm của Hùng, theo cú pháp của BTC. Hùng cung cấp chữ ký hàm và schema đầu ra. Kiểm tra CLI mặc định và HTTP cùng dùng một service.
4. Trong `tests/test_api.py`, thử body thiếu/rỗng và body hợp lệ, một ca mock đề xuất 35.000đ, một ca yêu cầu cả đơn, một ca giả lập timeout. Kiểm tra cùng một response có đúng enum, số tiền nguyên, rule ref và `meta`.

### Deploy sớm

1. Tạo Vercel Project từ repo root, dùng FastAPI với `app.py` và `app = FastAPI()`. Đưa `GET /api/health` lên Preview ngay ở bản khung. Sau khi có UI, mount thư mục `web/` sau các route API. Mở `/` và kiểm tra CSS/JS cũng như route `/api/health`. [FastAPI trên Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
2. Thử `gpt-4o-mini` bằng key OpenAI của nhóm và chạy hai ca thử thật trước khi khóa model. Kiểm tra quyền truy cập và hạn mức API của project. Dự trù khoảng 100 lượt cho hai lượt chấm, smoke/demo và đo thêm để đủ 50 phiên của bản Lượt 2. Gửi Hùng model ID đã xác nhận và RPM để đặt nhịp. [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini) · [Hạn mức OpenAI](https://developers.openai.com/api/docs/guides/rate-limits)
3. Đặt `AI_MODE=live`, `OPENAI_API_KEY` và `OPENAI_MODEL` trong biến môi trường server của scope Preview/Production cần dùng, rồi redeploy. Trong `.env.example` dùng tên biến và giá trị mẫu với phần API key để trống. Chạy một ca từ Preview để xác nhận runtime đọc được JSON và gọi model thật. Gửi URL cho Đông và lệnh chạy/request mẫu cho Hùng. [Biến môi trường Vercel](https://vercel.com/docs/environment-variables)

## Sáng thứ Bảy

| Mốc | Việc cần chốt |
|---|---|
| **08:00** | Xác nhận SHA baseline, model, phiên bản rule và benchmark đã khóa. Cấp cấu hình eval cho Hùng bằng kênh nội bộ. Đông nhận bản live để quay. |
| **09:00** | Đọc lỗi thật của Lượt 1 với Hùng. Chọn một thay đổi có nguyên nhân rõ, giao đúng chủ file. Nếu sửa prompt, Thể mở PR nhỏ và giao commit Lượt 2 cho Hùng. |
| **10:30** | Kiểm tra báo cáo, trạng thái bốn metric, số phiên đo và mô phỏng, model và giá tham chiếu. Merge code đã chấm vào `main` và thử deployment theo SHA. |
| **11:30** | Merge PDF, links và README. Repo, Vercel và các link video mở được từ tab ẩn danh. Đối chiếu Form 2 từng nhánh và xác nhận bốn điều kiện xét giải theo nội dung form. |

## Bàn giao và nghiệm thu

- **Cho Đông.** Request/response mẫu và URL Preview/Production. Đưa một request mẫu chạy được cùng kết quả dự kiến để quay đúng build.
- **Cho Gia Bảo.** Schema fixture đã chốt và nơi đặt data. Nhận ba ID demo đầu tiên cùng rule version và ngưỡng. Review nhãn demo trong dữ liệu và API.
- **Cho Hùng.** Chữ ký contracts/service, bản mock để test và SHA/model của cả hai lượt. Rà kết quả trần tiền cùng Hùng trước merge cuối.
- **Tự kiểm cuối.** Chạy `python run.py check` và `python run.py` từ checkout sạch. Xác nhận README có setup, URL, model, link bằng chứng/báo cáo/demo và cách dùng dữ liệu giả lập. Ghi SHA bản nộp và Run ID. Xem log sau một request với dữ liệu mẫu.
- **Khi Vercel lỗi sát giờ.** Đọc lỗi build hoặc invocation, kiểm root, manifest, biến môi trường, route và việc load fixture. Dùng Preview đã smoke để đối chiếu, triển khai lại commit live đã chạy tốt nếu cần và cập nhật URL trong README/Form theo quy định. Đông mở video dự phòng trong lúc chuẩn bị trình bày.
