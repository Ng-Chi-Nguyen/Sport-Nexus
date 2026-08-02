# Invoice Table (Hóa đơn bán hàng) — Design Spec

Ngày: 2026-08-02
Dự án: SportNexus
Trạng thái: Approved

## 1. Bối cảnh & mục tiêu

Hệ thống đã có `Orders` (đơn hàng) và `PaymentTransactions` (lịch sử thanh toán) nhưng chưa có bảng hóa đơn bán hàng riêng. Mục tiêu: thêm bảng `Invoices` để phát hành hóa đơn xuất cho khách, phục vụ in/xuất PDF và đối soát kế toán.

Quyết định đã chốt với người dùng:
- **Hóa đơn bán hàng riêng** (không phải thêm cột vào `Orders`, không phải hóa đơn nhập hàng).
- **1 đơn = 1 hóa đơn (1:1)** — `Orders.invoice Invoices?` quan hệ một-một.
- **Phát hành tự động khi tạo đơn** (`orderService.createOrder`) — không có API xuất thủ công.
- **Lưu snapshot khách hàng** (tên/email/sđt/địa chỉ) để hóa đơn không đổi khi khách sửa hồ sơ.
- **Kèm VAT 8%**, tổng tiền, chiết khấu, trạng thái.
- **Khi đơn bị hủy → hóa đơn chuyển `Cancelled`** (giữ lại, không xóa).

## 2. Thay đổi schema (`server/prisma/schema.prisma`)

```prisma
enum InvoiceStatus {
  Pending     // đã phát hành, đơn chưa hoàn tất
  Completed   // đơn đã Delivered/Paid
  Cancelled   // đơn bị hủy
}

model Invoices {
  id               Int           @id @default(autoincrement())
  invoice_number   String        @unique   // ví dụ HD-2026-000123
  order_id         Int           @unique   // 1:1 với Orders
  order            Orders        @relation(fields: [order_id], references: [id], onDelete: Cascade)

  customer_name    String
  customer_email   String?
  customer_phone   String?
  shipping_address String

  subtotal         Decimal       @db.Decimal(10, 2)   // trước chiết khấu
  discount_amount  Decimal       @db.Decimal(10, 2)
  vat_rate         Decimal       @default(0.08) @db.Decimal(5, 2)  // VAT 8%
  vat_amount       Decimal       @db.Decimal(10, 2)
  total_amount     Decimal       @db.Decimal(10, 2)   // subtotal - discount + vat

  status           InvoiceStatus @default(Pending)
  issued_at        DateTime      @default(now())
  note             String?       @db.Text
  created_at       DateTime      @default(now())
  updated_at       DateTime      @updatedAt

  @@map("invoices")
}
```

`Orders` thêm relation field:
```prisma
invoice Invoices?
```

Công thức:
- `subtotal = total_amount + discount_amount` (giá trị hàng trước chiết khấu)
- `vat_amount = round((subtotal - discount_amount) * vat_rate, 2)`
- `total_amount = subtotal - discount_amount + vat_amount`

**Lưu ý thay đổi schema:** migration chưa versioned — chạy `prisma migrate dev --name add_invoices` và nêu rõ trong báo cáo cuối.

## 3. Logic tạo hóa đơn (`server/src/services/customer/order.service.js`)

- Bọc `createOrder` hiện tại trong `prisma.$transaction` và tạo `Invoices` cùng lúc với `Orders` + `OrderItems`.
- Số hóa đơn tự sinh: `HD-<YYYY>-<6 chữ số tăng dần>` dựa trên số lượng invoice trong năm (query `count` where `issued_at` thuộc năm hiện tại, `+1`, padStart 6).
- Snapshot khách: tìm user theo `user_email` (nếu có) lấy `full_name`, `phone_number`, `email`; `shipping_address` lấy từ order.
- `note`: ghi phương thức thanh toán / mã giảm giá (tùy chọn, dễ đối soát).

## 4. Xử lý hủy đơn

Trong `orderService.updateOrder`: nếu `dataUpdate.status === 'Cancelled'`, cập nhật invoice liên quan (nếu đang `Pending`/`Completed`) sang `Cancelled`.

## 5. API admin (chỉ đọc)

Mount tại `management/invoice`, dùng `verifyToken` + `checkPermission`.

- `GET /api/v1/management/invoice/` — danh sách, phân trang (page, itemsPerPage), filter: `status`, `search` (invoice_number / order_id / customer_name), `date_from`, `date_to`.
- `GET /api/v1/management/invoice/:id` — chi tiết kèm `OrderItems` (snapshot sản phẩm).

Permission slug: dùng `xem-hoa-don` (thêm vào seed permissions nếu cần). Trước mắt dùng `checkPermission("xem-hoa-don")`.

## 6. Thay đổi file dự kiến

| File | Thay đổi |
|------|----------|
| `server/prisma/schema.prisma` | Thêm enum `InvoiceStatus`, model `Invoices`, relation field trên `Orders` |
| `server/prisma/data/permissions.js` | Thêm permission `xem-hoa-don` (module `invoice`) |
| `server/src/services/customer/order.service.js` | Tạo invoice trong transaction; hủy đơn → invoice `Cancelled` |
| `server/src/services/management/invoice.service.js` | Mới — list + detail |
| `server/src/controllers/management/invoice.controller.js` | Mới |
| `server/src/routes/management/invoice.route.js` | Mới — GET chỉ đọc |
| `server/src/routes/index.route.js` | Mount management invoice |

## 7. Xử lý lỗi

- Invoice không tồn tại → 404.
- Tạo invoice thất bại → rollback toàn bộ transaction (không tạo đơn rỗng).
- Số hóa đơn trùng (race hiếm) → retry 1 lần với số tiếp theo.

## 8. Xác minh

- `npx prisma migrate dev --name add_invoices` + `prisma generate`.
- Chạy lại seed đơn giản (tạo 1 order) để kiểm tra invoice được tạo kèm.
- Khởi động server, gọi `GET /management/invoice/` với token admin.
