# Báo cáo Frontend · Trần Quốc Đông · 2A202603643

Ngày thực hiện: 27/11/2026, giờ Việt Nam. Phạm vi: UI, kiểm thử UI và tài liệu demo. Chưa commit, push, mở PR hoặc deploy.

## A. Hiện trạng ban đầu

- Nhánh `feat/dong-ui-demo`, working tree sạch; remote `https://github.com/NguyenDacThe/K5-Day15-L3A-BDHT.git`. Nhánh đã tồn tại nên giữ nguyên, không tạo nhánh mới, stash hoặc reset. Sau `git fetch origin`, HEAD trùng `origin/main`, commit nền `db7f2a7`.
- Local có `main` và nhánh Đông; remote có `main`, `feat/giabao-data`, `feat/giabao-evidence`. Không merge hoặc cherry-pick nhánh khác.
- Đã đọc: `AGENTS.md`, `README.md`, `TEAMS.md`, kế hoạch `01-…`, bốn bản phân công `02-…` đến `05-…`, `canvas.md`, `spec.md`, `src/d1/contracts.py`, `src/d1/service.py`, `app.py`, `requirements.txt`, `.env.example`, `.gitignore`, `docs/ai-usage.md`, `docs/connect-model.md`, `codebase/agent.py`, phần CLI liên quan, `demo/links.md`, `slides/outline.md`.
- Ba file UI chưa có. `app.py` đã cấu hình mount `/` sau API nếu `web/index.html` tồn tại; không cần sửa Backend.
- Request/response Python khớp contract trong yêu cầu. `policy_ref.kind` là `demo`; response kiểm ràng buộc số tiền/quy tắc cho quyết định đề xuất. Metadata bị thiếu ở response test sẽ giữ trạng thái trung tính thay vì suy đoán.
- `POST /api/complaints` đang chạy service mock: thiếu mã → `ASK_INFO / ORDER_ID_REQUIRED`; có mã → `ESCALATE / RULES_UNAVAILABLE`; không gọi model. Rules đã có code nhưng service chưa nối vào luồng này.
- `data/demo/orders.json`, `policies.json` chưa có ở checkout/main. Đã đọc bằng `git show` trên `origin/feat/giabao-data`, SHA `bc778a6c8034318cdaa10a453a1bbed5d51ab44e`: D1-001 có phần khoai 35.000đ, đơn 500.000đ; D1-004 trễ đúng 30 phút; D1-005 trễ 31 phút; D1-LATE voucher 50.000đ. Các mã UI khớp fixture nhánh đó. Chưa đưa dữ liệu vào checkout.
- Không thấy quy định đóng góp/hook riêng trong file repo đã liệt kê; `core.hooksPath` không có giá trị, `.git/hooks` có các mẫu `.sample`. Giữ nguyên Git hooks và AI Log.

### Khác biệt tài liệu/code cần nhóm biết

| Khác biệt | Nguồn dùng khi tích hợp |
|---|---|
| README ghi rõ API còn là khung; response hoàn 35.000đ là đích tương lai. | `service.py` thực tế; không coi response mẫu là kết quả thật. |
| Kế hoạch có đường dẫn `DATA_CARD.md`, `metric_spec.yaml` ở root; repo đang dùng `data/DATA_CARD.md`, `eval/metric_spec.yaml`. | Đường dẫn thật và README; không di chuyển file. |
| `slides/outline.md` là mẫu 8 trang, phân công Đông chốt 5 trang. | Chuẩn bị outline 5 trang trong `demo/links.md`; chưa xuất PDF cuối. |
| `docs/connect-model.md` nói `MODEL_PROVIDER/MODEL_NAME/API_KEY`; cấu hình nhóm là `AI_MODE/OPENAI_MODEL/OPENAI_API_KEY`. | Đề nghị Thể cập nhật hướng dẫn model; Frontend không sử dụng key. |
| Phiên bản Python package đang cài khác manifest ghim. | Đã test bằng môi trường sẵn có; chưa xác minh môi trường cài mới theo manifest. |

## B. Công việc đã hoàn thành

- Phase 0: audit tài liệu, Git, contract, service, fixture remote và môi trường.
- Phase 1: UI sáng, cam ấm, font hệ thống, SVG nội bộ; hai cột desktop, một cột mobile; form, vùng kết quả và thông báo mô phỏng thường trực.
- Phase 2: bốn mẫu chỉ điền form; validate nội dung sau trim 1–500 ký tự, số nguyên không âm trong phạm vi JavaScript an toàn; mã đơn tùy chọn, tiền trống thành `null`. Render sáu quyết định, số tiền từ response, reply giữ nguyên, rule/version hoặc không có tham chiếu.
- Phase 3: `fetch('/api/complaints')`, không có fallback thành công giả; HTTP/network/JSON/schema error, timeout 45 giây; chặn gửi trùng, reset có hủy request, bỏ response cũ; input được giữ khi lỗi. Phân biệt mock, live có AI, live không gọi AI và metadata thiếu; model/rules unavailable có trạng thái riêng.
- Phase 4: kiểm trình duyệt thật bằng Edge headless/Playwright, API local, responsive, bàn phím và XSS. Lỗi bộ đếm sau reset ở lượt đầu đã sửa; lượt kiểm cuối không còn lỗi đã biết.
- Phase 5: đã soạn khung link, hai kịch bản video, outline 5 slide và danh sách số liệu cần nhận. Video và PDF cuối còn chờ dependency.

Không thực hiện logic tính bồi thường hoặc tra quyết định từ mẫu trên Frontend. Response giả lập chỉ có trong script kiểm thử, không được tải bởi trang sản phẩm.

## C. File đã tạo hoặc chỉnh sửa

| File | Thay đổi |
|---|---|
| `web/index.html` | Tạo trang semantic tiếng Việt, form có label, mẫu, trạng thái/kết quả, live regions, nhãn mô phỏng và skip link. |
| `web/assets/style.css` | Tạo design tokens, Grid/Flex responsive, focus-visible, màu trạng thái và reduced motion. Không font/CDN hoặc thư viện ngoài. |
| `web/assets/app.js` | Tạo các hàm validate/build payload/network/render/reset độc lập; module không tạo biến global; mọi dữ liệu động dùng `textContent`. |
| `demo/frontend-check.cjs` | Tạo kiểm thử trình duyệt có thể chạy lại, tách API local khỏi response mock; JSON kết quả và ảnh ghi vào thư mục tạm ngoài repo. Không thêm Node project. |
| `demo/frontend-report.md` | Báo cáo audit, kiểm thử, hạn chế và bàn giao. |
| `demo/links.md` | Bổ sung kịch bản/outline/dependency; giữ link và SHA video chưa điền. |

Không chỉnh file Backend, dữ liệu, eval, evidence, manifest, cấu hình triển khai, tài liệu của thành viên khác hoặc khung BTC.

## D. Kết quả kiểm thử

Môi trường đã chạy: Windows, Python 3.11.9; FastAPI 0.163.1, Pydantic 2.14.3, Uvicorn 0.54.0; Node 24.18.0; Microsoft Edge headless qua Playwright đã có trong npm cache. Không thêm package vào repo, không gọi API model bên ngoài.

“API local” bên dưới là HTTP thật tới FastAPI, nhưng service vẫn trả `meta.mode=mock`. “Mock HTTP” là response được Playwright chặn/trả trong kiểm thử; metadata live trong test không chứng minh gọi AI thật.

| Test ID | Kỳ vọng | Kết quả thực tế | Trạng thái | Nguồn |
|---|---|---|---|---|
| FE-01 | UI, health, docs, CSS, JS tải được | 5 đường dẫn HTTP 200, trang idle; không lỗi JS | PASS | API local + browser |
| FE-02 | Mẫu điền đúng, không tự gửi | Kiểm cả 4 mẫu, tiền vượt mức 500000; 0 request tự động | PASS | Browser |
| FE-03 | Thiếu khoai → hoàn đề xuất 35000 | Render đúng response mẫu; API local chỉ trả RULES_UNAVAILABLE | PASS render / BLOCKED nghiệp vụ live | Mock HTTP + API local |
| FE-04 | Vượt mức → ESCALATE, 0 | Render đúng; service khung chưa kiểm mức nên chưa chứng minh nghiệp vụ | PASS render / BLOCKED nghiệp vụ live | Mock HTTP + API local |
| FE-05 | Trễ 30 phút → NO_COMPENSATION | Render đúng response mẫu; chưa chạy rules qua service | PASS render / BLOCKED nghiệp vụ live | Mock HTTP + API local |
| FE-06 | Trễ 31 phút → voucher 50000 | Render đúng response mẫu; chưa chạy rules qua service | PASS render / BLOCKED nghiệp vụ live | Mock HTTP + API local |
| FE-07 | Thiếu mã vẫn gửi và ASK_INFO | `order_id=null`, API trả ASK_INFO đúng, nhãn Chế độ thử | PASS | API local |
| FE-08 | Nội dung rỗng bị chặn | Khoảng trắng bị chặn, đánh dấu input, không fetch | PASS | Browser |
| FE-09 | Trên 500 ký tự bị chặn | Gán 501 ký tự vượt HTML maxlength vẫn bị JS chặn | PASS | Browser |
| FE-10 | Tiền âm bị chặn | -1 không gửi request | PASS | Browser |
| FE-11 | Tiền thập phân bị chặn | 1.5 không gửi request | PASS | Browser |
| FE-12 | Tiền trống thành null | Kiểm payload gửi thật; message cũng được trim | PASS | API local |
| FE-13 | Không gửi trùng, loading đúng | 4 submit liên tiếp chỉ 1 request; disable rồi mở lại | PASS | Mock HTTP có trì hoãn |
| FE-14 | HTTP lỗi có thông báo an toàn | 400/404/422/429/500 thoát loading, giữ input; API local xác nhận 422 | PASS | Mock HTTP + API local |
| FE-15 | Lỗi mạng giữ input, gửi lại được | Hủy network → lỗi; lần gửi kế tiếp thành công | PASS | Mock network + Mock HTTP |
| FE-16 | Model lỗi không gắn nhãn AI thật | MODEL_UNAVAILABLE ưu tiên hơn metadata live; hiện ESCALATE, 0 | PASS | Mock HTTP |
| FE-17 | Mock không hiện AI thật | Kể cả metadata mock/ai_used=true vẫn hiện Chế độ thử | PASS | Mock HTTP |
| FE-18 | Metadata xác định nhãn | live/true → AI thật; live/false → quy tắc; thiếu meta/cờ → trung tính | PASS logic nhãn | Mock HTTP, chưa gọi AI thật |
| FE-19 | policy_ref=null không tạo rule | Hiện không có tham chiếu, ẩn version | PASS | Mock HTTP |
| FE-20 | REFUSE hiển thị đúng | Từ chối yêu cầu, số tiền 0 | PASS | Mock HTTP |
| FE-21 | Responsive không tràn | Kiểm 320/390/768/1024/1440px, thứ tự result dưới form ở mobile | PASS | Browser + Mock HTTP |
| FE-22 | Reset đúng; hủy request cũ | Form và counter về 0, ẩn kết quả; response cũ không ghi đè idle | PASS sau sửa | Browser + Mock HTTP |
| FE-23 | Response hỏng có lỗi an toàn | Non-JSON, null, thiếu dữ liệu, sai type/enum/policy/invariant bị chặn | PASS | Mock HTTP |
| FE-24 | Không thực thi HTML/script | Payload giữ text; reply/rule/version/reason không tạo img/script, không chạy XSS | PASS | Browser + Mock HTTP |
| EX-01 | Timeout 45 giây | Clock trình duyệt tiến 45001ms; request-error, mở lại gửi | PASS | Mock network + virtual clock |
| EX-02 | 500 ký tự/0 hợp lệ; ẩn kết quả cũ | Payload 500 ký tự và số 0; sửa message chuyển idle | PASS | Mock HTTP |
| EX-03 | Bàn phím/live region/reduced motion | Skip link và điều hướng hoạt động; labels/live regions đúng; spinner không chạy khi reduce; không lỗi JS | PASS | Browser |

Script xuất **31 mục PASS, 0 FAIL, 4 BLOCKED** ở lượt cuối: 24 ca FE, 4 kiểm tra API khung cho FE-03–06 và 3 ca bổ sung. Bốn mục BLOCKED riêng là nghiệm thu nghiệp vụ FE-03–06 trên Backend live tích hợp. Đếm này là kiểm thử Frontend; không phải metric eval AI.

Kiểm bổ sung: `node --check` cho hai file JS/CJS đạt. `python run.py check` chạy xong, đủ sáu cột/10 câu/4 metric/4 thành viên; có cảnh báo CP3 cần 20–30 câu và hiện 0/10 câu từ người dùng/data thật. Chưa sửa phần eval. Kiểm ảnh desktop/mobile bằng mắt đã thực hiện; không thay cho kiểm trên thiết bị vật lý.

## E. Công việc chưa hoàn thành

| Việc | Trạng thái / nguyên nhân | Phối hợp |
|---|---|---|
| Bốn kết quả nghiệp vụ chính qua API live | BLOCKED: fixture ở nhánh khác, service chưa gọi rules/model | Thể tích hợp; Gia Bảo xác nhận dữ liệu; Hùng xác nhận rules |
| Model thật và nhãn AI thật từ lượt gọi thực | BLOCKED: chưa có adapter/service live trong checkout | Thể |
| Preview/Production và link ẩn danh | NOT RUN: chưa có URL deployment được xác minh | Thể + Đông |
| Video gọi thật và dự phòng | Chưa quay; chưa có build/số liệu cuối | Đông sau bàn giao của nhóm |
| Slide PDF cuối | Chưa xuất; chờ bằng chứng, eval và chi phí | Gia Bảo, Hùng, Thể → Đông |
| Screen reader, Safari/Firefox, thiết bị vật lý | NOT RUN; đã kiểm DOM, bàn phím và Edge desktop với viewport mobile | Đông |
| Cài mới đúng các phiên bản requirements.txt | NOT RUN; đã dùng môi trường cài sẵn, không thay package chung | Thể smoke trong môi trường deploy |

## F. Hướng dẫn chạy

Từ root repo, môi trường hiện tại đã có FastAPI/Uvicorn:

```powershell
python -m uvicorn app:app --reload
```

Mở `http://127.0.0.1:8000/`; health ở `/api/health`, schema ở `/docs`. Không cần Node để chạy giao diện, không cần API key cho service khung. Reload để app nhận mount static nếu server cũ được khởi động trước khi có `index.html`.

Để tái lập môi trường Python theo README (chưa thực hiện cài mới trong phiên này):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

Chạy lại kiểm thử bằng Playwright đã có trên máy hiện tại, trong terminal khác khi API ở cổng 8000:

```powershell
$env:PLAYWRIGHT_MODULE = 'C:\Users\tranq\AppData\Local\npm-cache\_npx\420ff84f11983ee5\node_modules\playwright'
node demo/frontend-check.cjs
```

Máy khác cần Playwright cùng Edge cài riêng; có thể đặt `PLAYWRIGHT_MODULE` trỏ tới package có sẵn. Script không tự cài thư viện hoặc thay đổi dependencies dự án. `FE_BASE_URL` cho phép chọn server local khác; mặc định là `http://127.0.0.1:8000`. Ảnh và JSON kết quả được ghi vào `%TEMP%\bdht-frontend-*`; đường dẫn in ở cuối lệnh.

## G. Git status và bàn giao

Nhánh giữ nguyên `feat/dong-ui-demo`. Thay đổi dự kiến: 5 file mới (`web/index.html`, hai assets, `demo/frontend-check.cjs`, báo cáo này) và một file sửa `demo/links.md`. Chưa stage/commit/push/PR/merge. Không ghi `.env`, key, dữ liệu thật hoặc artifact chạy eval vào diff.

Commit đề xuất:

```text
feat(frontend): implement D1 complaint handling interface
```

Thể review contract/static mount và tích hợp Backend, Hùng/Gia Bảo review bốn ca mẫu; Đông chạy lại smoke từ trình duyệt trên URL deploy. Chỉ commit/push hoặc mở PR khi người dùng yêu cầu.

## H. Review rủi ro và đề xuất ngoài phạm vi

| File / công việc | Đề xuất, chủ sở hữu | Ảnh hưởng UI |
|---|---|---|
| `src/d1/service.py`, `src/d1/agent.py` | Thể nối rules/AI, giữ nguyên contract, metadata đúng cho từng lượt; không sửa trong phiên này | Chặn nghiệm thu nghiệp vụ live và video gọi thật |
| `data/demo/orders.json`, `policies.json` | Gia Bảo/Thể merge fixture đã xác nhận | UI hiện chỉ có mã mẫu theo fixture remote, không có endpoint danh sách đơn |
| `src/d1/rules.py` | Hùng xác nhận kết quả sau khi service tích hợp | Bốn ca chính phải test lại end-to-end |
| `docs/connect-model.md` | Thể đồng bộ biến cấu hình với thiết kế hiện tại | Tránh cấu hình nhầm khi quay live; không cần đổi UI |
| `spec.md` §10, `docs/ai-usage.md` | Thể cập nhật changelog sau CP2 nếu áp dụng, khai báo phần UI/demo được Codex hỗ trợ và người review thực tế | Thuộc hồ sơ chung; chưa sửa vì ngoài scope |

Thiết kế tự chọn: tên BDHT – Food Support, màu cam ấm/nền trung tính, font hệ thống, SVG nội bộ, timeout 45 giây và input tiền dạng text với bàn phím số để validate nhất quán. Từ chối tiền ngoài phạm vi số nguyên an toàn JavaScript để không gửi số bị làm tròn. Textarea HTML giới hạn 500 đơn vị UTF-16; JS kiểm thêm độ dài Unicode sau trim, do đó một số nội dung nhiều emoji có thể bị giới hạn sớm hơn phía Python.

Thông báo fixture đang chờ tích hợp nằm ở form và cần Đông cập nhật sau khi build thật đã có dữ liệu. Metadata không đủ thì không suy đoán lượt gọi AI. Model/rules unavailable được phân biệt với lỗi mạng, quyết định nghiệp vụ HTTP 200 vẫn hiển thị đúng response. Phương án bồi thường/chuyển người trên mọi mode đều là mô phỏng. Không có bằng chứng gọi AI thật hoặc triển khai Vercel trong kết quả Frontend này.
