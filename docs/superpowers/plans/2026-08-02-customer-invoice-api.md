# API customer xem hóa đơn + trang /hoa-don Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho người dùng đã đăng nhập xem danh sách và chi tiết hóa đơn của chính mình tại trang `/hoa-don` và `/hoa-don/:id`.

**Architecture:** Thêm API customer riêng cho invoice (`GET /api/v1/customer/invoice` + `GET /api/v1/customer/invoice/:id`), bảo vệ bằng `verifyToken`, lọc theo `req.user.email` (snapshot `customer_email` trong bảng `invoices`). Frontend tạo trang danh sách và chi tiết mô phỏng `Order.jsx`/`OrderDetail.jsx`, thay `ProfilePlaceholder` tại route `hoa-don`.

**Tech Stack:** Express 5 + Prisma + JWT (backend), React Router 19 loaders + axiosClient (frontend). Backend chưa có test suite thật — verification bằng startup check + gọi tay curl/script.

---

### Task 1: Backend — customer invoice service

**Files:**
- Create: `server/src/services/customer/invoice.service.js`

- [ ] **Step 1: Tạo service mới**

```js
import prisma from "../../db/prisma.js";

const invoiceService = {
    getMyInvoices: async ({ email, page, status } = {}) => {
        const limit = 10;
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * limit;

        const where = { customer_email: email };
        if (status) where.status = status;

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

    getMyInvoiceDetail: async (invoiceId, email) => {
        return await prisma.invoices.findFirst({
            where: { id: Number(invoiceId), customer_email: email },
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

Lưu ý: `getMyInvoiceDetail` dùng `findFirst` với `customer_email: email` trong `where` — đây chính là cơ chế đảm bảo user chỉ xem được hóa đơn của mình.

- [ ] **Step 2: Startup check**

Run: `node --check server/src/services/customer/invoice.service.js`
Expected: không có lỗi cú pháp (exit 0, không in gì).

- [ ] **Step 3: Commit** — KHÔNG commit (theo yêu cầu user trong dự án này, để git cho user tự xử lý).

---

### Task 2: Backend — customer invoice controller

**Files:**
- Create: `server/src/controllers/customer/invoice.controller.js`

- [ ] **Step 1: Tạo controller**

```js
import invoiceService from "../../services/customer/invoice.service.js";

const invoiceController = {
    getMyInvoices: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const status = req.query.status || '';
        const email = req.user.email;

        try {
            const result = await invoiceService.getMyInvoices({ email, page, status });
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi lấy danh sách hóa đơn'
            });
        }
    },

    getMyInvoiceDetail: async (req, res) => {
        const invoiceId = parseInt(req.params.id);
        const email = req.user.email;

        try {
            const invoice = await invoiceService.getMyInvoiceDetail(invoiceId, email);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hóa đơn'
                });
            }
            return res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi lấy chi tiết hóa đơn'
            });
        }
    }
}

export default invoiceController;
```

- [ ] **Step 2: Startup check**

Run: `node --check server/src/controllers/customer/invoice.controller.js`
Expected: không có lỗi cú pháp.

---

### Task 3: Backend — customer invoice route + mount

**Files:**
- Create: `server/src/routes/customer/invoice.route.js`
- Modify: `server/src/routes/index.route.js:8` (import) và `server/src/routes/index.route.js:56` (mount)

- [ ] **Step 1: Tạo route**

```js
import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import invoiceController from "../../controllers/customer/invoice.controller.js";

const invoiceRoute = express.Router();

invoiceRoute

    .get("/:id", verifyToken, invoiceController.getMyInvoiceDetail)
    .get("/", verifyToken, invoiceController.getMyInvoices)

export default invoiceRoute;
```

- [ ] **Step 2: Import trong `index.route.js`**

Thêm dòng sau `import orderRoute from "./customer/order.route.js";`:

```js
import invoiceRoute from "./customer/invoice.route.js";
```

- [ ] **Step 3: Mount trong `index.route.js`**

Thêm dòng sau `app.use(`${api_prefix_v1}customer/order/`, orderRoute)`:

```js
    app.use(`${api_prefix_v1}customer/invoice/`, invoiceRoute)
```

- [ ] **Step 4: Startup check**

Run: `node --check server/src/routes/customer/invoice.route.js` và `node --check server/src/routes/index.route.js`
Expected: không có lỗi cú pháp.

---

### Task 4: Backend — E2E verification

**Files:**
- Create (tạm, sẽ xóa): `C:\Users\NGUYEN~1\AppData\Local\Temp\opencode\verify-invoice-e2e.mjs`

Server đang chạy ở `http://localhost:8081`. Admin: `admin@gmail.com` / `MatKhau@123`. User `ngchinguyen2506@gmail.com` đã có 4 hóa đơn (HD-2026-000002 → 000005) — dùng để test.

- [ ] **Step 1: Script verify**

```js
import fetch from 'node-fetch';
const BASE = 'http://localhost:8081/api/v1';

async function login(email, password) {
    const r = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const j = await r.json();
    if (r.status !== 200) { console.log('LOGIN FAIL', r.status, j); process.exit(1); }
    return j.accessToken || j.data?.accessToken || j.data?.tokens?.accessToken;
}

const token = await login('admin@gmail.com', 'MatKhau@123');
const headers = { Authorization: `Bearer ${token}` };

let r = await fetch(`${BASE}/customer/invoice`, { headers });
let j = await r.json();
console.log('LIST status:', r.status);
console.log('LIST invoices count:', j.data?.invoices?.length ?? j.data?.length ?? '?');
console.log('LIST emails:', [...new Set((j.data?.invoices ?? []).map(i => i.customer_email))]);
if (r.status !== 200) process.exit(1);
if (j.data?.invoices?.some(i => i.customer_email !== 'admin@gmail.com')) {
    console.log('FAIL: có hóa đơn không phải của admin');
    process.exit(1);
}

r = await fetch(`${BASE}/customer/invoice`, { headers });
j = await r.json();
const list = j.data?.invoices ?? [];
const ownId = list[0]?.id;
if (ownId) {
    r = await fetch(`${BASE}/customer/invoice/${ownId}`, { headers });
    console.log('DETAIL own status:', r.status);
    if (r.status !== 200) process.exit(1);
}

r = await fetch(`${BASE}/customer/invoice/1`, { headers });
console.log('DETAIL foreign status (expect 404):', r.status);
if (r.status !== 404) process.exit(1);

r = await fetch(`${BASE}/customer/invoice`);
console.log('NO-TOKEN status (expect 401):', r.status);
if (r.status !== 401) process.exit(1);

console.log('E2E OK');
process.exit(0);
```

Lưu ý: nếu admin không có hóa đơn nào, LIST sẽ trả `[]` — vẫn hợp lệ (200). Test 404 dùng invoice id `1` (không thuộc admin); nếu invoice 1 lại thuộc admin, thay bằng id của hóa đơn của `ngchinguyen2506@gmail.com`.

- [ ] **Step 2: Chạy verify**

Run: `node C:\Users\NGUYEN~1\AppData\Local\Temp\opencode\verify-invoice-e2e.mjs`
Expected: `LIST status: 200`, các status khác đúng kỳ vọng, cuối cùng in `E2E OK`.

- [ ] **Step 3: Dọn file tạm**

Run: `Remove-Item -LiteralPath "C:\Users\NGUYEN~1\AppData\Local\Temp\opencode\verify-invoice-e2e.mjs" -Force`
Expected: xóa thành công.

---

### Task 5: Frontend — API client + loader

**Files:**
- Create: `client/src/api/customer/invoiceApi.jsx`
- Create: `client/src/loaders/customer/invoiceLoader.jsx`
- Modify: `client/src/routes/webLoader.jsx` (export loader)

- [ ] **Step 1: Tạo API client**

```jsx
import axiosClient from "@/lib/axiosClient";

const invoiceApi = {
  getInvoices: (query) => {
    const url = `/customer/invoice${query ? `?${query}` : ""}`;
    return axiosClient.get(url);
  },
  getInvoiceDetail: (id) => {
    const url = `/customer/invoice/${id}`;
    return axiosClient.get(url);
  },
};

export default invoiceApi;
```

- [ ] **Step 2: Tạo loader**

```jsx
import invoiceApi from "@/api/customer/invoiceApi";

export async function invoicesLoader({ request }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return { invoices: [], pagination: null, user: null };

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const status = url.searchParams.get("status") || "";

  const params = new URLSearchParams();
  params.set("page", page);
  if (status) params.set("status", status);

  try {
    const res = await invoiceApi.getInvoices(params.toString());
    return {
      invoices: res?.data?.invoices || [],
      pagination: res?.data?.pagination || null,
      user,
    };
  } catch {
    return { invoices: [], pagination: null, user };
  }
}

export async function invoiceDetailLoader({ params }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  try {
    const res = await invoiceApi.getInvoiceDetail(params.id);
    return { invoice: res?.data || null, user };
  } catch {
    return { invoice: null, user };
  }
}
```

- [ ] **Step 3: Export loader từ `webLoader.jsx`**

Thêm dòng vào cuối file:

```jsx
export { invoicesLoader, invoiceDetailLoader } from "@/loaders/customer/invoiceLoader";
```

---

### Task 6: Frontend — trang danh sách hóa đơn

**Files:**
- Create: `client/src/pages/profile/Invoice.jsx`

- [ ] **Step 1: Tạo trang danh sách**

```jsx
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import Pagination from "@/components/ui/pagination";

const INVOICE_LABELS = {
  Pending: "Chờ xử lý",
  Completed: "Đã hoàn thành",
  Cancelled: "Đã hủy",
};

const INVOICE_BADGE = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const Invoice = () => {
  const { invoices, pagination, user } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) return null;

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          Hóa đơn của tôi
        </h2>
      </div>

      {invoices.length === 0 ? (
        <div className="border border-slate-200 dark:border-slate-900 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <p className="text-lg font-medium mb-2 text-slate-700 dark:text-slate-300">
            Chưa có hóa đơn
          </p>
          <p className="text-sm">
            Khi bạn đặt hàng và hóa đơn được phát hành, chúng sẽ xuất hiện tại đây
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-900 rounded-2xl bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">Số hóa đơn</th>
                  <th className="py-3.5 px-4">Ngày phát hành</th>
                  <th className="py-3.5 px-4">Tổng tiền</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => navigate(`/hoa-don/${invoice.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-sky-600 dark:text-sky-400">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {invoice.issued_at ? formatDate(invoice.issued_at) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${INVOICE_BADGE[invoice.status] || ""}`}
                      >
                        {INVOICE_LABELS[invoice.status] || invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                variant="light"
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoice;
```

---

### Task 7: Frontend — trang chi tiết hóa đơn

**Files:**
- Create: `client/src/pages/profile/InvoiceDetail.jsx`

- [ ] **Step 1: Tạo trang chi tiết**

```jsx
import { useLoaderData, Link } from "react-router-dom";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import { ArrowLeft } from "lucide-react";

const INVOICE_LABELS = {
  Pending: "Chờ xử lý",
  Completed: "Đã hoàn thành",
  Cancelled: "Đã hủy",
};

const INVOICE_BADGE = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const InvoiceDetail = () => {
  const { invoice } = useLoaderData();

  if (!invoice) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Không tìm thấy hóa đơn
        </p>
        <Link
          to="/hoa-don"
          className="text-sky-600 dark:text-sky-400 hover:underline mt-3 inline-block font-semibold text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200 space-y-6">
      <Link
        to="/hoa-don"
        className="inline-flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
      >
        <ArrowLeft size={16} />
        Quay lại hóa đơn
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md">
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
          Hóa đơn {invoice.invoice_number}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${INVOICE_BADGE[invoice.status] || ""}`}
        >
          {INVOICE_LABELS[invoice.status] || invoice.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Ngày phát hành
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {invoice.issued_at ? formatFullDateTime(invoice.issued_at) : "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Tên khách hàng
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {invoice.customer_name || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Email
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {invoice.customer_email || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Số điện thoại
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {invoice.customer_phone || "—"}
          </p>
        </div>
        <div className="sm:col-span-2 space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Địa chỉ giao hàng
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {invoice.shipping_address}
          </p>
        </div>
        {invoice.note && (
          <div className="sm:col-span-2 space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
              Ghi chú
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {invoice.note}
            </p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Tạm tính
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(invoice.subtotal)}
          </p>
        </div>
        {Number(invoice.discount_amount) > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
              Giảm giá
            </p>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(invoice.discount_amount)}
            </p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            VAT ({Number(invoice.vat_rate) * 100}%)
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(invoice.vat_amount)}
          </p>
        </div>
        <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Tổng cộng
          </p>
          <p className="text-base font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(invoice.total_amount)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Sản phẩm đã đặt
        </h3>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-[15%]" />
              <col className="w-[12%]" />
              <col className="w-[23%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-3.5 px-4 text-left">Sản phẩm</th>
                <th className="py-3.5 px-4 text-right">Đơn giá</th>
                <th className="py-3.5 px-4 text-right">Số lượng</th>
                <th className="py-3.5 px-4 text-right">Tạm tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoice.order?.OrderItems?.map((item) => {
                const variant = item.product_variant;
                const attributes = variant?.VariableAttributes?.map(
                  (attr) => `${attr.attributeKey?.name}: ${attr.value}`,
                ).join(", ");
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {variant?.product?.name || "Sản phẩm"}
                        </p>
                        {attributes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {attributes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.price_at_purchase)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(
                        Number(item.price_at_purchase) * Number(item.quantity),
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
```

---

### Task 8: Frontend — cập nhật route `/hoa-don`

**Files:**
- Modify: `client/src/routes/webRoute.jsx:34` (thêm lazy import), `client/src/routes/webRoute.jsx:10` (thêm loader import), `client/src/routes/webRoute.jsx:116-119` (route hoa-don)

- [ ] **Step 1: Thêm lazy import**

Thêm dòng sau `const ProfilePlaceholder = lazy(() => import("@/pages/profile/placeholder"));`:

```jsx
const Invoice = lazy(() => import("@/pages/profile/Invoice"));
const InvoiceDetail = lazy(() => import("@/pages/profile/InvoiceDetail"));
```

- [ ] **Step 2: Thêm loader vào import từ webLoader**

Sửa dòng 9 (`ordersLoader,` → thêm `invoicesLoader,`):

```jsx
import {
  homeLoader,
  productDetailLoader,
  addressLoader,
  addressAction,
  editAddressLoader,
  profileLoader,
  ordersLoader,
  orderDetailLoader,
  invoicesLoader,
  invoiceDetailLoader,
  productsLoader,
} from "./webLoader";
```

- [ ] **Step 3: Thay route `hoa-don`**

Thay block:

```jsx
    {
      path: "hoa-don",
      element: <ProfilePlaceholder />,
    },
```

thành:

```jsx
    {
      path: "hoa-don",
      element: <Invoice />,
      loader: invoicesLoader,
    },
    {
      path: "hoa-don/:id",
      element: <InvoiceDetail />,
      loader: invoiceDetailLoader,
    },
```

Lưu ý: `ProfilePlaceholder` vẫn còn dùng cho `thong-bao` và `bao-mat` (dòng 126, 134) — giữ nguyên import.

---

### Task 9: Frontend — build + lint verification

- [ ] **Step 1: Build**

Run: `npm run build --prefix client`
Expected: build thành công, không có lỗi.

- [ ] **Step 2: Lint**

Run: `npm run lint --prefix client`
Expected: không có lỗi ESLint mới (cảnh báo tồn tại sẵn của dự án được phép).

---

## Self-Review

- **Spec coverage:** Mọi mục trong spec (`docs/superpowers/specs/2026-08-02-customer-invoice-api-design.md`) đều có task tương ứng — Task 1-3 (backend service/controller/route), Task 4 (E2E), Task 5 (api+loader), Task 6-7 (trang danh sách + chi tiết), Task 8 (route), Task 9 (build/lint).
- **Placeholder scan:** Không có TBD/TODO; mọi bước đều có code hoặc lệnh cụ thể.
- **Type consistency:** Tên hàm nhất quán xuyên suốt: `getMyInvoices`/`getMyInvoiceDetail` (service → controller), `invoicesLoader`/`invoiceDetailLoader` (loader → webLoader → webRoute), `getInvoices`/`getInvoiceDetail` (api client). Trả về theo pattern dự án: `{ success, data }`.
- **Chú ý casing:** file frontend `.jsx`, import bằng đường dẫn alias `@/...` — khớp với pattern dự án hiện có.
