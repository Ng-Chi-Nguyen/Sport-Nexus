# API Tạo Hóa Đơn Thủ Công — Design Spec

**Ngày:** 2026-08-02
**Trạng thái:** Đã duyệt

## Mục tiêu

Thêm endpoint `POST /api/v1/management/invoice/` cho phép admin tạo hóa đơn thủ công từ một `order_id` có sẵn chưa có hóa đơn. Hóa đơn vẫn 1:1 với `Orders` (`order_id` unique) — không đổi schema.

## Yêu cầu chức năng

- Tạo hóa đơn từ `order_id` có sẵn.
- Tính tiền tự động từ order (không nhập tay):
  - `subtotal = Σ(price_at_purchase × quantity)` từ `OrderItems`.
  - `discount_amount = order.discount_amount`.
  - `vat_rate = 0.08`, `vat_amount = round((subtotal − discount) × 0.08, 2)`.
  - `total_amount = round(subtotal − discount + vat, 2)`.
- Snapshot khách từ `order.Users` (`full_name`, `email`, `phone_number`); fallback `user_email` hoặc `'Khách vãng lai'`. `shipping_address` lấy từ order.
- Sinh `invoice_number` format `HD-YYYY-000001` (cùng logic `generateInvoiceNumber` trong `orderService.createOrder`).
- Hỗ trợ `note` tùy chọn trong body.

## Validate

1. Order không tồn tại → `404` "Không tìm thấy đơn hàng".
2. Order đã `Cancelled` → `400` "Không thể tạo hóa đơn cho đơn đã hủy".
3. Order đã có hóa đơn → `409` "Đơn hàng này đã có hóa đơn".

## Endpoint

`POST /api/v1/management/invoice/`

Headers: `Authorization: Bearer <token>`

Body:
```json
{ "order_id": 123, "note": "Hóa đơn tạo thủ công" }
```

Response thành công — `201`:
```json
{
  "success": true,
  "message": "Hóa đơn đã được tạo",
  "data": {
    "id": 5,
    "invoice_number": "HD-2026-000002",
    "order_id": 123,
    "customer_name": "Nguyễn Văn A",
    "subtotal": "500000.00",
    "discount_amount": "0.00",
    "vat_amount": "40000.00",
    "total_amount": "540000.00",
    "status": "Pending",
    "order": { "id": 123, "status": "Processing", "final_amount": "500000.00" }
  }
}
```

Lỗi:
- `400` trùng ý nghĩa validate (thiếu `order_id`, order hủy)
- `401` chưa đăng nhập
- `403` thiếu quyền `tao-hoa-don`
- `404` không tìm thấy order
- `409` đã có hóa đơn
- `500` lỗi server

## Quyền

- Thêm slug `tao-hoa-don` (`{ slug: 'tao-hoa-don', name: 'Tạo hóa đơn', module: 'invoices', action: 'them' }`) vào `invoicePermissions` trong `server/prisma/data/permissions.js`.
- Endpoint dùng `verifyToken` + `checkPermission("tao-hoa-don")`.
- Do `verifyToken` chỉ đọc user-level permissions (`_PermissionsToUsers`), cần gán `tao-hoa-don` trực tiếp cho user admin sau khi seed (pattern đã dùng cho `xem-hoa-don`).

## Files thay đổi

| File | Thay đổi |
|------|----------|
| `server/prisma/data/permissions.js` | Thêm `tao-hoa-don` vào `invoicePermissions` |
| `server/src/services/management/invoice.service.js` | Thêm `createInvoice` |
| `server/src/controllers/management/invoice.controller.js` | Thêm handler `createInvoice` |
| `server/src/routes/management/invoice.route.js` | Thêm `.post("/", verifyToken, checkPermission("tao-hoa-don"), ...)` |
| `server/src/validators/management/invoice.validator.js` | **Mới** — schema `createInvoice` (bắt buộc `order_id` int, tùy chọn `note` string) |

Pattern tham chiếu: `purchaseOrder` (service/controller/route/validator hiện có).

## Không nằm trong scope

- Không đổi schema Prisma (không migration).
- Không hỗ trợ nhập tay số tiền.
- Không tạo order kèm hóa đơn (POS).
- Không hủy/chỉnh hóa đơn.

## Verify

- Chạy seed permissions (58), gán `tao-hoa-don` cho admin user.
- Tạo hóa đơn cho order chưa có → 201.
- Tạo lại cùng order → 409.
- Order không tồn tại → 404.
- Order Cancelled → 400.
- Không token → 401.
- Server khởi động không crash.
