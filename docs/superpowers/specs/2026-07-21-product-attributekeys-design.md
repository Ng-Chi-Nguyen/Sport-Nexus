# ProductAttributeKeys — Gán thuộc tính cho sản phẩm

## Vấn đề
`AttributeKeys` hiện là global (mọi attribute key khả dụng cho mọi sản phẩm). Khi tạo biến thể, người dùng thấy tất cả attribute keys — kể cả những key không liên quan.

## Giải pháp
Thêm bảng trung gian `ProductAttributeKeys` (Products ↔ AttributeKeys) để mỗi sản phẩm chỉ định rõ attribute keys nào thuộc về nó.

## Schema (Prisma)

```prisma
model ProductAttributeKeys {
    id               Int             @id @default(autoincrement())
    product_id       Int
    product          Products        @relation(fields: [product_id], references: [id], onDelete: Cascade)
    attribute_key_id Int
    attributeKey     AttributeKeys   @relation(fields: [attribute_key_id], references: [id], onDelete: Cascade)

    @@unique([product_id, attribute_key_id])
    @@map("productattributekeys")
}
```

## Backend API

Route prefix: `/api/v1/management/product-attribute-key/`

| Method | Path | Handler | Mô tả |
|--------|------|---------|-------|
| GET | `/` | `getAll` | Danh sách phân trang, filter theo product_id |
| GET | `/:id` | `getById` | Chi tiết 1 bản ghi |
| GET | `/by-product/:productId` | `getByProduct` | Tất cả attribute keys của 1 product |
| POST | `/` | `create` | Thêm mới |
| PUT | `/:id` | `update` | Cập nhật |
| DELETE | `/:id` | `delete` | Xoá |

Service pattern giống brand.service.js (management). Controller pattern giống brand.controller.js.

## Frontend

### Pages (`client/src/pages/Admin/productAttributeKey/`)
- `index.jsx` — Danh sách, filter theo product, pagination, CRUD
- `create.jsx` — Chọn product + chọn attribute keys (multi-select)
- `edit.jsx` — Sửa attribute keys của product

### API layer (`client/src/api/management/`)
- `productAttributeKeyApi.jsx` — Các hàm create, update, delete

### Loader (`client/src/loaders/management/`)
- `productAttributeKeyLoader.jsx` — Fetch danh sách, chi tiết

### Menu
- Thêm mục "Thuộc tính sản phẩm" (hoặc gộp chung với attribute-key hiện tại)

### Routes
- `management/product-attribute-key` → Index
- `management/product-attribute-key/create` → Create
- `management/product-attribute-key/edit/:id` → Edit

## Luồng ảnh hưởng
Khi tạo/sửa variant, chỉ load attribute keys theo product thay vì global.
