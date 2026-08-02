# Design: Tặng Coupon & Giới Hạn Dùng/User

Ngày: 2026-08-03
Trạng thái: Đã duyệt bởi user

## Mục tiêu

1. **Giới hạn số lần dùng theo user**: mỗi coupon có `max_uses_per_user` (mặc định 1), ngăn 1 user dùng cùng 1 mã quá số lần cho phép.
2. **Tính năng tặng coupon**: admin gán một coupon công khai có sẵn cho một user cụ thể; user đăng nhập thấy coupon được tặng trong trang "Mã của tôi".

## Quyết định đã thống nhất

- Hình thức tặng: **gán coupon công khai có sẵn** (không tạo mã mới riêng cho user).
- Giới hạn dùng/user: **cấu hình theo từng coupon** (`max_uses_per_user`).
- **Bắt buộc đăng nhập** mới được dùng mã giảm giá. Mọi coupon (public lẫn được tặng) đều bị giới hạn số lần/user. Khách vãng lai không dùng được coupon.
- Admin chọn **1 user** (tìm theo email/tên/SĐT), tặng từ nút "Tặng" trên danh sách coupon (modal).
- User thấy coupon được tặng trong **section "Coupon được tặng"** trên trang `/coupons` ("Mã của tôi").
- Tặng trùng (cùng user + cùng coupon) → từ chối (unique constraint).
- Kiến trúc: **bảng `UserCoupons` theo dõi cả tặng lẫn dùng** (`used_count`, `is_gift`).

## Data model (server/prisma/schema.prisma)

### `Coupons` — thêm trường

```prisma
model Coupons {
    id                Int      @id @default(autoincrement())
    code              String   @unique
    discount_value    Int
    discount_type     DiscountType @default(CASH)
    max_discount      Int
    min_order_value   Int
    start_date        DateTime
    end_date          DateTime
    usage_limit       Int
    usage_count       Int      @default(0)
    is_active         Boolean
    max_uses_per_user Int      @default(1)   // MỚI
    deleted_at        DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))
    Orders            Orders[]
    Users             Users[]
    UserCoupons       UserCoupons[]  // MỚI
    created_at        DateTime @default(now())
    updated_at        DateTime @updatedAt

    @@map("coupons")
}
```

### Model mới `UserCoupons`

```prisma
model UserCoupons {
    id         Int      @id @default(autoincrement())
    user_id    Int
    coupon_id  Int
    used_count Int      @default(0)
    is_gift    Boolean  @default(false)
    created_at DateTime @default(now())
    updated_at DateTime @updatedAt
    user       Users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
    coupon     Coupons  @relation(fields: [coupon_id], references: [id], onDelete: Cascade)

    @@unique([user_id, coupon_id])
    @@map("user_coupons")
}
```

- `@@unique([user_id, coupon_id])`: 1 record/user/coupon; chống tặng trùng.
- `is_gift = true`: record do admin tặng.
- `is_gift = false`: record ngầm tạo khi user dùng coupon public lần đầu.
- `used_count`: tăng atomic qua `updateMany` có điều kiện.

### `Users` — thêm quan hệ

```prisma
UserCoupons UserCoupons[]
```

### Permission mới

`server/prisma/data/permissions.js` — thêm vào `couponPermissions`:

```js
{ slug: 'tang-ma-giam-gia', name: 'Tặng mã giảm giá', module: 'coupons', action: 'tang' }
```

## Backend API

### 1. Check coupon — chuyển sang endpoint có auth

- **Mới** `POST /api/v1/customer/coupon/check` (`verifyToken`)
  - Body: `{ amount, code }`
  - Validate: coupon tồn tại, `deleted_at = ACTIVE`, `is_active`, trong hạn, `amount >= min_order_value`, `usage_count < usage_limit`.
  - Giới hạn/user: `UserCoupons.used_count < coupon.max_uses_per_user` (đọc từ record user+code nếu có; chưa có record thì coi như 0 lần dùng).
  - Trả: `{ discount, newAmount, remaining_uses }` hoặc message lỗi.
- Client checkout đổi từ `POST /management/coupon/check` sang endpoint mới.
- Không xóa `/management/coupon/check` ngay trong đợt này (tránh phá flow khác) nhưng client không còn gọi nữa.

### 2. Tặng coupon (admin)

- **Mới** `POST /api/v1/management/coupon/gift` (`verifyToken` + `checkPermission("tang-ma-giam-gia")`)
  - Body: `{ coupon_id, user_id }`
  - Validate: coupon tồn tại, `is_active`, chưa hết hạn, không deleted; user tồn tại, không deleted.
  - Tạo `UserCoupons { is_gift: true, used_count: 0 }`.
  - Trùng `(user_id, coupon_id)` → 409 `"Coupon này đã được tặng cho user này rồi"`.
  - Gắn `logAction` (entity `UserCoupons`).

### 3. Danh sách coupon được tặng (user)

- **Mới** `GET /api/v1/customer/coupon/gifted` (`verifyToken`)
  - Trả các `UserCoupons { is_gift: true }` của user đang đăng nhập, include coupon + trạng thái hiệu lực.

### 4. Tạo đơn (`createOrder`) — khâu then chốt

- Thêm middleware auth tùy chọn `verifyTokenOptional`:
  - Đơn không coupon: cho phép khách vãng lai (hành vi hiện tại).
  - Đơn **có `coupon_code`**: bắt buộc đăng nhập; lấy user từ token, **không tin `user_email` từ client** cho mục đích enforce.
- Trong transaction (nếu có coupon):
  - Validate lại phía server: coupon tồn tại, active, hạn, `usage_count < usage_limit`, `amount >= min_order_value`.
  - **Tính lại `discount_amount` từ server** (không tin client) — fix luôn lỗ hổng hiện hữu.
  - Giới hạn/user (atomic, chống race) — gồm 2 bước trong cùng transaction:
    1. `upsert` đảm bảo record tồn tại (record ngầm `is_gift=false` nếu user dùng coupon public lần đầu; record `is_gift=true` nếu đã được tặng):
       ```js
       await tx.userCoupons.upsert({
         where: { user_id_coupon_id: { user_id, coupon_id } },
         create: { user_id, coupon_id, used_count: 0 },
         update: {}, // no-op, chỉ đảm bảo tồn tại
       });
       ```
    2. `updateMany` có điều kiện tăng đếm (chỉ tăng khi chưa vượt limit):
       ```js
       const result = await tx.userCoupons.updateMany({
         where: { user_id, coupon_id, used_count: { lt: max_uses_per_user } },
         data: { used_count: { increment: 1 } },
       });
       if (result.count === 0) throw ... "Bạn đã dùng hết số lần của mã này";
       ```
    - `max_uses_per_user` đọc từ `Coupons` ngay trong transaction.

### 5. Validator

`server/src/validators/management/coupon.validator.js`:
- `createCoupon` + `updateCoupon`: thêm `max_uses_per_user: Joi.number().integer().min(1).default(1)`.

## Client UI

### Admin — nút "Tặng" trên danh sách coupon

`client/src/pages/Admin/coupons/index.jsx`:
- Mỗi dòng coupon thêm nút "Tặng" → mở modal.
- Modal: ô tìm kiếm (debounce ~300ms) gọi `GET /management/user?search=...` (service đã hỗ trợ tìm theo `full_name`, `email`, `phone_number`), chọn 1 user, bấm gửi → gọi `POST /management/coupon/gift`.
- Hiển thị toast thành công / đã tặng trước đó (409).

### Admin — form coupon

Trang create/edit (`client/src/pages/Admin/coupons/create.jsx`, `edit.jsx`):
- Thêm input "Số lần tối đa/user" (`max_uses_per_user`, mặc định 1).

### User — trang "Mã của tôi"

`client/src/pages/coupons/index.jsx`:
- Nếu đăng nhập: thêm section "Coupon được tặng" (fetch `GET /customer/coupon/gifted`), render bằng `CouponCard` có sẵn.
- Nếu chưa đăng nhập: giữ nguyên hành vi hiện tại.

### User — checkout

`client/src/hooks/useCoupon.js`:
- `applyCoupon` đổi sang gọi `POST /customer/coupon/check`.
- Nếu chưa đăng nhập và nhập mã → hiện "Vui lòng đăng nhập để dùng mã giảm giá".

## Edge cases

- Tặng coupon hết hạn/inactive/deleted → từ chối lúc tặng.
- Coupon hết hạn sau khi tặng → `CouponCard` tự render disabled.
- Race condition (2 đơn cùng lúc) → `updateMany` có điều kiện trong transaction.
- Đơn hủy/hoàn tiền vẫn tính vào số lần dùng (nhất quán với `usage_count` toàn cục hiện tại).
- Coupon bắt buộc đăng nhập → khách vãng lai không dùng được.

## Verification

- Backend: startup/syntax check + test tay bằng curl: gift, check, createOrder (có coupon / không coupon / dùng vượt limit / tặng trùng). Không có test suite.
- Frontend: `npm run build --prefix client` + `npm run lint --prefix client`.
- Đổi contract API (`check`) → verify cả client lẫn server.

## YAGNI (không làm)

- Lịch sử tặng / revoke tặng ở admin.
- Email thông báo khi được tặng.
- Gửi hàng loạt nhiều user.
- Mã coupon riêng cho từng user.

## Lưu ý migration

Migrations chưa versioned. Sau khi sửa `schema.prisma`, cần chạy `prisma migrate dev` hoặc `prisma db push` thủ công.
