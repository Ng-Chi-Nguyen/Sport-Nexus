# Thiết kế tính năng #6: Chương trình tích điểm / Thành viên

- **Ngày:** 2026-08-09
- **Trạng thái:** Đã duyệt
- **Tính năng:** Hệ thống hạng thành viên dựa trên tổng chi tiêu + quỹ điểm dùng chung (vừa quy đổi tiền thanh toán vừa đổi voucher/ưu đãi).

## 1. Mục tiêu

Cung cấp chương trình khách hàng thân thiết: mỗi người dùng có một **hạng thành viên** xác định theo tổng chi tiêu tích lũy, và một **quỹ điểm dùng chung** tích lũy từ mỗi đơn hoàn thành. Điểm vừa dùng để quy đổi tiền khi thanh toán, vừa dùng để đổi voucher/mã giảm giá. Toàn bộ quy tắc (ngưỡng hạng, hệ số điểm, tỷ lệ quy đổi, bảng đổi quà) do admin quản lý trong DB.

## 2. Phạm vi

**Trong phạm vi:**
- Hạng thành viên (số hạng cố định, ngưỡng linh hoạt) theo `total_spent`.
- Quỹ điểm dùng chung; tích điểm khi đơn `Delivered`.
- Dùng điểm quy đổi tiền tại checkout (cấu hình tỷ lệ trong DB).
- Dùng điểm đổi voucher/mã giảm giá (tái dùng cơ chế `Coupons`/`UserCoupons`).
- Hiển thị hạng/điểm/tổng chi/tiến độ tại: hồ sơ cá nhân, tổng quan tài khoản, header (cạnh avatar/email), và tích hợp dùng điểm tại checkout.
- Admin: CRUD hạng, CRUD bảng đổi quà, cấu hình tỷ lệ quy đổi, xem hạng/điểm/lịch sử điểm người dùng.

**Ngoài phạm vi:**
- Không đổi cơ chế tính `total_spent` của dashboard (đang tính động từ `Orders`).
- Không thêm thanh toán/đổi quà qua sản phẩm vật lý (chỉ voucher/mã giảm giá).
- Không có điểm hết hạn tự động, không chuyển nhượng điểm.

## 3. Kiến trúc

- **Schema mới:** `MembershipTiers`, `PointTransactions`, `TierRewards`, `LoyaltySettings`.
- **Sửa `Users`:** thêm `points_balance`, `total_spent` (cache), `tier_id`.
- **Backend:** service tách `server/src/services/...` (web + management), controller + route tương ứng, mọi route user/admin được bảo vệ.
- **Frontend:** trang người dùng (profile/overview), block hiển thị ở header, tích hợp checkout dùng điểm, trang admin quản lý.

> **Lưu ý migration:** tính năng này thay đổi schema Prisma. Migration chưa được version hóa; cần nêu rõ thay đổi schema trong báo cáo và chạy seed tạo dữ liệu ban đầu.

## 4. Schema Prisma

### 4.1 Bảng mới

**`MembershipTiers`** — hạng thành viên (seed cố định, admin sửa ngưỡng/hệ số):
- `id Int @id @default(autoincrement())`
- `name String`
- `min_spent Decimal @db.Decimal(10,2)` — tổng chi tối thiểu để đạt hạng
- `reward_rate Decimal @db.Decimal(5,2)` — hệ số điểm nhân khi tích điểm (vd `0.01` = 1 điểm / 100 VND)
- `discount_percent Int @default(0)` — ưu đãi giảm giá theo hạng
- `sort_order Int @default(0)` — thứ tự hạng (thấp → cao)
- `is_active Boolean @default(true)`
- `deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))`
- `TierRewards TierRewards[]`
- `Users Users[]`
- `@@map("membership_tiers")`

**`PointTransactions`** — nhật ký điểm (truy vết):
- `id Int @id @default(autoincrement())`
- `user_id Int`
- `type String` — `EARN` | `SPEND` | `REDEEM` | `ADJUST`
- `points Int` — số điểm cộng (+) hoặc trừ (−)
- `balance_after Int` — số dư sau giao dịch
- `order_id Int?`
- `coupon_id Int?`
- `note String?`
- `created_at DateTime @default(now())`
- relation `user Users`, `order Orders?`, `coupon Coupons?`
- `@@index([user_id])`, `@@map("point_transactions")`

**`TierRewards`** — bảng đổi quà riêng mỗi hạng:
- `id Int @id @default(autoincrement())`
- `tier_id Int`
- `name String`
- `point_cost Int` — số điểm cần để đổi
- `coupon_code String?` — mã coupon được cấp khi đổi (tái dùng `Coupons`)
- `is_active Boolean @default(true)`
- `deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))`
- relation `tier MembershipTiers`
- `@@map("tier_rewards")`

**`LoyaltySettings`** — cấu hình key-value:
- `id Int @id @default(autoincrement())`
- `key String @unique`
- `value String`
- `updated_at DateTime @updatedAt`
- `@@map("loyalty_settings")`

Key dự kiến: `points_to_money_rate` (vd `"1000"` = 1 điểm = 1000 VND).

### 4.2 Sửa `Users`

Thêm:
- `points_balance Int @default(0)`
- `total_spent Decimal @default(0) @db.Decimal(10,2)`
- `tier_id Int?`
- relation `tier MembershipTiers?`

## 5. Backend

### 5.1 Service web — `server/src/services/web/loyalty.service.js` (mới)

**`getUserMembership(userId)`** — lấy hạng, điểm, tổng chi, tiến độ lên hạng:
1. Lấy `Users` (kèm `tier`) + `LoyaltySettings.points_to_money_rate`.
2. Xác định hạng hiện tại theo `total_spent` so với `MembershipTiers.min_spent` (hạng cao nhất có `min_spent <= total_spent`).
3. Lấy hạng kế tiếp (sort_order cao hơn) để tính tiến độ.
4. Trả về: `{ tier, points_balance, total_spent, next_tier, progress }`.

**`getTierRewards(userId)`** — danh sách quà đổi được theo hạng hiện tại (của user).

**`redeemReward(userId, rewardId)`** — đổi quà:
1. Kiểm tra reward thuộc hạng hợp lệ, `is_active`, chưa xóa.
2. Kiểm tra đủ điểm (`points_balance >= point_cost`).
3. Trừ điểm (SPEND/REDEEM), ghi `PointTransactions`.
4. Cấp coupon cho user qua `UserCoupons` (tái dùng cơ chế hiện có); nếu reward có `coupon_code`, đảm bảo coupon tồn tại & gắn cho user.
5. Trả về coupon/code đã cấp.

### 5.2 Service tích điểm — khi đơn hoàn thành

**`awardPoints(orderId)`** — gọi khi đơn chuyển sang `Delivered`:
1. Lấy order (kèm `usersId`); bỏ qua nếu không có user hoặc đã tích điểm (guard chống trùng).
2. `points = floor(final_amount × reward_rate)` dựa trên hạng hiện tại của user.
3. Cập nhật `points_balance += points`, `total_spent += final_amount`, ghi `PointTransactions` (EARN).
4. Cập nhật `tier_id` theo ngưỡng `total_spent` mới.

> Điểm tích dựa trên `final_amount` **sau khi đã trừ điểm dùng/giảm giá** (theo quyết định).
>
> **Điểm hook:** trong `server/src/services/customer/order.service.js`, block `if (dataUpdate.status === 'Delivered')` (sau khi `paymentService.markCodPaid`) — gọi `loyaltyService.awardPoints(Number(orderId))` tại đây.

### 5.3 Service dùng điểm tại checkout

**`applyPoints(userId, pointsUsed)`**:
1. Kiểm tra đủ điểm, `pointsUsed <= points_balance`.
2. Quy đổi: `amount = pointsUsed × points_to_money_rate`.
3. Trừ điểm (SPEND), ghi `PointTransactions`.
4. Trả về số tiền được giảm để tích hợp vào `final_amount`.

Việc hook vào quy trình đặt hàng hiện tại (giảm `final_amount`, tách khỏi `discount_amount` coupon) cần tích hợp cẩn thận trong service order — xác định rõ vị trí cụ thể ở giai đoạn viết plan.

### 5.4 Controller & route

**Web (user) — `server/src/controllers/web/loyalty.controller.js` + route:**
- `GET /api/v1/home/loyalty/membership` — thông tin hạng/điểm (user hiện tại).
- `GET /api/v1/home/loyalty/rewards` — bảng đổi quà theo hạng.
- `POST /api/v1/home/loyalty/rewards/:rewardId/redeem` — đổi quà.
- `GET /api/v1/home/loyalty/transactions` — lịch sử điểm.
- `POST /api/v1/home/loyalty/apply-points` — dùng điểm (body `points`), trả tiền giảm.

Tất cả route user đều bảo vệ `verifyToken` (đọc user từ token).

**Management (admin) — `server/src/controllers/management/loyalty.controller.js` + route:**
- CRUD `MembershipTiers`.
- CRUD `TierRewards`.
- Update `LoyaltySettings` (tỷ lệ quy đổi).
- Xem danh sách user + hạng/điểm/tổng chi; xem `PointTransactions` theo user.

Tất cả route admin bảo vệ `verifyToken` + `checkPermission`.

## 6. Frontend

### 6.1 Hiển thị cho người dùng

- **Hồ sơ cá nhân & tổng quan tài khoản:** block "Thành viên" hiển thị tên hạng, điểm, tổng chi, tiến độ lên hạng kế tiếp, nút mở bảng đổi quà và lịch sử điểm.
- **Header:** badge hạng + số điểm nhỏ cạnh avatar/email (nếu đã đăng nhập).

### 6.2 Checkout dùng điểm

- Ô nhập số điểm muốn dùng (hiển thị tối đa khả dụng & số tiền quy đổi).
- Áp dụng → gọi `POST /home/loyalty/apply-points`, giảm `final_amount`.
- Nút chọn đổi voucher từ bảng đổi quà → cấp coupon áp dụng như coupon hiện có.

### 6.3 Admin

- Trang quản lý hạng (sửa ngưỡng, hệ số, giảm giá).
- Trang quản lý bảng đổi quà (tên, điểm, coupon_code).
- Trang cấu hình tỷ lệ quy đổi điểm→tiền.
- Trang xem người dùng: hạng, điểm, tổng chi, lịch sử điểm.

## 7. Data flow

1. Đơn đặt → `Processing` → ... → `Delivered`: hook `awardPoints` chạy, cập nhật điểm + tổng chi + hạng.
2. User mở profile/overview → `GET membership` → hiển thị hạng/điểm/tiến độ.
3. Checkout: user nhập điểm → `applyPoints` → giảm tiền; hoặc đổi reward → nhận coupon.
4. Admin cấu hình quy tắc → user thấy cập nhật ở lần tải sau.

## 8. Error handling & Loading

- Mọi route user yêu cầu đăng nhập; nếu chưa → 401 (guard `verifyToken`).
- Thiếu điểm / reward không hợp lệ → 400 với message rõ ràng.
- `awardPoints` có guard chống tích trùng (chỉ 1 lần/order).
- Frontend: trạng thái loading, lỗi không làm hỏng trang; block thành viên ẩn nếu chưa đăng nhập.

## 9. Testing

- **Backend:** `node --check` các file thay đổi; backend chưa có test suite — kiểm tra bằng HTTP request trực tiếp (seed data + flow).
- **Frontend:** `npm run build --prefix client` + `npm run lint --prefix client`.
- **UI:** kiểm tra profile/overview/header/checkout hiển thị & dùng điểm; kiểm tra admin CRUD.

## 10. File thay đổi dự kiến

**Schema:**
- `server/prisma/schema.prisma` — thêm 4 bảng + sửa `Users`.
- Seed mới: tạo `MembershipTiers` (~4 hạng) + `LoyaltySettings`.

**Backend web:**
- `server/src/services/web/loyalty.service.js` — mới
- `server/src/controllers/web/loyalty.controller.js` — mới
- route web mới

**Backend management:**
- `server/src/services/management/loyalty.service.js` — mới
- `server/src/controllers/management/loyalty.controller.js` — mới
- route management mới

**Backend tích điểm:**
- Hook/service gọi `awardPoints` khi đơn `Delivered` (tích hợp vào order service hiện tại).

**Frontend:**
- Trang/block hồ sơ cá nhân, tổng quan tài khoản, header, checkout.
- Trang admin quản lý hạng / bảng đổi quà / cấu hình / user.
- i18n `vi` + `en`.

## 11. Ghi chú

- **Thay đổi schema là điểm khác biệt lớn** so với tính năng trước (vốn không đổi schema). Cần chạy migration + seed và nêu rõ trong báo cáo.
- `total_spent` cache trên `Users` phục vụ riêng cho hạng; dashboard vẫn tính động từ `Orders`, không đổi.
- Tỷ lệ quy đổi điểm→tiền lưu trong `LoyaltySettings` để admin chỉnh.
- Điểm tích theo `final_amount` sau khi trừ điểm dùng/giảm giá.
