# Thiết kế: Giảm giá theo hạng thành viên áp trên giá sản phẩm

Ngày: 2026-08-12
Trạng thái: Đã duyệt bởi user

## Vấn đề

Hạng thành viên có trường `discount_percent` (Ưu đãi giảm giá %) nhưng **chỉ được lưu + hiển thị**, chưa áp dụng vào bất kỳ luồng tính tiền nào. Yêu cầu: giá sản phẩm hiển thị cho thành viên phải giảm theo đúng hạng của họ (vd khách Kim cương thấy giá rẻ hơn khách Vàng), áp dụng ở **mọi nơi hiển thị giá** phía khách hàng.

## Phương án đã chọn (A — Client hiển thị + Server tự tính lại)

- Frontend tính giá hội viên để hiển thị, dựa `discount_percent` của user.
- Backend `createOrder` tự tra hạng của khách và tính lại `tierDiscount` phía server — server là nguồn sự thật, không tin giá từ client.

## Quyết định đã thống nhất

1. Giảm giá áp **trên giá sản phẩm**, khách mỗi hạng thấy giá khác nhau.
2. **Chồng (stack)** với coupon + điểm thưởng — cả 3 đều có hiệu lực.
3. Khách vãng lai (chưa đăng nhập) thấy giá gốc.
4. Thể hiện: **giá gốc gạch ngang + giá hội viên**.
5. Áp dụng ở: danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng — tức mọi nơi hiển thị giá phía khách.

## Backend (server/src/services/customer/order.service.js — createOrder)

- Sau khi xác định khách (`customer` tra theo email, hiện tại dòng ~94), thêm tính `tierDiscount`:
  - Tra hạng của khách: dùng `resolveTier(tiers, total_spent)` (giống `getUserMembership`) hoặc `tier_id` lưu sẵn.
  - `tierDiscount = Math.round(total_amount * discount_percent / 100)`.
  - Chỉ áp dụng khi khách là thành viên thực sự. Khách vãng lai / đơn admin tạo (không có khách) → `tierDiscount = 0`.
- Cộng dồn:
  - `final_amount = total_amount - couponDiscount - tierDiscount - pointsDiscount`
  - `discount_amount = couponDiscount + tierDiscount + pointsDiscount`
- **Fix luôn bug hiện tại**: khi có coupon, server đang ghi đè `discount_amount`/`final_amount` bằng giá trị coupon-only (`order.service.js:74-75`) làm **điểm thưởng bị rớt**. Thiết kế mới tính gộp cả 3 nguồn.
- Không đổi schema (dùng sẵn `discount_amount`/`final_amount`), không cần migration.

### Cơ chế truyền `pointsDiscount`
- Thêm field `points_discount_amount: Joi.number().precision(2).min(0).default(0)` vào `createOrder` schema (`server/src/validators/customer/order.validator.js`).
- Checkout gửi `points_discount_amount: pointsDiscount` trong `orderPayload` (tách riêng, không gộp vào `discount_amount` nữa).
- Server dùng `points_discount_amount` trong phép cộng dồn. Điểm đã bị trừ ngay khi `applyPoints` được gọi (phía checkout), nên server chỉ cần cộng vào phép tính, không trừ điểm lại lần nữa.

## Frontend

### Util + Component
- `getMemberPrice(price, discountPercent)`: `Math.round(price * (1 - discountPercent/100))`.
- Component `MemberPrice`: nhận `price`, `discountPercent` (mặc định 0). Nếu chưa đăng nhập hoặc `discountPercent === 0` → hiện `formatCurrency(price)` như cũ. Ngược lại: giá gốc gạch ngang + giá hội viên (đậm, màu primary) + label nhỏ "Giá hội viên".

### Lấy discountPercent của user
- Hook dùng chung dựa `useMembership` (`client/src/hooks/useMembership.js`) — gọi `loyaltyApi.getMembership()`, đã trả `tier.discount_percent`.
- Tránh gọi API lặp ở nhiều component: cache vào context hoặc localStorage sau khi login.

### Nơi áp dụng
- `client/src/components/ui/card.jsx` (card sản phẩm).
- `client/src/pages/ProductDetail/components/ProductInfo.jsx`.
- `client/src/pages/Cart/components/CartItem.jsx` + `CartSummary.jsx`.
- `client/src/pages/Checkout/` (OrderSummary, ConfirmModal) — thêm dòng "Ưu đãi hội viên (-x%)".
- `orderPayload` checkout gửi `points_discount_amount: pointsDiscount` (tách khỏi `discount_amount`). Server không cần nhận `tier_discount_amount` từ client vì server tự tính lại — server là nguồn sự thật.

## Quy tắc tính & trường hợp biên

- Làm tròn: `tierDiscount = Math.round(total_amount * discount_percent / 100)`; `final_amount` làm tròn 2 chữ số thập phân.
- `awardPoints`: `points = final_amount * reward_rate` — giảm hạng làm `final_amount` nhỏ hơn → điểm nhận ít hơn (hợp lý).
- `total_spent` cộng theo `final_amount` (số tiền thực trả).
- Khách vãng lai: giá gốc, không giảm hạng.
- Admin tạo đơn (`Admin/orders/create.jsx`): không tự động áp giảm hạng, admin nhập giá như hiện tại.
- Coupon tính trên `total_amount`, điểm trừ trực tiếp vào `final_amount`.

## Kiểm thử

- Frontend: `rtk npm run build --prefix client` + `rtk npm run lint --prefix client`.
- Backend: `node --check` các file server bị đụng; không có test suite tự động (placeholder).
- Thủ công: luồng đặt hàng với user có hạng (Bạc/Vàng/Kim cương) kiểm tra giá hiển thị, tổng tiền, điểm tích lũy; user vãng lai kiểm tra giá gốc.
- Nhớ restart thủ công server node (không hot-reload).
