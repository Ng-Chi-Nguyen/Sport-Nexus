# Thiết kế: Dropdown gợi ý mã giảm giá trong ô nhập mã

Ngày: 2026-08-07

## Mục tiêu

Khi người dùng focus vào ô nhập mã giảm giá (dùng chung ở trang Checkout và ProductDetail),
hiển thị danh sách các mã giảm giá đã lưu (nút "Lưu mã") và mã được tặng để người dùng chọn
nhanh thay vì phải gõ tay.

## Phạm vi

- Cả trang Checkout (`client/src/pages/Checkout/components/OrderSummary.jsx`) lẫn
  ProductDetail (`client/src/pages/ProductDetail/index.jsx`) vì 2 trang dùng chung
  component `CouponInput`.

## Nguồn dữ liệu

1. **Mã đã lưu**: `useCoupons().savedCodes` (từ `CouponContext`, lưu localStorage
   `sportnexus_saved_coupons`). Lấy chi tiết từng mã qua `webCouponApi.getCouponsByCodes(codes)`
   (GET `/home/coupon/list?codes=...`).
2. **Mã được tặng**: `customerCouponApi.getGifted()` (GET `/customer/coupon/gifted`,
   yêu cầu đăng nhập). Chỉ gọi khi có `accessToken`.
3. Gộp 2 nguồn và dedupe theo `code`.

## Kiến trúc

### Hook mới: `client/src/hooks/useCouponSuggestions.js`

- Dùng TanStack Query (giống pattern ở `client/src/pages/settings/coupons/index.jsx`).
- Query 1: `["saved-coupons", savedCodes.join(",")]` → `webCouponApi.getCouponsByCodes(savedCodes)`,
  `enabled: savedCodes.length > 0`.
- Query 2: `["gifted-coupons"]` → `customerCouponApi.getGifted()`,
  `enabled: isLoggedIn`.
- Trả về mảng coupon đã gộp + dedupe theo `code` + cờ `isLoading`.

### Sửa `client/src/pages/ProductDetail/components/CouponInput.jsx`

- Nhận thêm props (tùy chọn): `suggestions` (danh sách mã đề xuất) và `suggestionsLoading`.
- Thêm state nội bộ: `open`, `query`.
- Hành vi:
  - Focus vào input → `setOpen(true)`.
  - Gõ ký tự → cập nhật `query`, lọc danh sách theo `code` chứa chuỗi (không phân biệt hoa/thường).
  - Không khớp mã nào → ẩn dropdown.
  - Bấm chọn một mã → `onCodeChange(code)` rồi `onApply(code)`.
  - Bấm ngoài / Esc → `setOpen(false)`.
  - Không có mã nào trong danh sách → không hiển thị dropdown.
  - Khi mã đã được áp dụng (`hasCouponApplied`) → vẫn giữ hành vi hiện tại (không hiện dropdown).

### Sửa API `onApply` nhận tham số mã

Vấn đề: `onApply` hiện tại là closure `() => applyCoupon(totalAmount, couponCode)` ở Checkout;
nếu CouponInput gọi `onCodeChange(code)` rồi gọi `onApply()` ngay, closure vẫn giữ giá trị cũ
của `couponCode`. Do đó:

- Đổi contract: `onApply(code)` — gọi từ dropdown với mã đã chọn, gọi từ nút "Áp dụng" với
  `couponCode` hiện tại.
- Checkout: `onApply={(code) => applyCoupon(totalAmount, code || couponCode)}`.
- ProductDetail: `onApply={(code) => { const c = code || couponCode; ... }}` (hiện là demo message).

## Trạng thái UI

- Loading: có thể hiện placeholder nhẹ trong dropdown nếu đang tải.
- Không có mã: không hiện dropdown.

## Kiểm chứng

- `npm run build --prefix client`
- `npm run lint --prefix client`

## Ghi chú kỹ thuật

- `CouponProvider` đã bọc toàn app trong `client/src/main.jsx` nên `useCoupons` dùng được ở mọi nơi.
- Không thay đổi API phía server; tất cả endpoint đã tồn tại.
