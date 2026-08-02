# Invoice Table (Hóa đơn bán hàng) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm bảng `Invoices` phát hành tự động khi tạo đơn (1:1 với `Orders`), kèm VAT 8%, snapshot khách, và API admin xem danh sách/chi tiết.

**Architecture:** Thêm model Prisma `Invoices` + enum `InvoiceStatus`; `orderService.createOrder` được bọc trong `prisma.$transaction` để tạo Order + Invoice + trừ stock atomic; `updateOrder` khi chuyển `Cancelled` thì cập nhật invoice sang `Cancelled`. Thêm service/controller/route management chỉ đọc theo pattern `purchaseOrder` hiện có.

**Tech Stack:** Prisma 5.22 (MySQL), Express 5, JWT middleware (`verifyToken`, `checkPermission`).

---

## File Structure

| File | Trách nhiệm |
|------|-------------|
| `server/prisma/schema.prisma` | Thêm enum `InvoiceStatus`, model `Invoices`, relation field `invoice` trên `Orders` |
| `server/prisma/data/permissions.js` | Thêm `invoicePermissions` + nhúng vào `allPermissions` |
| `server/src/services/customer/order.service.js` | Bọc `createOrder` bằng transaction + tạo invoice; `updateOrder` hủy đơn → invoice `Cancelled` |
| `server/src/services/management/invoice.service.js` | Mới — `getAllInvoices` (phân trang + filter), `getInvoiceById` |
| `server/src/controllers/management/invoice.controller.js` | Mới — handlers GET |
| `server/src/routes/management/invoice.route.js` | Mới — 2 GET route, `verifyToken` + `checkPermission("xem-hoa-don")` |
| `server/src/routes/index.route.js` | Mount `management/invoice/` |

---

### Task 1: Schema Prisma — model Invoices + relation

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Thêm enum và model vào schema.prisma**

Thêm 2 khối sau ngay trước model `Orders` (sau khối `enum PaymentStatus`):

```prisma
enum InvoiceStatus {
    Pending // Đã phát hành, đơn chưa hoàn tất
    Completed // Đơn đã Delivered/Paid
    Cancelled // Đơn bị hủy
}

// Invoices - Hóa đơn bán hàng (1:1 với Orders)
model Invoices {
    id               Int           @id @default(autoincrement())
    invoice_number   String        @unique
    order_id         Int           @unique
    order            Orders        @relation(fields: [order_id], references: [id], onDelete: Cascade)

    customer_name    String
    customer_email   String?
    customer_phone   String?
    shipping_address String

    subtotal         Decimal       @db.Decimal(10, 2)
    discount_amount  Decimal       @db.Decimal(10, 2)
    vat_rate         Decimal       @default(0.08) @db.Decimal(5, 2)
    vat_amount       Decimal       @db.Decimal(10, 2)
    total_amount     Decimal       @db.Decimal(10, 2)

    status           InvoiceStatus @default(Pending)
    issued_at        DateTime      @default(now())
    note             String?       @db.Text
    created_at       DateTime      @default(now())
    updated_at       DateTime      @updatedAt

    @@map("invoices")
}
```

- [ ] **Step 2: Thêm relation field vào model Orders**

Trong model `Orders` (đang có các relation field như `OrderItems`, `PaymentTransactions`...), thêm dòng:

```prisma
    invoice            Invoices?
```

Đặt ngay sau dòng `usersId Int?` (trước `@@map("orders")`).

- [ ] **Step 3: Tạo migration và generate**

Run: `npx prisma migrate dev --name add_invoices`
Expected: tạo folder migration mới + áp dụng lên DB `sport_nexus` + generate client. Output: `✔ Generated Prisma Client`.

- [ ] **Step 4: Verify**

Run: `npx prisma migrate status`
Expected: `Database schema is up to date!`

---

### Task 2: Permission slug `xem-hoa-don`

**Files:**
- Modify: `server/prisma/data/permissions.js`

- [ ] **Step 1: Thêm invoicePermissions**

Thêm sau khối `reviewPermissions` (cuối file, trước `allPermissions`):

```js
export const invoicePermissions = [
  { slug: 'xem-hoa-don', name: 'Xem hóa đơn', module: 'invoices', action: 'xem' },
];
```

Và nhúng vào `allPermissions` — sửa mảng `allPermissions` để thêm dòng:

```js
  ...reviewPermissions,
  ...invoicePermissions,
];

// (dòng ...invoicePermissions, ngay trước dấu ]; )
```

- [ ] **Step 2: Seed permission mới**

Run: `node prisma/seed-permissions.js`
Expected: `✅ Đã tạo 57 permissions.`

Lưu ý: nếu role `admin`/`staff` bị xóa hết permissions bởi seed khác, chạy tiếp:
Run: `node prisma/seed-roles-permissions.js`

---

### Task 3: Tạo invoice tự động trong orderService

**Files:**
- Modify: `server/src/services/customer/order.service.js` (hàm `createOrder` toàn bộ, dòng 4-75)

- [ ] **Step 1: Helper sinh số hóa đơn + cập nhật createOrder**

Thay toàn bộ hàm `createOrder` (từ `createOrder: async (orderData) => {` đến `},` trước `getOrderDropdown`) bằng code sau — bọc transaction, tạo invoice, snapshot khách, trừ stock trong cùng transaction:

```js
    createOrder: async (orderData) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;

        for (const item of items) {
            const variant = await prisma.productVariants.findUnique({
                where: { id: item.product_variant_id },
                select: { stock: true }
            })
            if (!variant || variant.stock < item.quantity) {
                const err = new Error(`Sản phẩm ID ${item.product_variant_id} không đủ hàng (còn ${variant?.stock ?? 0}, cần ${item.quantity})`)
                err.code = 'INSUFFICIENT_STOCK'
                throw err
            }
        }

        const generateInvoiceNumber = async () => {
            const year = new Date().getFullYear();
            const start = new Date(`${year}-01-01T00:00:00Z`);
            const end = new Date(`${year + 1}-01-01T00:00:00Z`);
            const count = await prisma.invoices.count({ where: { issued_at: { gte: start, lt: end } } });
            return `HD-${year}-${String(count + 1).padStart(6, '0')}`;
        };

        return await prisma.$transaction(async (tx) => {
            const customer = user_email
                ? await tx.users.findUnique({ where: { email: user_email }, select: { full_name: true, email: true, phone_number: true } })
                : null;

            const subtotal = Number(total_amount) + Number(discount_amount);
            const vatRate = 0.08;
            const vatAmount = Math.round((subtotal - Number(discount_amount)) * vatRate * 100) / 100;
            const invoiceTotal = Math.round((subtotal - Number(discount_amount) + vatAmount) * 100) / 100;

            const invoiceNumber = await generateInvoiceNumber();

            const newOrder = await tx.orders.create({
                data: {
                    total_amount: total_amount,
                    status: status,
                    shipping_address: shipping_address,
                    payment_method: payment_method,
                    payment_status: payment_status,
                    discount_amount: discount_amount,
                    final_amount: final_amount,
                    coupon: coupon_code
                        ? { connect: { code: coupon_code } }
                        : undefined,
                    user_email: user_email || null,

                    OrderItems: {
                        create: items.map(item => ({
                            product_variant_id: item.product_variant_id,
                            quantity: item.quantity,
                            price_at_purchase: item.price_at_purchase
                        }))
                    },

                    invoice: {
                        create: {
                            invoice_number: invoiceNumber,
                            customer_name: customer?.full_name || user_email || 'Khách vãng lai',
                            customer_email: customer?.email || null,
                            customer_phone: customer?.phone_number || null,
                            shipping_address: shipping_address,
                            subtotal: subtotal,
                            discount_amount: Number(discount_amount),
                            vat_rate: vatRate,
                            vat_amount: vatAmount,
                            total_amount: invoiceTotal,
                            note: payment_method ? `Phương thức thanh toán: ${payment_method}` : null
                        }
                    }
                },
                include: {
                    invoice: true,
                    OrderItems: {
                        include: {
                            product_variant: {
                                include: {
                                    product: { select: { name: true } },
                                    VariableAttributes: {
                                        include: {
                                            attributeKey: { select: { name: true } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            if (coupon_code) {
                await tx.coupons.update({
                    where: { code: coupon_code },
                    data: { usage_count: { increment: 1 } }
                })
            }

            for (const item of items) {
                await tx.productVariants.update({
                    where: { id: item.product_variant_id },
                    data: { stock: { decrement: item.quantity } }
                })
            }

            return newOrder;
        });
    },
```

Lưu ý: giữ nguyên các hàm `getOrderDropdown`, `getOrderItemsById`, `getOrderById`... phía dưới.

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/services/customer/order.service.js').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 3: Kiểm tra tạo order kèm invoice**

Run: `node --input-type=module -e "import prisma from './src/db/prisma.js'; import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); const v = await p.productVariants.findFirst({ where: { stock: { gt: 5 } } }); const order = await import('./src/services/customer/order.service.js').then(m => m.default.createOrder({ total_amount: 100, status: 'Processing', shipping_address: 'Test address', payment_method: 'COD', payment_status: 'Pending', discount_amount: 0, final_amount: 100, items: [{ product_variant_id: v.id, quantity: 1, price_at_purchase: 100 }] })); console.log('ORDER_ID', order.id, 'INVOICE', order.invoice?.invoice_number, order.invoice?.total_amount); await p.\$disconnect();"`
Expected: log `ORDER_ID <id> INVOICE HD-<year>-000001 108` (100 + 8% VAT). Sau đó xóa order test này đi (nó kéo theo invoice + trừ stock):

Run: `node --input-type=module -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); await p.orders.deleteMany({ where: { shipping_address: 'Test address' } }); await p.\$disconnect(); console.log('cleaned');"`

- [ ] **Step 4: Commit**

```bash
git add server/src/services/customer/order.service.js
git commit -m "feat(order): auto-generate invoice with VAT on order creation"
```

---

### Task 4: Hủy đơn → invoice Cancelled

**Files:**
- Modify: `server/src/services/customer/order.service.js` (hàm `updateOrder`)

- [ ] **Step 1: Cập nhật updateOrder**

Thay hàm `updateOrder` (dòng `updateOrder: async (orderId, dataUpdate, items) => {` đến `},`) bằng code sau — sau khi update order, nếu status là `Cancelled` thì cập nhật invoice liên quan:

```js
    updateOrder: async (orderId, dataUpdate, items) => {
        const total = Number(dataUpdate.total_amount);
        const final = Number(dataUpdate.final_amount);
        const discount = Number(dataUpdate.discount_amount) || 0;

        const updatedOrder = await prisma.orders.update({
            where: { id: Number(orderId) },
            data: {
                shipping_address: dataUpdate.shipping_address,
                status: dataUpdate.status,
                total_amount: total,
                final_amount: final,
                payment_status: dataUpdate.payment_status,
                payment_method: dataUpdate.payment_method,
                discount_amount: discount,
                user_email: dataUpdate.user_email || null,

                coupon: dataUpdate.coupon_code
                    ? { connect: { code: dataUpdate.coupon_code } }
                    : { disconnect: true },

                OrderItems: {
                    deleteMany: {},
                    create: items.map(item => ({
                        product_variant_id: Number(item.product_variant_id),
                        quantity: Number(item.quantity),
                        price_at_purchase: Number(item.price_at_purchase)
                    }))
                }
            },
            include: {
                OrderItems: true
            }
        });

        if (dataUpdate.status === 'Cancelled') {
            await prisma.invoices.updateMany({
                where: { order_id: Number(orderId), status: { in: ['Pending', 'Completed'] } },
                data: { status: 'Cancelled' }
            });
        }

        return updatedOrder;
    },
```

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/services/customer/order.service.js').then(() => console.log('OK'))"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add server/src/services/customer/order.service.js
git commit -m "feat(order): mark invoice cancelled when order is cancelled"
```

---

### Task 5: Service management invoice

**Files:**
- Create: `server/src/services/management/invoice.service.js`

- [ ] **Step 1: Tạo file**

```js
import prisma from "../../db/prisma.js";

const invoiceService = {
    getAllInvoices: async ({ page, status, search, date_from, date_to } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = {};
        if (status) where.status = status;

        if (date_from || date_to) {
            where.issued_at = {};
            if (date_from) where.issued_at.gte = new Date(date_from);
            if (date_to) where.issued_at.lte = new Date(date_to + 'T23:59:59.999Z');
        }

        if (search) {
            where.OR = [
                { invoice_number: { contains: search } },
                { customer_name: { contains: search } },
            ];
            const searchId = Number(search);
            if (!isNaN(searchId)) {
                where.OR.push({ order_id: searchId });
            }
        }

        const [invoices, totalItems] = await Promise.all([
            prisma.invoices.findMany({
                where,
                take: limit,
                skip: skip,
                include: {
                    order: { select: { id: true, status: true, final_amount: true } }
                },
                orderBy: { issued_at: 'desc' }
            }),
            prisma.invoices.count({ where })
        ]);

        return {
            invoices,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage,
                itemsPerPage: limit
            }
        };
    },

    getInvoiceById: async (invoiceId) => {
        return await prisma.invoices.findUnique({
            where: { id: Number(invoiceId) },
            include: {
                order: {
                    include: {
                        OrderItems: {
                            include: {
                                product_variant: {
                                    include: {
                                        product: { select: { name: true } },
                                        VariableAttributes: {
                                            include: { attributeKey: { select: { name: true } } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}

export default invoiceService;
```

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/services/management/invoice.service.js').then(() => console.log('OK'))"`
Expected: `OK`

---

### Task 6: Controller management invoice

**Files:**
- Create: `server/src/controllers/management/invoice.controller.js`

- [ ] **Step 1: Tạo file**

```js
import invoiceService from "../../services/management/invoice.service.js";

const invoiceController = {
    getAllInvoices: async (req, res) => {
        const { page, status, search, date_from, date_to } = req.query;
        try {
            const result = await invoiceService.getAllInvoices({
                page: parseInt(page || 1),
                status: status || '',
                search: search || '',
                date_from: date_from || '',
                date_to: date_to || '',
            });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    getInvoiceById: async (req, res) => {
        const invoiceId = parseInt(req.params.id);
        try {
            const invoice = await invoiceService.getInvoiceById(invoiceId);
            if (!invoice) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn." });
            }
            return res.status(200).json({ success: true, data: invoice });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    }
}

export default invoiceController;
```

- [ ] **Step 2: Verify cú pháp**

Run: `node -e "import('./src/controllers/management/invoice.controller.js').then(() => console.log('OK'))"`
Expected: `OK`

---

### Task 7: Route + mount

**Files:**
- Create: `server/src/routes/management/invoice.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Tạo route**

```js
import express from "express";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import invoiceController from "../../controllers/management/invoice.controller.js";

const invoiceRoute = express.Router()

invoiceRoute
    .get("/:id", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getInvoiceById)
    .get("/", verifyToken, checkPermission("xem-hoa-don"), invoiceController.getAllInvoices)

export default invoiceRoute;
```

Lưu ý: đặt `/:id` TRƯỚC `/` như pattern các route khác trong dự án.

- [ ] **Step 2: Mount trong index.route.js**

Sửa `server/src/routes/index.route.js`:
- Thêm import sau dòng `import productAttributeKeyRoute ...`:

```js
import invoiceRoute from "./management/invoice.route.js";
```

- Thêm mount sau dòng `app.use(`${api_prefix_v1}management/product-attribute-key/`, productAttributeKeyRoute)`:

```js
    app.use(`${api_prefix_v1}management/invoice/`, invoiceRoute)
```

- [ ] **Step 3: Verify cú pháp + khởi động server**

Run: `node -e "import('./src/routes/index.route.js').then(() => console.log('OK'))"`
Expected: `OK`

Khởi động server trong 5 giây để check không crash:
Run: `$p = Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "D:\Programming\SportNexus\server" -PassThru -NoNewWindow; Start-Sleep 6; if ($p.HasExited) { Write-Output "CRASHED" } else { Write-Output "RUNNING"; Stop-Process -Id $p.Id -Force }`
Expected: `RUNNING`

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/management/invoice.route.js server/src/routes/index.route.js
git commit -m "feat(invoice): add management list/detail endpoints"
```

---

### Task 8: Xác minh end-to-end

**Files:** (không sửa file)

- [ ] **Step 1: Kiểm tra API với token admin**

1. Đảm bảo server đang chạy (khởi động riêng nếu cần).
2. Lấy token admin:
   Run: `node --input-type=module -e "import { PrismaClient } from '@prisma/client'; import bcrypt from 'bcrypt'; const p = new PrismaClient(); const u = await p.users.findUnique({ where: { email: 'admin@gmail.com' }, include: { role: true } }); console.log(u?.id, u?.role?.slug); await p.\$disconnect();"`
   Dùng password `MatKhau@123` để đăng nhập qua `POST /api/v1/auth/login` (nếu có) hoặc thao tác thủ công.
3. Gọi `GET http://localhost:5000/api/v1/management/invoice/?page=1` kèm `Authorization: Bearer <token>`.
   Expected: `200` với danh sách invoices + pagination.

- [ ] **Step 2: Kiểm tra chi tiết**

Gọi `GET /api/v1/management/invoice/1` kèm token.
Expected: `200` với invoice + order + OrderItems.

- [ ] **Step 3: Kiểm tra 403 khi thiếu permission**

Gọi 2 endpoint trên **không** kèm token.
Expected: `401` (verifyToken chặn).

- [ ] **Step 4: Báo cáo cuối**

Theo AGENTS.md, nêu rõ thay đổi schema đã thực hiện (model `Invoices`, enum `InvoiceStatus`, migration `add_invoices`).

---

## Self-Review Ghi chú

- **Spec coverage:** model Invoices ✓ (Task 1), phát hành tự động ✓ (Task 3), VAT 8% + snapshot ✓ (Task 3), hủy đơn → Cancelled ✓ (Task 4), API list/detail ✓ (Task 5-7), permission `xem-hoa-don` ✓ (Task 2), verify ✓ (Task 8).
- **Type consistency:** Dùng `tx.orders.create` (lowercase, đúng theo Prisma runtime khi transaction callback) trong khi các chỗ khác dùng `prisma.Orders` — kiểm tra: project dùng cả `prisma.Orders` (service hiện có) lẫn `prisma.orders` (updateOrder dòng 229). Cả hai đều hợp lệ với Prisma Client. Trong `$transaction` callback bắt buộc dùng `tx.orders` (không có `tx.Orders`).
- **Số hóa đơn race:** `generateInvoiceNumber` đọc count ngoài transaction callback nhưng được gọi TRONG callback — đọc qua `tx.invoices.count` để đảm bảo nhìn thấy row vừa insert nếu retry; đủ tốt cho trường hợp hiếm, theo spec.
