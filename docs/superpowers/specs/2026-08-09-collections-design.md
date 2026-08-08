# Thiết kế tính năng: Bộ sưu tập (Collections)

Ngày: 2026-08-09
Trạng thái: Đã chốt yêu cầu, chờ triển khai

## Mục tiêu
Tạo tính năng "Bộ sưu tập" theo chủ đề (ví dụ: Chạy bộ, Bóng đá, Gym) để nhóm sản phẩm
tự động theo danh mục, kèm banner + tiêu đề + mô tả. Gồm trang hiển thị web và trang quản lý admin.

## Quyết định đã chốt (từ hỏi làm rõ)
- **Cách lấy sản phẩm: Cách A** — mỗi collection gắn với **1 danh mục**, sản phẩm tự động
  lấy theo danh mục đó. **Không** dùng bảng trung gian, không gán tay.
- **Phạm vi đợt này: Đầy đủ** — model + backend web + admin CRUD + trang web danh sách/chi tiết
  + hiển thị entry trên Home.

## Yêu cầu phi chức năng
- Tuân thủ AGENTS.md: HTTP trong `controllers/**`, logic trong `services/**`, schema trong
  `validators/**`. Route admin/user chạm dữ liệu nhạy cảm phải `verifyToken` + `checkPermission`.
- Không log secret/token.
- Thay đổi schema được nêu rõ ở phần Migration dưới đây (AGENTS.md yêu cầu).
- Frontend: tái dùng `ProductCard`, `Suspense` cho lazy route.

## Mô hình dữ liệu (thay đổi schema)
Thêm model `Collections` (đối xứng với `Categories`):

```
model Collections {
  id          Int        @id @default(autoincrement())
  name        String
  slug        String
  banner      String?    @db.Text
  description String?    @db.Text
  is_active   Boolean    @default(true)
  deleted_at  DateTime   @default(dbgenerated("'1000-01-01 00:00:00'"))
  created_at  DateTime   @default(now())
  updated_at  DateTime   @updatedAt
  category_id Int
  category    Categories @relation(fields: [category_id], references: [id], onDelete: Cascade)

  @@unique([slug, deleted_at])
  @@map("collections")
}
```

Sản phẩm của collection = `Products` có `is_active=true`, `deleted_at` default,
`category_id = collections.category_id`, có ít nhất 1 variant `stock>0`, `deleted_at` default
(tái dùng `productSelect` + `mapProduct` + `mapProductsWithSold` ở `home.service.js`).

## Backend

### Web (khách)
- `server/src/services/web/collection.service.js`:
  - `getCollections()` → danh sách collection `is_active` (có banner, category info).
  - `getCollectionBySlug(slug)` → thông tin collection + `products` (đã map + sold_count).
- `server/src/controllers/web/collection.controller.js`: handler `GET /api/web/collections`,
  `GET /api/web/collections/:slug`.
- `server/src/validators/web/collection.validator.js`: validate `slug`.
- Đăng ký route trong nhóm web routes.

### Admin (quản lý)
- `server/src/services/management/collection.service.js`: CRUD `Collections`
  (create/update/list/get/delete-soft), lọc `is_active`, tìm theo `slug`.
- `server/src/controllers/management/collection.controller.js`: handlers CRUD, kèm
  `verifyToken` + `checkPermission`.
- `server/src/validators/management/collection.validator.js`: schema create/update.
- Upload banner qua Supabase Storage (giống pattern product thumbnail).

## Frontend — Web
- Route mới trong `client/src/routes/webRoute.jsx`:
  - `bo-suu-tap` → trang danh sách collections.
  - `bo-suu-tap/:slug` → trang chi tiết (banner + title + description + lưới sản phẩm).
- Thêm loader tương ứng trong `client/src/routes/webLoader.js`.
- Trang chi tiết tái dùng `ProductCard`; lazy-load + bọc trong `Suspense`.
- Entry point: thêm menu "Bộ sưu tập" vào thanh điều hướng header, dẫn đến `/bo-suu-tap`
  (trang danh sách). Không cần card banner riêng trên Home.

## Frontend — Admin
- Trang mới `client/src/pages/Admin/collections/` (index/create/edit) theo mẫu
  `Admin/categories`: form gồm name, slug, category_id (dropdown), banner (upload),
  description, is_active.
- Đăng ký route trong `client/src/routes/adminRoutes.jsx` dưới `management`.
- i18n: thêm keys trong `client/src/locales/{vi,en}/dashboard.json` (nhánh `collection`).

## Migration & Seed
- Tạo migration: `npx prisma migrate dev --name add_collections` (project đã versioned
  migrations trong `server/prisma/migrations`).
- Seed mẫu vài collection (vd Chạy bộ, Bóng đá, Gym) gắn các category hiện có —
  thêm vào `server/prisma/seed.js` hoặc file `seed-collections.js` riêng theo pattern hiện tại.

## Verification
- Backend: `node --check` từng file mới; chạy thử startup server; không có test suite nên
  mô tả gap.
- Frontend: `npm run build --prefix client` và `npm run lint --prefix client`.

## Ghi chú
- Feature này độc lập với 3 ý tưởng còn lại (Flash sale, Tích điểm, Thông báo hết hàng).
- Entry Home tạm thời chỉ hiển thị khi có collection active (không hardcode).
