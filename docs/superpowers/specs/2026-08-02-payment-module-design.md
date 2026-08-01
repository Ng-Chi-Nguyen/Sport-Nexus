# Payment Module — Design Spec

Ngày: 2026-08-02
Dự án: SportNexus
Trạng thái: Approved

## 1. Bối cảnh & mục tiêu

SportNexus là sàn TMĐT thể thao. Module thanh toán hiện chỉ là scaffold trống (`server/src/controllers/customer/payment.controller.js`, `server/src/routes/customer/payment.route.js`, `server/src/services/customer/payment.service.js`). Luồng tạo đơn (`Orders`) đã hoạt động qua `orderService.createOrder`, có sẵn `payment_method`/`payment_status` trên `Orders`.

Mục tiêu:
- Triển khai thanh toán cho khách: COD và thanh toán qua cổng **PayOS** (QR ngân hàng, chuyển khoản, MoMo, thẻ).
- Xác nhận thanh toán **tự động** qua webhook PayOS (không phụ thuộc thao tác thủ công của admin).
- Kiến trúc **provider pattern** để sau này thêm cổng khác (VNPay, Stripe...) không đổi controller/service.
- Thị trường: Việt Nam trước, mở rộng quốc tế sau.

## 2. Thay đổi schema (cần migration mới)

Thêm model `PaymentTransactions` vào `server/prisma/schema.prisma`:

```prisma
model PaymentTransactions {
    id                Int             @id @default(autoincrement())
    order_id          Int
    Orders            Orders          @relation(fields: [order_id], references: [id], onDelete: Cascade)
    method            PaymentMethod
    amount            Decimal         @db.Decimal(10, 2)
    status            PaymentStatus   @default(Pending)
    provider_ref      String?         // paymentLinkId PayOS (hoặc mã giao dịch cổng khác)
    transaction_code  String?         // mã giao dịch khách điền (fallback thủ công)
    receipt_image_url String?         // ảnh biên lai (fallback thủ công, Supabase)
    note              String?
    paid_at           DateTime?
    created_at        DateTime        @default(now())
    updated_at        DateTime        @updatedAt

    @@index([order_id])
    @@map("payment_transactions")
}
```

- Không đổi enum `PaymentMethod`/`PaymentStatus`, không sửa model `Orders`.
- `transaction_code`, `receipt_image_url` chỉ dùng trong fallback thủ công (khi chưa có credential PayOS) — không bắt buộc.
- `Orders` cần thêm relation field (để Prisma generate): `PaymentTransactions PaymentTransactions[]`.

Lưu ý: đây là thay đổi schema — sẽ nêu rõ trong báo cáo cuối theo quy tắc dự án (migration chưa versioned).

## 3. Kiến trúc provider

Thư mục mới: `server/src/services/customer/payment/providers/`

```
providers/
  index.js            // registry: { cod, payos }
  cod.provider.js
  payos.provider.js
```

Mỗi provider implement:

- `createPayment({ order, channel })` → tạo transaction + trả payload cần thiết
  - `CODProvider`: trả `{ status: 'Pending', instructions: 'Thanh toán khi nhận hàng' }`
  - `PayOSProvider`: gọi PayOS API tạo payment link → trả `{ checkoutUrl, paymentLinkId }`, transaction ở `Pending`
- `confirm({ transaction, paymentData })` → chuyển `Pending → Paid`, set `paid_at`, đồng bộ lên `Orders.payment_status`
- (tùy chọn) `refund({ transaction, reason })` → gọi API hoàn tiền PayOS, chuyển `Paid → Refunded`

### Channel PayOS (map từ enum hiện có)

| `PaymentMethod` | Channel PayOS |
|-----------------|---------------|
| `BANK_TRANSFER` | QR ngân hàng / chuyển khoản |
| `MOMO`          | Ví MoMo |
| `CREDIT_CARD`   | Thẻ ATM / tín dụng |
| `VNPAY`         | VNPay |

Khách chọn channel nào → tạo payment link tương ứng.

### Fallback

Nếu thiếu credential PayOS trong env → phương thức `PAYOS` không hiển thị; chỉ còn `COD` + `BANK_TRANSFER` thủ công (hiển thị thông tin TK + mã QR VietQR để khách quét, khách điền mã giao dịch, admin xác nhận qua management endpoint).

## 4. API endpoints

### Customer routes (`server/src/routes/customer/payment.route.js`) — dùng `verifyToken`

- `GET /api/v1/customer/payment/methods` — danh sách phương thức khả dụng + mô tả
- `POST /api/v1/customer/payment/orders/:orderId` — body `{ method, channel }`, tạo transaction; trả `checkoutUrl` (PayOS) hoặc hướng dẫn (COD/BANK_TRANSFER)
- `GET /api/v1/customer/payment/transactions/:transactionId` — chi tiết transaction + thông tin TK/QR nếu là BANK_TRANSFER
- `POST /api/v1/customer/payment/transactions/:transactionId/receipt` — upload ảnh biên lai + mã giao dịch (fallback thủ công, multipart, Supabase bucket `payment_receipts`)
- `GET /api/v1/customer/payment/orders/:orderId/transactions` — lịch sử thanh toán của 1 order
- `GET /api/v1/customer/payment/orders/:orderId/status` — poll trạng thái sau khi khách về `successUrl`/`cancelUrl`
- `POST /api/v1/customer/payment/webhook/payos` — **endpoint public**, nhận webhook PayOS

### Management routes (`server/src/routes/management/payment.route.js`) — `verifyToken` + `checkPermission`

- `GET /api/v1/management/payment/transactions` — danh sách, filter (status/method/order_id), phân trang
- `POST /api/v1/management/payment/transactions/:id/confirm` — xác nhận đã nhận tiền (chỉ dùng cho fallback thủ công) → `Paid`
- `POST /api/v1/management/payment/transactions/:id/refund` — hoàn tiền (gọi PayOS refund nếu có) → `Refunded`
- `POST /api/v1/management/payment/transactions/:id/cancel` — hủy transaction → `Failed`

Khi transaction chuyển `Paid`, service tự đồng bộ `Orders.payment_status`.

## 5. Luồng nghiệp vụ

### COD
1. Tạo order với `payment_method = COD`, `payment_status = Pending`
2. Tạo transaction COD (`Pending`)
3. Khi order chuyển `Delivered` → transaction + order tự `Paid`
   - Điểm nối: trong `orderService.updateOrder`, sau khi status đổi sang `Delivered`, gọi `paymentService.markCodPaid(orderId)` để cập nhật transaction COD đang `Pending` thành `Paid` (đồng bộ `Orders.payment_status`).

### PayOS
1. Tạo order với `payment_method` theo channel khách chọn → `Pending`
2. Tạo payment link PayOS → redirect khách đến `checkoutUrl`
3. Khách thanh toán trên trang PayOS
4. PayOS gọi webhook → **verify chữ ký HMAC SHA256 bằng `PAYOS_CHECKSUM_KEY`** → transaction + order `Paid` → gửi email xác nhận
5. Khách về `successUrl`, frontend poll status → hiển thị kết quả

### Chuyển khoản thủ công (fallback)
1. Tạo order `payment_method = BANK_TRANSFER`, `payment_status = Pending`
2. Hiển thị thông tin TK + mã QR VietQR (số tiền + nội dung = mã đơn hàng điền sẵn)
3. Khách chuyển khoản, điền mã giao dịch / upload ảnh
4. Admin xác nhận → `Paid`; hủy → `Failed`

## 6. State machine

`Pending → Paid` / `Pending → Failed` / `Paid → Refunded`

- Không cho `Failed → Paid`
- Không cho chuyển ngược
- Transition không hợp lệ → 409

## 7. Cấu hình env mới (`server/.env.example`)

```
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_ENV=dev
PAYOS_RETURN_URL=
```

- Thiếu credential → tự fallback về COD + chuyển khoản thủ công (không crash).
- Không log secret/token.

## 8. Bảo mật

- Webhook xác minh chữ ký bắt buộc (chống giả mạo webhook).
- Customer routes yêu cầu `verifyToken`; management routes yêu cầu `verifyToken` + `checkPermission`.
- Refund chỉ từ admin có permission.
- Không log `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, credential mail/auth/storage.

## 9. Xử lý lỗi

- Order không tồn tại → 404
- Method/channel không hợp lệ → 400
- Transaction đã `Paid`/`Failed` mà confirm/refund/cancel → 409
- Tạo payment link PayOS thất bại → 502/500, không lưu transaction state sai
- Upload ảnh thất bại → rollback, trả 500
- Mọi transition ghi `SystemLogs` theo pattern `logAction` sẵn có

## 10. Thay đổi file dự kiến

| File | Thay đổi |
|------|----------|
| `server/prisma/schema.prisma` | Thêm model `PaymentTransactions` + relation field trên `Orders` |
| `server/src/services/customer/payment/providers/index.js` | Mới — registry |
| `server/src/services/customer/payment/providers/cod.provider.js` | Mới |
| `server/src/services/customer/payment/providers/payos.provider.js` | Mới |
| `server/src/services/customer/payment.service.js` | Implement logic transaction + đối chiếu |
| `server/src/services/customer/payment/qr.service.js` | Mới — tạo QR VietQR (fallback) |
| `server/src/controllers/customer/payment.controller.js` | Implement handlers |
| `server/src/routes/customer/payment.route.js` | Thêm routes |
| `server/src/routes/management/payment.route.js` | Mới — routes admin |
| `server/src/routes/index.route.js` | Mount management payment |
| `server/src/validators/customer/payment.validator.js` | Mới |
| `server/src/configs/payos.config.js` | Mới — khởi tạo PayOS client |
| `server/.env.example` | Thêm biến PayOS |
| `client/` | UI checkout: chọn phương thức + trả về `successUrl`/`cancelUrl` |

## 11. Quyết định UI (đã chốt)

**Tách lựa chọn trên UI, gộp PayOS ở backend:**
- UI checkout hiển thị **từng phương thức riêng biệt** cho khách: "Chuyển khoản (PayOS)", "Ví MoMo", "Thẻ quốc tế / ATM", "VNPay", "COD".
- Tăng tỷ lệ chuyển đổi (CR) vì khách nhìn thấy phương thức quen thuộc.
- Backend chỉ có 1 cổng PayOS; khách chọn channel nào thì gọi PayOS API với `channel` tương ứng (`BANK_TRANSFER`/`MOMO`/`CREDIT_CARD`/`VNPAY`).

**Flow nối UI với backend:**
1. Frontend gọi `orderService.createOrder` (qua `POST /order`) tạo đơn ở trạng thái `Pending` trước.
2. Chuyển tiếp ngay sang `POST /api/v1/customer/payment/orders/:orderId` với body `{ method, channel }` để lấy `checkoutUrl`.
3. Redirect khách đến `checkoutUrl` (PayOS) hoặc hiển thị hướng dẫn (COD / chuyển khoản thủ công).
