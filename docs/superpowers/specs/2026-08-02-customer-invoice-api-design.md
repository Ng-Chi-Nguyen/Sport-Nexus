# Design: API customer xem hóa đơn + trang /hoa-don

Ngày: 2026-08-02

## Mục tiêu

Cho người dùng đã đăng nhập xem danh sách và chi tiết hóa đơn của chính mình qua trang `/hoa-don` (hiện đang render `ProfilePlaceholder`). Hóa đơn và đơn hàng là hai thực thể khác nhau nên cần API customer riêng cho invoice, không tái dùng API order.

## Phạm vi

- Backend: API customer `GET /api/v1/customer/invoice` (danh sách) và `GET /api/v1/customer/invoice/:id` (chi tiết), bảo vệ bằng `verifyToken`, dữ liệu lọc theo `req.user.email`.
- Frontend: trang danh sách hóa đơn tại `/hoa-don` và trang chi tiết tại `/hoa-don/:id`, thay thế `ProfilePlaceholder`.

## Quyết định đã chốt

1. Trang hiển thị **tất cả hóa đơn** của user (mọi trạng thái Pending/Completed/Cancelled), không chỉ hóa đơn đã thanh toán.
2. Xác định user bằng **verifyToken + JWT** — email lấy từ `req.user.email` (snapshot `customer_email` trong bảng `invoices`).
3. Có **trang danh sách + trang chi tiết**.
4. Giữ route **`/hoa-don`** (header đã trỏ sẵn), không chuyển vào `/tai-khoan`.
5. Hướng triển khai: **API customer chuyên cho invoice** (service/controller/route riêng), không tái dùng service management.

## Kiến trúc

### Backend

**Service mới** `server/src/services/customer/invoice.service.js`:
- `getMyInvoices({ email, page, status })`:
  - `prisma.invoices.findMany({ where: { customer_email: email, ...(status && { status }) }, include: { order: { select: { id: true, status: true, final_amount: true } } }, orderBy: { issued_at: 'desc' }, take: limit, skip })` với `limit = 10`.
  - `prisma.invoices.count({ where })` song song.
  - Trả `{ invoices, pagination: { totalItems, totalPages, currentPage, itemsPerPage } }`.
- `getMyInvoiceDetail(invoiceId, email)`:
  - `prisma.invoices.findFirst({ where: { id: invoiceId, customer_email: email } })`.
  - include `order` → `OrderItems` → `product_variant` → `product` (tên) + `VariableAttributes` → `attributeKey`, giống `getInvoiceById` của management.
  - Quyền sở hữu được đảm bảo bằng điều kiện `customer_email` trong `where`.

**Controller** `server/src/controllers/customer/invoice.controller.js`:
- `getMyInvoices`: đọc `req.query.page`, `req.query.status`; email từ `req.user.email`; trả 200 `{ success, data: { invoices, pagination } }`.
- `getMyInvoiceDetail`: đọc `req.params.id`; gọi service; nếu không tìm thấy (không thuộc user hoặc không tồn tại) trả 404; thành công trả 200.
- Bắt lỗi dùng `error.status` fallback 500 (pattern hiện tại).

**Route** `server/src/routes/customer/invoice.route.js`:
- `GET /` và `GET /:id`, cả hai bọc `verifyToken`. Không cần `checkPermission` — mọi user đăng nhập xem được hóa đơn của mình.
- Mount trong `server/src/routes/index.route.js` thành tiền tố `customer/invoice/`.

### Frontend

**API client** `client/src/api/customer/invoiceApi.jsx`:
- `getInvoices(query)`: `axiosClient.get('customer/invoice' + (query ? '?' + query : ''))`.
- `getInvoiceDetail(id)`: `axiosClient.get('customer/invoice/' + id)`.

**Loader** `client/src/loaders/customer/invoiceLoader.jsx`:
- `invoicesLoader({ request })`: đọc user từ `localStorage.getItem('user')`; nếu không có → trả `{ invoices: [], pagination: null, user: null }`; đọc `page`, `status` từ URL; gọi API; catch lỗi (kể cả 401) trả danh sách rỗng + `user`.
- `invoiceDetailLoader({ params })`: đọc user; gọi `getInvoiceDetail(params.id)`; trả `{ invoice, user }`.

**Trang danh sách** `client/src/pages/profile/Invoice.jsx` (mô phỏng `Order.jsx`):
- Bảng cột: Mã hóa đơn (`invoice_number`), Ngày phát hành (`formatDate(issued_at)`), Tổng tiền (`formatCurrency(total_amount)`), Trạng thái (`STATUS_INVOICE` badge).
- Click hàng → `navigate('/hoa-don/' + id)`.
- Empty state "Chưa có hóa đơn".
- Phân trang dùng `Pagination` component khi `totalPages > 1`.
- `if (!user) return null`.

**Trang chi tiết** `client/src/pages/profile/InvoiceDetail.jsx` (mô phỏng `OrderDetail.jsx`):
- Số hóa đơn, trạng thái, ngày phát hành; thông tin khách (name/email/phone/địa chỉ); subtotal, discount, VAT (rate + amount), tổng tiền; danh sách sản phẩm từ `order.OrderItems` (tên, biến thể, giá, số lượng, thành tiền); link về `/hoa-don`.

**Route** `client/src/routes/webRoute.jsx`:
- Thay `ProfilePlaceholder` tại `path: 'hoa-don'` bằng `<Invoice />` + `loader: invoicesLoader` (lazy import).
- Thêm route con `hoa-don/:id` → `<InvoiceDetail />` + `loader: invoiceDetailLoader` (lazy import).
- Cần đảm bảo `Suspense` boundary bao quanh (pattern lazy hiện có).

## Xử lý lỗi & biên

- Chưa đăng nhập: `verifyToken` trả 401 → frontend loader bắt lỗi, render null (giống `Order.jsx`).
- Hóa đơn không thuộc user / không tồn tại: `findFirst` không khớp → 404, không lộ dữ liệu.
- Danh sách rỗng / filter không khớp: trả `{ invoices: [], pagination }`, không phải 404; frontend hiện empty state.
- Không thêm dropdown lọc status ở phiên bản đầu (YAGNI); chỉ phân trang. Nếu cần thêm sau thì dễ mở rộng.

## Verification

- Backend (chưa có test suite): startup check + gọi tay bằng script/curl:
  - Login admin → `GET /api/v1/customer/invoice` với token → 200, danh sách chỉ gồm hóa đơn có `customer_email` của email đăng nhập.
  - `GET /api/v1/customer/invoice/:id` với hóa đơn của user khác → 404.
  - Không có token → 401.
- Frontend: `npm run build --prefix client` và `npm run lint --prefix client`.

## Files thay đổi

Backend (mới):
- `server/src/services/customer/invoice.service.js`
- `server/src/controllers/customer/invoice.controller.js`
- `server/src/routes/customer/invoice.route.js`

Backend (sửa):
- `server/src/routes/index.route.js` (mount route)

Frontend (mới):
- `client/src/api/customer/invoiceApi.jsx`
- `client/src/loaders/customer/invoiceLoader.jsx`
- `client/src/pages/profile/Invoice.jsx`
- `client/src/pages/profile/InvoiceDetail.jsx`

Frontend (sửa):
- `client/src/routes/webRoute.jsx` (route `/hoa-don` + `/hoa-don/:id`)

Không thay đổi schema Prisma — đã có bảng `invoices` (migration `20260802061731_add_invoices`).
