# API Tạo Hóa Đơn Thủ Công Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm endpoint `POST /api/v1/management/invoice/` cho admin tạo hóa đơn thủ công từ một `order_id` có sẵn chưa có hóa đơn.

**Architecture:** `createInvoice` trong `invoice.service.js` nhận `{ order_id, note }`, validate (order tồn tại, không Cancelled, chưa có invoice), tính tiền từ `OrderItems` + `discount_amount` của order, snapshot khách từ `order.Users`, sinh `invoice_number` `HD-YYYY-000001`, tạo bản ghi `invoices`. Thêm validator Joi mới, handler controller, route POST bảo vệ `verifyToken` + `checkPermission("tao-hoa-don")`, và permission slug `tao-hoa-don`.

**Tech Stack:** Express 5, Prisma 5.22 (MySQL), Joi validator, JWT middleware (`verifyToken`, `checkPermission`).

---

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `server/prisma/data/permissions.js` | Thêm `tao-hoa-don` vào `invoicePermissions` |
| `server/src/validators/management/invoice.validator.js` | **Mới** — schema `createInvoice` (Joi) |
| `server/src/services/management/invoice.service.js` | Thêm `createInvoice` |
| `server/src/controllers/management/invoice.controller.js` | Thêm handler `createInvoice` |
| `server/src/routes/management/invoice.route.js` | Thêm `.post("/", ...)` |

Lưu ý: không đổi schema Prisma, không migration.

---

### Task 1: Permission slug `tao-hoa-don`

**Files:**
- Modify: `server/prisma/data/permissions.js`

- [ ] **Step 1: Thêm slug mới**

Trong `server/prisma/data/permissions.js`, sửa khối `invoicePermissions` (đang có duy nhất `xem-hoa-don`) thành:

```js
export const invoicePermissions = [
  { slug: 'xem-hoa-don', name: 'Xem hóa đơn', module: 'invoices', action: 'xem' },
  { slug: 'tao-hoa-don', name: 'Tạo hóa đơn', module: 'invoices', action: 'them' },
];
```

`allPermissions` đã spread `...invoicePermissions` nên không cần sửa thêm.

- [ ] **Step 2: Seed permissions**

Run (từ `D:\Programming\SportNexus\server`):
`node prisma/seed-permissions.js`
Expected: `✅ Đã tạo 58 permissions.`

- [ ] **Step 3: Gán `tao-hoa-don` cho admin user**

Do `verifyToken` chỉ đọc user-level permissions, tạo file tạm `_grant-tao.mjs`:

```js
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const perm = await p.permissions.findUnique({ where: { slug: 'tao-hoa-don' } });
const admin = await p.users.findFirst({ where: { email: 'admin@gmail.com' } });
await p.users.update({
    where: { id: admin.id },
    data: { permissions: { connect: { id: perm.id } } }
});
console.log('granted tao-hoa-don to admin');
await p.$disconnect();
```

Run: `node _grant-tao.mjs`
Expected: `granted tao-hoa-don to admin`
Sau đó xóa file tạm: `Remove-Item _grant-tao.mjs`

---

### Task 2: Validator Joi createInvoice

**Files:**
- Create: `server/src/validators/management/invoice.validator.js`

- [ ] **Step 1: Tạo file**

```js
import Joi from "Joi";

const invoiceSchema = {
    createInvoice: Joi.object({
        order_id: Joi.number().integer().required().messages({
            'number.base': 'ID đơn hàng phải là số',
            'any.required': 'ID đơn hàng là bắt buộc'
        }),
        note: Joi.string().allow('').optional().messages({
            'string.base': 'Ghi chú phải là chuỗi'
        })
    })
}

export default invoiceSchema;
```

Lưu ý: `import Joi from "Joi"` — giữ nguyên chữ hoa `Joi` để khớp pattern hiện có trong `purchaseOrder.validator.js`.

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/validators/management/invoice.validator.js').then(() => console.log('OK'))"`
Expected: `OK`

---

### Task 3: Service createInvoice

**Files:**
- Modify: `server/src/services/management/invoice.service.js`

- [ ] **Step 1: Thêm createInvoice vào service**

Thêm method `createInvoice` vào đầu object `invoiceService` (trước `getAllInvoices`):

```js
    createInvoice: async ({ order_id, note } = {}) => {
        const order = await prisma.orders.findUnique({
            where: { id: Number(order_id) },
            include: {
                OrderItems: {
                    include: {
                        product_variant: { select: { id: true } }
                    }
                },
                Users: { select: { full_name: true, email: true, phone_number: true } }
            }
        });

        if (!order) {
            const err = new Error('Không tìm thấy đơn hàng.');
            err.status = 404;
            throw err;
        }

        if (order.status === 'Cancelled') {
            const err = new Error('Không thể tạo hóa đơn cho đơn đã hủy.');
            err.status = 400;
            throw err;
        }

        const existing = await prisma.invoices.findUnique({ where: { order_id: order.id } });
        if (existing) {
            const err = new Error('Đơn hàng này đã có hóa đơn.');
            err.status = 409;
            throw err;
        }

        const subtotal = order.OrderItems.reduce(
            (sum, item) => sum + Number(item.price_at_purchase) * Number(item.quantity), 0
        );
        const discount = Number(order.discount_amount) || 0;
        const vatRate = 0.08;
        const vatAmount = Math.round((subtotal - discount) * vatRate * 100) / 100;
        const totalAmount = Math.round((subtotal - discount + vatAmount) * 100) / 100;

        const year = new Date().getFullYear();
        const start = new Date(`${year}-01-01T00:00:00Z`);
        const end = new Date(`${year + 1}-01-01T00:00:00Z`);
        const count = await prisma.invoices.count({ where: { issued_at: { gte: start, lt: end } } });
        const invoiceNumber = `HD-${year}-${String(count + 1).padStart(6, '0')}`;

        const invoice = await prisma.invoices.create({
            data: {
                invoice_number: invoiceNumber,
                order_id: order.id,
                customer_name: order.Users?.full_name || order.user_email || 'Khách vãng lai',
                customer_email: order.Users?.email || null,
                customer_phone: order.Users?.phone_number || null,
                shipping_address: order.shipping_address,
                subtotal: Math.round(subtotal * 100) / 100,
                discount_amount: discount,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                note: note || null
            },
            include: {
                order: { select: { id: true, status: true, final_amount: true } }
            }
        });

        return invoice;
    },
```

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/services/management/invoice.service.js').then(() => console.log('OK'))"`
Expected: `OK`

---

### Task 4: Controller handler createInvoice

**Files:**
- Modify: `server/src/controllers/management/invoice.controller.js`

- [ ] **Step 1: Thêm handler**

Thêm method `createInvoice` vào đầu object `invoiceController` (trước `getAllInvoices`):

```js
    createInvoice: async (req, res) => {
        try {
            const invoice = await invoiceService.createInvoice({
                order_id: req.body.order_id,
                note: req.body.note
            });
            return res.status(201).json({
                success: true,
                message: "Hóa đơn đã được tạo",
                data: invoice
            });
        } catch (error) {
            const status = error.status || 500;
            const message = status === 500 ? "Lỗi server nội bộ." : error.message;
            return res.status(status).json({
                success: false,
                message,
                ...(status === 500 ? { error: error.message } : {})
            });
        }
    },
```

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/controllers/management/invoice.controller.js').then(() => console.log('OK'))"`
Expected: `OK`

---

### Task 5: Route POST + verify

**Files:**
- Modify: `server/src/routes/management/invoice.route.js`

- [ ] **Step 1: Thêm POST route**

Sửa `server/src/routes/management/invoice.route.js` thành:

```js
import express from "express";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import invoiceSchema from "../../validators/management/invoice.validator.js";
import invoiceController from "../../controllers/management/invoice.controller.js";

const invoiceRoute = express.Router()

invoiceRoute
    .post("/", verifyToken, checkPermission("tao-hoa-don"), validate(invoiceSchema.createInvoice), invoiceController.createInvoice)
    .get("/:id", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getInvoiceById)
    .get("/", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getAllInvoices)

export default invoiceRoute;
```

Kiểm tra `validate` middleware tồn tại đúng path `../../middlewares/validation.middleware.js` (giống `purchaseOrder.route.js`).

- [ ] **Step 2: Verify cú pháp + khởi động server**

Run: `node -e "import('./src/routes/index.route.js').then(() => console.log('OK'))"`
Expected: `OK`

Khởi động server 6 giây để check không crash:
Run: `$p = Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "D:\Programming\SportNexus\server" -PassThru -NoNewWindow; Start-Sleep 6; if ($p.HasExited) { Write-Output "CRASHED" } else { Write-Output "RUNNING"; Stop-Process -Id $p.Id -Force }`
Expected: `RUNNING`

---

### Task 6: Verify end-to-end

**Files:** (không sửa file)

- [ ] **Step 1: Kiểm tra tạo hóa đơn + các case lỗi**

Tạo file tạm `_e2e-create.mjs` trong `D:\Programming\SportNexus\server`:

```js
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const v = await p.productVariants.findFirst({ where: { stock: { gt: 5 } } });
const svc = (await import('./src/services/customer/order.service.js')).default;
const order = await svc.createOrder({
    total_amount: 100, status: 'Processing', shipping_address: 'E2E create invoice',
    payment_method: 'COD', payment_status: 'Pending', discount_amount: 0,
    final_amount: 100, items: [{ product_variant_id: v.id, quantity: 1, price_at_purchase: 100 }]
});
console.log('ORDER_NO_INV', order.id, 'HAS_INV', !!order.invoice?.id);

const login = await fetch('http://localhost:8081/api/v1/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@gmail.com', password: 'MatKhau@123' })
});
const token = (await login.json())?.data?.accessToken;
const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const created = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ order_id: order.id, note: 'test manual' })
});
const createdBody = await created.json();
console.log('CREATE', created.status, createdBody?.data?.invoice_number, createdBody?.data?.total_amount);

const duplicate = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ order_id: order.id })
});
console.log('DUPLICATE', duplicate.status);

const missing = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ order_id: 999999 })
});
console.log('NOT_FOUND', missing.status);

const noToken = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: order.id })
});
console.log('NO_TOKEN', noToken.status);

const badBody = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ note: 'x' })
});
console.log('BAD_BODY', badBody.status);

const cancelledOrder = await svc.createOrder({
    total_amount: 50, status: 'Processing', shipping_address: 'E2E cancelled',
    payment_method: 'COD', payment_status: 'Pending', discount_amount: 0,
    final_amount: 50, items: [{ product_variant_id: v.id, quantity: 1, price_at_purchase: 50 }]
});
await svc.updateOrder(cancelledOrder.id, {
    total_amount: 50, status: 'Cancelled', final_amount: 50, discount_amount: 0,
    payment_status: 'Pending', payment_method: 'COD', shipping_address: 'E2E cancelled',
    coupon_code: null
}, [{ product_variant_id: v.id, quantity: 1, price_at_purchase: 50 }]);
const cancelled = await fetch('http://localhost:8081/api/v1/management/invoice/', {
    method: 'POST', headers: auth,
    body: JSON.stringify({ order_id: cancelledOrder.id })
});
console.log('CANCELLED_ORDER', cancelled.status);

await p.orders.deleteMany({ where: { shipping_address: { in: ['E2E create invoice', 'E2E cancelled'] } } });
console.log('cleaned');
await p.$disconnect();
```

Run (server phải đang chạy, port 8081):
`node _e2e-create.mjs`
Expected:
- `ORDER_NO_INV <id> HAS_INV false` (order tạo qua createOrder luôn có invoice → lưu ý)
- `CREATE 201 HD-2026-00000X 108`
- `DUPLICATE 409`
- `NOT_FOUND 404`
- `NO_TOKEN 401`
- `BAD_BODY 400`
- `CANCELLED_ORDER 400`
- `cleaned`

LƯU Ý: vì `createOrder` hiện đã tự tạo invoice, `order.id` ở trên SẼ có invoice → `CREATE` sẽ trả 409 thay vì 201. Để test 201, cần một order KHÔNG có invoice. Cách đơn giản: trước khi gọi POST, xóa invoice của order tạo ra:

Thêm ngay sau `ORDER_NO_INV` log, trước fetch CREATE:
```js
await p.invoices.deleteMany({ where: { order_id: order.id } });
console.log('removed auto invoice');
```

Sửa script theo đó rồi chạy; expected `CREATE 201` sau khi xóa invoice tự động.

- [ ] **Step 2: Dọn file tạm**

Run: `Remove-Item "D:\Programming\SportNexus\server\_e2e-create.mjs"`

- [ ] **Step 3: Báo cáo cuối**

Theo AGENTS.md, ghi rõ: không đổi schema (không migration mới); đã thêm permission `tao-hoa-don`; file mới `invoice.validator.js`.

---

## Self-Review Ghi chú

- **Spec coverage:** POST endpoint ✓ (Task 5), tính tiền từ order ✓ (Task 3), snapshot khách ✓ (Task 3), sinh số HD ✓ (Task 3), validate 404/400/409 ✓ (Task 3), permission mới ✓ (Task 1), note ✓ (Task 2+3), verify E2E ✓ (Task 6).
- **Type consistency:** `createInvoice({ order_id, note })` nhận object; controller truyền `req.body.order_id`/`req.body.note`; validator bắt buộc `order_id` int, `note` string optional. Error dùng `err.status` (404/400/409) — controller đọc `error.status` fallback 500.
- **Khớp pattern:** route dùng `validate(...)` từ `../../middlewares/validation.middleware.js`, import `Joi from "Joi"` chữ hoa giống `purchaseOrder` hiện có.
- **Rủi ro test:** `createOrder` tự tạo invoice nên order test đã có invoice → cần xóa invoice tự động trước khi test 201 (đã nêu rõ trong Task 6).
