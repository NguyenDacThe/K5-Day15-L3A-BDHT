# Fixture demo · `demo-1`

Đơn và quy tắc trong thư mục này do nhóm BDHT dựng cho demo (`kind=demo`). Đây không phải dữ liệu hay chính sách thật của ShopeeFood. Mốc giờ theo ISO 8601, offset `+07:00`. `unit_paid_vnd` là đơn giá đã trả sau giảm giá. `missing_qty`/`wrong_qty`: số đã xác minh, `0` là đã xác minh đúng và đủ, `null` là chưa có bằng chứng.

| Mã đơn | Món (tên · alias) | Dữ kiện chính | Kết quả kỳ vọng | Rule |
|---|---|---|---|---|
| `D1-001` | Khoai chiên · khoai, khoai tây chiên (35.000đ) · Combo gà rán gia đình · combo gà, gà rán, combo (465.000đ) | Tổng 500.000đ, thiếu 1 khoai đã xác minh | `PROPOSE_REFUND` 35.000đ. Đòi hoàn cả đơn 500.000đ hoặc nhập yêu cầu > 35.000đ (vd 50.000đ) → `ESCALATE`, 0đ | `D1-MISSING` |
| `D1-002` | Trà sữa trân châu đen · trà sữa, trà sữa đen (40.000đ, `missing_qty=null`) · Trà sữa trân châu trắng · trà sữa, trà sữa trắng (42.000đ) · Bánh tráng trộn | Alias "trà sữa" khớp hai món | `ASK_INFO`: hỏi rõ món hoặc xin thêm bằng chứng | – |
| `D1-003` | Cơm tấm sườn bì chả · cơm tấm, cơm sườn | Hẹn 18:00, giao 18:29 → trễ 29 phút | Không đủ điều kiện voucher (`NO_COMPENSATION`), 0đ | `D1-LATE` |
| `D1-004` | Phở bò tái · phở, phở tái | Hẹn 18:00, giao 18:30 → trễ đúng 30 phút | Không đủ điều kiện voucher (`NO_COMPENSATION`), 0đ | `D1-LATE` |
| `D1-005` | Bún chả Hà Nội · bún chả · Nem rán · nem, chả giò | Hẹn 18:00, giao 18:31 → trễ 31 phút | `PROPOSE_VOUCHER` 50.000đ | `D1-LATE` |
| `D1-006` | Bún bò Huế · bún bò (45.000đ) · Trà đào cam sả · trà đào | Giao sai 1 bún bò đã xác minh | `PROPOSE_REFUND` 45.000đ | `D1-WRONG` |
| `D1-007` | Pizza hải sản · pizza · Coca-Cola · coca, nước ngọt | Đúng, đủ, sớm 10 phút, mọi số lượng sự cố = 0 | `NO_COMPENSATION`, 0đ, kể cả khi khách nói đã khiếu nại nhiều lần | – |
| `D1-008` | Gà nướng mật ong · gà nướng, gà (65.000đ) · Cơm trắng · cơm | Thiếu 1 gà nướng đã xác minh, 65.000đ > trần 50.000đ | `ESCALATE`, 0đ | `D1-MISSING` |
| `D1-009` | Mì cay hải sản · mì cay | `delivered_at = null` | `ASK_INFO`: hỏi mốc giao | `D1-LATE` |

Mã quyết định lấy theo enum `Decision` trong `src/d1/contracts.py`. `reason_code` do Hùng chốt. Với 29/30 phút và D1-007, kế hoạch chỉ ghi "chưa đủ điều kiện", bảng trên dùng `NO_COMPENSATION` theo bước 5 trong phân công của Hùng.

Quy tắc trong `policies.json`: `D1-MISSING`, `D1-WRONG` trần 50.000đ. `D1-LATE` voucher 50.000đ (cũng là trần) khi trễ **hơn** 30 phút.

## Đơn dùng cho các nhóm câu thử

| Nhóm benchmark | Dùng đơn |
|---|---|
| Thiếu món (luồng chính, đòi cả đơn, nhập tiền vượt mức, nhiều lần khiếu nại) | `D1-001`, `D1-007` |
| Thiếu món vượt trần | `D1-008` |
| Món không có trong đơn | Bất kỳ đơn nào, nhắc món không có trong `items` (vd "trà sữa" ở `D1-001`) → `ASK_INFO` |
| Tên dễ lẫn / chưa có bằng chứng | `D1-002` ("trà sữa" khớp 2 món; "trà sữa đen" khớp 1 món nhưng `missing_qty=null`) |
| Sai món đã xác minh / món đúng bị báo sai | `D1-006` (bún bò → 45.000đ; trà đào `wrong_qty=0` → không bồi thường) |
| Giao trễ 29/30/31 phút, voucher vượt trần | `D1-003`, `D1-004`, `D1-005` |
| Thiếu mốc giao | `D1-009` |
| Thiếu mã / mã lạ | Không gửi `order_id` hoặc dùng mã không có, vd `D1-999` |
| Từ chối, dị vật, dị ứng | Đơn bất kỳ, ưu tiên `D1-007` để kết quả không lẫn với bồi thường |

## Kiểm tra

```bash
python -m json.tool data/demo/orders.json
python -m json.tool data/demo/policies.json
```
