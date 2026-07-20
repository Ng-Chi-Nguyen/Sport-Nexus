# Soft Delete — Technical Specification

## 1. Mục tiêu

Cho phép xoá mềm dữ liệu thay vì xoá cứng (`DELETE FROM`), nhằm:
- Giữ nguyên dữ liệu lịch sử phục vụ thống kê, đối soát
- Cho phép khôi phục (undo) khi cần
- Tránh mất dữ liệu tham chiếu (Orders, Reviews, StockMovements...)

## 2. Phạm vi áp dụng

Tất cả models có ràng buộc unique hoặc được tham chiếu bởi dữ liệu lịch sử:

| Model | Unique field(s) | Lý do cần soft delete |
|---|---|---|
| Users | email, phone_number | Tham chiếu từ Orders, Reviews, SystemLogs |
| Categories | slug | Sản phẩm tham chiếu category |
| Products | slug | OrderItems, Reviews tham chiếu |
| Suppliers | name | PurchaseOrders, Products tham chiếu |
| Brands | — | Products tham chiếu |
| Coupons | code | Orders tham chiếu |
| ProductVariants | (composite) | OrderItems, StockMovements, CartItems tham chiếu |

Models trung gian (OrderItems, CartItems, StockMovements, VariableAttributes, PurchaseOrderItems, ProductImages) không cần soft delete vì chúng là dữ liệu giao dịch / lịch sử.

## 3. Chiến lược: Sentinel Value

Thay vì dùng `NULL` cho active records (dễ bị duplicate do MySQL cho phép nhiều NULL trong unique index), dùng sentinel value:

- **Active:** `deleted_at = '1000-01-01 00:00:00'` (min DATETIME trong MySQL)
- **Deleted:** `deleted_at = NOW()` (thời điểm xoá)

### Lý do chọn sentinel value

| Approach | Ưu | Nhược |
|---|---|---|
| NULL | Đơn giản, query tự nhiên | MySQL cho phép nhiều NULL → duplicate tiềm ẩn ở DB layer |
| Sentinel value | DB tự đảm bảo unique tuyệt đối | Query hơi verbose hơn |

## 4. Schema changes (Prisma)

### Thêm field `deleted_at` cho mỗi model mục tiêu

```prisma
model Users {
  id        Int      @id @default(autoincrement())
  email     String
  // ... các field khác giữ nguyên
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  @@unique([email, deleted_at])
  @@unique([phone_number, deleted_at])
  @@map("users")
}
```

Pattern áp dụng cho tất cả models trong phạm vi:

```prisma
model <ModelName> {
  // ... existing fields

  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  @@unique([<unique_field>, deleted_at])
  // Nếu có nhiều unique field, thêm từng composite:
  @@unique([<unique_field_2>, deleted_at])
}
```

**Lưu ý:** Các unique cũ trên field đơn (`@unique`) phải được thay thế bằng composite `@@unique([field, deleted_at])`.

### Các model cụ thể

#### Users
```prisma
model Users {
  id                 Int             @id @default(autoincrement())
  full_name          String
  email              String
  password           String
  phone_number       String?
  avatar             String?         @db.Text
  status             Boolean         @default(true)
  is_verified        Boolean         @default(false)
  verification_token String?
  refresh_token      String?
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt
  deleted_at         DateTime        @default(dbgenerated("'1000-01-01 00:00:00'"))
  role_id            Int
  role               Roles           @relation(fields: [role_id], references: [id])
  UserAddresses      UserAddresses[]
  Orders             Orders[]
  Coupons            Coupons[]
  Carts              Carts[]
  Reviews            Reviews[]
  SystemLogs         SystemLogs[]
  permissions        Permissions[]

  @@unique([email, deleted_at])
  @@unique([phone_number, deleted_at])
  @@map("users")
}
```

#### Categories
```prisma
model Categories {
  id        Int        @id @default(autoincrement())
  name      String
  slug      String
  image     String?    @db.Text
  is_active Boolean    @default(true)
  deleted_at DateTime  @default(dbgenerated("'1000-01-01 00:00:00'"))
  Products  Products[]

  @@unique([slug, deleted_at])
  @@map("categories")
}
```

#### Products
```prisma
model Products {
  // ... existing fields (bỏ @unique trên slug)
  slug       String
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  @@unique([slug, deleted_at])
  @@map("products")
}
```

#### Suppliers
```prisma
model Suppliers {
  // ...
  name       String
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  @@unique([name, deleted_at])
  @@map("suppliers")
}
```

#### Brands
```prisma
model Brands {
  id         Int      @id @default(autoincrement())
  name       String
  logo       String?
  origin     String?  @db.Text
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))
  Products   Products[]

  @@map("brands")
}
// Brands không có unique constraint, chỉ cần thêm deleted_at
```

#### Coupons
```prisma
model Coupons {
  // ...
  code       String
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  @@unique([code, deleted_at])
  @@map("coupons")
}
```

#### ProductVariants
```prisma
model ProductVariants {
  // ...
  deleted_at DateTime @default(dbgenerated("'1000-01-01 00:00:00'"))

  // Không có unique field đơn lẻ, nhưng cần soft delete vì tham chiếu nhiều
  @@map("productvariants")
}
```

## 5. Migration

```bash
# Tạo migration
npx prisma migrate dev --name add_soft_delete
```

> **Lưu ý:** Vì đây là schema change phức tạp (thay đổi unique constraints), cần kiểm tra Prisma-generated migration script để đảm bảo nó không drop không mong muốn.

## 6. Repository / Service layer patterns

### Query helper
```ts
// server/src/utils/prisma.ts
export const ACTIVE = new Date('1000-01-01T00:00:00.000Z')
export const activeWhere = { deleted_at: ACTIVE }
export const notDeleted = { deleted_at: ACTIVE }
```

### CRUD examples

```ts
import { ACTIVE, activeWhere } from '../utils/prisma'

// FIND — chỉ lấy active records
const users = await prisma.users.findMany({
  where: { ...activeWhere, role_id: 1 }
})

// FIND — bao gồm deleted records (cho admin)
const allUsers = await prisma.users.findMany()

// SOFT DELETE
await prisma.users.update({
  where: { id: 1 },
  data: { deleted_at: new Date() }
})

// RESTORE
await prisma.users.update({
  where: { id: 1 },
  data: { deleted_at: ACTIVE }
})

// CREATE — tự động dùng sentinel value nhờ @default(dbgenerated(...))
await prisma.users.create({
  data: { email: 'abc@example.com', ... }
})
```

### Upsert với soft delete
Khi user đã soft-delete đăng ký lại:

```ts
const existing = await prisma.users.findFirst({
  where: { email: 'abc@example.com', deleted_at: { not: ACTIVE } }
})

if (existing) {
  // Restore + cập nhật thông tin mới
  await prisma.users.update({
    where: { id: existing.id },
    data: { full_name, password, deleted_at: ACTIVE, ... }
  })
} else {
  // Tạo mới
  await prisma.users.create({ data: { email: 'abc@example.com', ... } })
}
```

## 7. Relations handling

Giữ nguyên `onDelete: Cascade` cho các relations hiện tại. Với soft delete:

- **Không xoá vật lý** → cascade không bao giờ chạy
- Dữ liệu con (Orders, Reviews, ...) giữ nguyên tham chiếu đến parent đã soft-delete
- Khi query thống kê, join với parent có thể dùng `WHERE parent.deleted_at = ACTIVE` nếu cần lọc

## 8. Tác động đến API endpoints

### Existing endpoints cần cập nhật

| Layer | Thay đổi |
|---|---|
| Controllers / Services | Thêm `deleted_at: ACTIVE` vào `where` của tất cả `findMany` / `findFirst` |
| Admin endpoints | Có param `?include_deleted=true` để bỏ filter |
| DELETE endpoints | Chuyển từ `prisma.delete()` → `prisma.update({ data: { deleted_at: new Date() } })` |
| GET by id | Kiểm tra deleted_at và trả về 404 nếu record đã deleted (trừ admin) |

### New endpoints (khuyến nghị)
- `GET /api/admin/<entity>/deleted` — danh sách đã xoá
- `POST /api/admin/<entity>/:id/restore` — khôi phục

## 9. Thống kê

Khi tính toán thống kê, quyết định theo use case:

| Use case | deleted_at filter |
|---|---|
| Dashboard: tổng user đang hoạt động | `WHERE deleted_at = ACTIVE` |
| Báo cáo: doanh thu theo tháng | Không filter (giữ nguyên order) |
| Báo cáo: sản phẩm bán chạy | Không filter (giữ nguyên OrderItems) |
| Kho: tồn kho hiện tại | `WHERE deleted_at = ACTIVE` |

## 10. Migration script đặc biệt

Khi lần đầu thêm `deleted_at`, cần update các record hiện tại:

```sql
-- MySQL: set deleted_at cho records cũ
UPDATE users SET deleted_at = '1000-01-01 00:00:00';
UPDATE categories SET deleted_at = '1000-01-01 00:00:00';
-- ... tương tự cho các model khác
```

Sau đó mới thêm unique constraints.

> ⚠️ Nếu có sẵn dữ liệu trùng email/phone_number/slug (dù hiếm), cần resolve trước khi thêm composite unique.
