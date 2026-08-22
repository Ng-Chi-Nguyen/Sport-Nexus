# Design: Trả lời đánh giá (Review Reply) cho Admin

- Ngày: 2026-08-22
- Phạm vi: Backend API quản lý review cho admin (trả lời / sửa / xóa trả lời, ẩn-hiện) + sửa API public hiển thị đúng dữ liệu. Frontend admin làm ở phase sau khi user test xong API.

## 1. Bối cảnh

- Model `Reviews` đã có cột `reply_comment String? @db.Text` nhưng không có API nào ghi/đọc nó.
- Không tồn tại module quản lý review cho admin (`/management/...`). Trang `client/src/pages/Admin/reviews/index.jsx` là placeholder.
- Public lấy review chi tiết sản phẩm từ `core/product.service.js → getProductBySlug`: hiện **không lọc `is_hidden`** và **không trả `reply_comment`**.
- `customer/review.service.js → getReviewByProductId` cũng không lọc `is_hidden` và không include `user` (ReviewList.jsx đang đọc `review.user?.full_name`).
- Permissions đã seed sẵn: `xem-danh-gia`, `sua-danh-gia`, `them-danh-gia`, `xoa-danh-gia` (module `reviews`). Không cần thêm permission mới.

## 2. Quyết định thiết kế (đã xác nhận với user)

| Quyết định | Chọn | Lý do |
|---|---|---|
| Phạm vi | Đầy đủ: list + reply + ẩn/hiện + public hiển thị reply + public lọc review ẩn | Theo yêu cầu |
| Model trả lời | Dùng lại cột `reply_comment`, không thêm cột mới | Không đổi schema; hiển thị tên cửa hàng cố định ở public |
| Cờ `is_hidden` | Public chỉ hiện `is_hidden = false`; admin thấy tất cả + badge + toggle | "Filter đúng nghĩa" |
| Kiến trúc | Module management riêng (Cách A) | Đúng AGENTS.md layering: routes → controllers → services → validators |
| Testing | Không setup test suite; cung cấp JSON mẫu để test Postman | Server chưa có test infra |

## 3. Backend — Module management review

### 3.1. Files mới

- `server/src/services/management/review.service.js`
- `server/src/controllers/management/review.controller.js`
- `server/src/routes/management/review.route.js`
- `server/src/validators/management/review.validator.js`

Mount trong `server/src/index.js`: `app.use(`${api_prefix_v1}management/review/`, reviewRoute)` (theo pattern các route management khác).

### 3.2. Endpoints

Base: `/api/v1/management/review`

#### GET `/` — Danh sách review
- Middlewares: `verifyToken`, `checkPermission("xem-danh-gia")`
- Query params:
  - `page` (default 1), limit cố định 10
  - `search` — contains trong `comment`
  - `product_id` — number
  - `rating` — 1..5
  - `status` — `hidden` | `visible` (map `is_hidden`)
  - `reply` — `replied` | `unreplied` (`reply_comment: { not: null }` / `null`)
- Include: `user { id, full_name, avatar }`, `product { id, name, slug }`
- Order: `created_at desc`
- Response 200:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1, "rating": 5, "comment": "Sản phẩm tốt",
        "media_urls": "[\"https://...\"]", "reply_comment": null,
        "is_hidden": false, "created_at": "...",
        "user": { "id": 2, "full_name": "Nguyễn Văn A", "avatar": null },
        "product": { "id": 10, "name": "Giá đòn bẩy", "slug": "gia-don-bay" }
      }
    ],
    "pagination": { "totalItems": 120, "totalPages": 12, "currentPage": 1, "itemsPerPage": 10 }
  }
}
```
- Lưu ý: `media_urls` là JSON string (giữ nguyên convention hiện tại của DB).

#### PUT `/:id/reply` — Tạo / cập nhật trả lời
- Middlewares: `verifyToken`, `checkPermission("sua-danh-gia")`, `validate(reviewSchema.replyReview)`, `logAction(UPDATE, "Reviews")`
- Body:
```json
{ "reply_comment": "Cảm ơn anh đã tin tưởng cửa hàng!" }
```
- Validation Joi: `reply_comment` string required, trim, min 1 max 1000.
- Service: update `reply_comment`; không tìm thấy → lỗi `REVIEW_NOT_FOUND` (404).
- Response 200: `{ success: true, message: "...", data: <review sau cập nhật> }`

#### DELETE `/:id/reply` — Xóa trả lời
- Middlewares: `verifyToken`, `checkPermission("sua-danh-gia")`, `logAction(UPDATE, "Reviews")`
- Service: set `reply_comment = null`; không tìm thấy → 404.
- Response 200: `{ success: true, message: "..." }`

#### PUT `/:id/visibility` — Ẩn / hiện review
- Middlewares: `verifyToken`, `checkPermission("sua-danh-gia")`, `validate(reviewSchema.visibilityReview)`
- Body:
```json
{ "is_hidden": true }
```
- Validation Joi: boolean required.
- Service: update `is_hidden`; không tìm thấy → 404.
- Response 200: `{ success: true, message: "...", data: <review> }`

### 3.3. Error mapping (controller)

`REVIEW_NOT_FOUND: 404`, còn lại 500. Response shape `{ success, message }` dùng `t(req, ...)` như controller customer.

## 4. Sửa API public

### 4.1. `server/src/services/core/product.service.js → getProductBySlug`
Trong include `Reviews`:
- Thêm `where: { is_hidden: false }`
- Thêm `reply_comment: true` vào select

### 4.2. `server/src/services/customer/review.service.js → getReviewByProductId`
- `where: { product_id, is_hidden: false }`
- Include `user: { select: { id, full_name, avatar } }`

## 5. Frontend — Phase sau khi API được duyệt (tóm tắt đã thống nhất)

- `api/management/reviewApi.js`, `loaders/management/reviewLoader.js` (+ đăng ký `adminLoader.jsx`, gắn loader vào route `reviews` trong `adminRoutes.jsx`).
- Viết lại `pages/Admin/reviews/index.jsx` theo pattern `brands/index.jsx` (Breadcrumbs, FilterPanel search + dropdown rating/status/reply, Badge, Pagination).
- Components con: `ReviewCard`, `ReplyModal` (textarea 1–1000 ký tự, nút Cập nhật + Xóa trả lời khi đã có reply). Card ẩn mờ + badge "Đang ẩn".
- i18n: thêm `locales/vi|en/review_admin.json`, đăng ký nhánh `review_admin` trong `lib/i18n.js`.
- Public `ReviewList.jsx` hiển thị block trả lời của cửa hàng (label "Phản hồi từ cửa hàng").

## 6. Hướng dẫn test Postman

1. POST `/api/v1/auth/login` với tài khoản admin có quyền reviews → lấy token.
2. GET `/api/v1/management/review?page=1&rating=5&status=visible&reply=unreplied` header `Authorization: Bearer <token>` → kiểm tra pagination/filter.
3. PUT `/api/v1/management/review/<id>/reply` body `{"reply_comment":"..."}` → kiểm tra data.reply_comment.
4. PUT lại chính endpoint trên để cập nhật nội dung khác.
5. DELETE `/api/v1/management/review/<id>/reply` → reply_comment về null.
6. PUT `/api/v1/management/review/<id>/visibility` body `{"is_hidden":true}`.
7. GET `/api/v1/home/product/slug/<slug>` (route public sản phẩm, mount `home/product`) → xác nhận review bị ẩn biến mất, review còn lại có `reply_comment`.
8. Negative: gọi bằng token user thường → 403; id không tồn tại → 404.

File JSON mẫu đầy đủ sẽ kèm trong báo cáo triển khai phase backend.

## 7. Rủi ro / lưu ý

- **Không đổi schema** — không sinh migration.
- Seed tạo ~10% review `is_hidden=true`; sau khi lọc public, các review này biến mất khỏi trang sản phẩm (đã chấp thuận).
- `avg_rating`/`total_reviews` ở trang danh sách sản phẩm (web product/collection/home services) vẫn tính trên toàn bộ review kể cả review ẩn — ngoài phạm vi lần này, có thể xử lý riêng nếu cần.
- Route mutation có `logAction` theo pattern route customer review.
