# Thiết kế: Lưu mã giảm giá (giống wishlist)

Ngày: 2026-07-31

## Vấn đề

Hiện tại khách hàng chỉ có thể xem danh sách mã giảm giá đang hiệu lực tại trang `/khuyen-mai` (mã công khai, ai cũng áp được). Chưa có cơ chế để khách hàng "lưu" mã giảm giá quan tâm để dùng sau, và chưa có chỗ hiển thị mã giảm giá trên trang chủ.

## Mục tiêu

- Hiển thị mã giảm giá đang hiệu lực trên **trang home**.
- Cho phép khách hàng **lưu mã giảm giá** bằng một nút (giống nút tim của wishlist), dữ liệu lưu ở **localStorage** (không cần đăng nhập, không đụng database).
- Trang `/khuyen-mai` trở thành "Mã của tôi": chỉ hiển thị các mã đã lưu.

## Phạm vi

**Trong scope:**
- `CouponContext` (localStorage) giống `WishlistContext`.
- Component `CouponCard` dùng chung.
- Section mã giảm giá trên trang home.
- Trang `/khuyen-mai` = danh sách mã đã lưu.

**Ngoài scope (đã chốt với user):**
- Không ép quy tắc "1 mã / 1 user" ở server-side (mô hình localStorage không hỗ trợ). Việc nhập lại mã nhiều lần khi mua vẫn như hiện tại (mã công khai).
- Không làm cơ chế claim, mã chào mừng khi đăng ký, hay đổi điểm tích lũy.
- Không thay đổi schema database.

## Thiết kế

### 1. CouponContext (`client/src/contexts/CouponContext.jsx`)

Giống `WishlistContext`:
- LocalStorage key: `sportnexus_saved_coupons`, lưu mảng `code` (chuỗi).
- API: `savedCodes`, `isSaved(code)`, `toggleSave(coupon)`, `count`.
- `toggleSave` nhận nguyên object coupon nhưng chỉ lưu `code` vào mảng.
- Provider đăng ký trong `main.jsx`, đặt cùng vị trí với `WishlistProvider`.

### 2. Component `CouponCard` (`client/src/components/ui/couponCard.jsx`)

Dùng chung cho home và `/khuyen-mai`:
- Hiển thị: mức giảm (CASH → `formatCurrency(discount_value)`; PERCENTAGE → `-{discount_value}%` + "Giảm tối đa ..."), code, đơn tối thiểu, hạn dùng, lượt đã dùng.
- Nút **lưu mã** (icon `Bookmark`/tim, đỏ khi đã lưu) → gọi `toggleSave`.
- Nút **Copy mã** → `navigator.clipboard`, hiện "Đã copy" 2 giây.
- Nhận prop `coupon`.

### 3. Trang home (`client/src/pages/Home/index.jsx`)

- Backend: `homeService.getHomePageData()` trả thêm `coupons` (danh sách coupon active, tái sử dụng logic trong `web/coupon.service.js`).
- Client: thêm section "Mã giảm giá" giữa `MiddleBanner` hoặc sau `NewArrivals`, hiển thị lưới `CouponCard`. Section ẩn khi không có coupon.

### 4. Trang `/khuyen-mai` (`client/src/pages/coupons/index.jsx`)

Đổi thành "Mã của tôi" giống hệt cấu trúc trang favorites:
- Breadcrumb: "Trang chủ / Mã của tôi".
- `mt-6 md:mt-8`, lưới `CouponCard`.
- Fetch `couponApi.getActiveCoupons()` (endpoint đã có), lọc theo `savedCodes` trong `CouponContext`.
- Empty state khi chưa lưu mã nào: icon + "Chưa lưu mã giảm giá nào".
- Nếu `savedCodes` rỗng thì không cần fetch.

### Data flow

```
Home loader (server: home.service) --coupons--> Home section -> CouponCard
CouponCard --toggleSave--> CouponContext -> localStorage sportnexus_saved_coupons
/khuyen-mai: couponApi.getActiveCoupons() -> lọc theo savedCodes -> CouponCard
```

### Xử lý lỗi / edge case

- Chưa lưu mã nào: trang `/khuyen-mai` hiện empty state, không gọi API.
- Coupon bị admin tắt/đã hết hạn: không còn xuất hiện trong danh sách active → tự biến mất khỏi "Mã của tôi" (mã đã lưu nhưng không active sẽ không hiển thị).
- Không có coupon active: section home ẩn, trang `/khuyen-mai` hiện empty state.

### Verification

- `npm run build --prefix client` và `npm run lint --prefix client`.
- Kiểm tra thủ công bằng agent-browser: lưu/bỏ lưu mã trên home, xem "Mã của tôi" tại `/khuyen-mai`, refresh kiểm tra persist.
