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
- `CouponContext` (localStorage) giống `WishlistContext`, có cross-tab sync.
- Component `CouponCard` dùng chung (auto-save khi copy + trạng thái disabled).
- Section mã giảm giá trên trang home.
- Trang `/khuyen-mai` = danh sách mã đã lưu (bao gồm mã hết hiệu lực, hiển thị disabled).
- Backend: endpoint `GET /home/coupon/list?codes=...`.

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
- **Đồng bộ cross-tab**: thêm `window.addEventListener("storage", ...)` — khi tab khác đổi `sportnexus_saved_coupons` thì cập nhật lại `savedCodes` trong state; dọn listener khi unmount.
- Provider đăng ký trong `main.jsx`, đặt cùng vị trí với `WishlistProvider`.

### 2. Component `CouponCard` (`client/src/components/ui/couponCard.jsx`)

Dùng chung cho home và `/khuyen-mai`:
- Hiển thị: mức giảm (CASH → `formatCurrency(discount_value)`; PERCENTAGE → `-{discount_value}%` + "Giảm tối đa ..."), code, đơn tối thiểu, hạn dùng, lượt đã dùng.
- Nút **lưu mã** (icon `Bookmark`/tim, đỏ khi đã lưu) → gọi `toggleSave`.
- Nút **Copy mã**: copy vào clipboard, hiện "Đã copy" 2 giây. **Auto-save khi copy** — nếu mã chưa được lưu thì gọi `toggleSave(coupon)` trước khi copy (người dùng copy mã đồng nghĩa muốn giữ mã).
- **Trạng thái vô hiệu (disabled)**: tính từ dữ liệu coupon:
  - `usage_count >= usage_limit` → badge **"Hết lượt"**.
  - `end_date < now` → badge **"Hết hạn"**.
  - `is_active === false` → badge **"Ngưng hiệu lực"**.
  - Card bị làm mờ (grayscale/opacity), nút Lưu và Copy bị disable.
- Nhận prop `coupon`.

### 3. Trang home (`client/src/pages/Home/index.jsx`)

- Backend: `homeService.getHomePageData()` trả thêm `coupons` (danh sách coupon active, tái sử dụng logic trong `web/coupon.service.js`).
- Client: thêm section "Mã giảm giá" giữa `MiddleBanner` hoặc sau `NewArrivals`, hiển thị lưới `CouponCard`. Section ẩn khi không có coupon.

### 4. Trang `/khuyen-mai` (`client/src/pages/coupons/index.jsx`)

Đổi thành "Mã của tôi" giống hệt cấu trúc trang favorites:
- Breadcrumb: "Trang chủ / Mã của tôi".
- `mt-6 md:mt-8`, lưới `CouponCard`.
- Fetch theo `savedCodes` qua endpoint mới `couponApi.getCouponsByCodes(codes)` — **không lọc active**, để mã đã lưu nhưng hết hạn/hết lượt vẫn hiển thị dưới dạng disabled (tránh "nhớ đã lưu mà tìm không thấy").
- Empty state khi chưa lưu mã nào: icon + "Chưa lưu mã giảm giá nào".
- Nếu `savedCodes` rỗng thì không cần fetch.

### 5. Backend: endpoint lấy mã theo danh sách code

- `GET /home/coupon/list?codes=FREESHIP,WELCOME10` (giống `product/by-ids`):
  - `web/coupon.service.js` thêm `getCouponsByCodes(codes)` — `findMany({ where: { code: { in: codes }, deleted_at: ACTIVE } })`, **không lọc** `is_active`/thời hạn để client tự tính trạng thái disabled.
  - Thêm controller method + route `GET /list` trong `routes/web/coupon.route.js`.
- `homeService.getHomePageData()` trả thêm `coupons` (danh sách **active** — tái sử dụng `getActiveCoupons`) cho section home.

### Data flow

```
Home loader (server: home.service) --coupons--> Home section -> CouponCard
CouponCard --toggleSave--> CouponContext -> localStorage sportnexus_saved_coupons
CouponContext <--storage event-->  tab khác (cross-tab sync)
/khuyen-mai: couponApi.getCouponsByCodes(savedCodes) -> CouponCard (disabled nếu hết hạn/hết lượt)
```

### Xử lý lỗi / edge case

- Chưa lưu mã nào: trang `/khuyen-mai` hiện empty state, không gọi API.
- Mã đã lưu bị hết hạn/hết lượt/ngưng hiệu lực: **vẫn hiển thị** nhưng mờ kèm badge tương ứng, không copy/lưu được (khác với mã chưa bao giờ lưu — sẽ không xuất hiện vì không nằm trong `savedCodes`).
- Copy mã chưa lưu → tự động lưu (auto-save) rồi mới copy.
- Mở 2 tab: lưu/bỏ lưu ở tab này sẽ sync real-time sang tab kia nhờ `storage` event.
- Không có coupon active: section home ẩn; `/khuyen-mai` vẫn hiển thị mã đã lưu (kể cả khi hết hiệu lực).

### Verification

- `npm run build --prefix client` và `npm run lint --prefix client`.
- Kiểm tra endpoint `GET /home/coupon/list?codes=...` trả mã không lọc active.
- Kiểm tra thủ công bằng agent-browser: lưu/bỏ lưu mã trên home, copy mã chưa lưu → tự lưu, xem "Mã của tôi" tại `/khuyen-mai` (mã hết hạn hiển thị disabled), refresh kiểm tra persist, mở 2 tab kiểm tra sync.
