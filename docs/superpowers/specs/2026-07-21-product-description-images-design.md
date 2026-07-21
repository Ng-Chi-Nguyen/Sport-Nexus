# Product Description Images

## Overview
Add multiple product description images to admin product create/edit forms, leveraging the existing backend `ProductImages` API.

## Backend (no changes needed)
- `POST /api/v1/core/product-image/` — upload array (field `url`, max 10 files) + `product_id`
- `GET /api/v1/core/product-image/product/:id` — get images by product
- `PUT /api/v1/core/product-image/:id` — update (sends `current_image_ids` JSON + new files)
- `DELETE /api/v1/core/product-image/:id` — delete single image

## Frontend additions

### 1. API layer: `client/src/api/core/productImageApi.jsx`
- `getByProduct(productId)`, `create(data)`, `update(productId, data)`, `delete(imageId)`

### 2. UI Component: `MultiFileUpload` (in `client/src/components/ui/`)
- Multi-file selector with grid preview
- Delete individual files before upload
- Show existing images (URL strings) vs new uploads (File objects)
- Follows the project's dark glassmorphism style

### 3. Create Product Page: `client/src/pages/Admin/products/create.jsx`
- Add "Ảnh mô tả sản phẩm" section with MultiFileUpload
- Submit: create product → if success → upload images → navigate back

### 4. Edit Product Page: `client/src/pages/Admin/products/edit.jsx`
- Load existing images on mount via `getByProduct(productId)`
- Show grid with delete buttons
- Allow adding new images
- Submit: update product → update images → navigate back

## Data flow
- **Create**: Product form → POST `/core/product` (with thumbnail) → get product ID → POST `/core/product-image/` (with files + product_id)
- **Edit**: Load product + load images → PUT `/core/product/:id` (product data) → PUT `/core/product-image/:id` (current_image_ids + new files)
