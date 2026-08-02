# Payment Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai module thanh toán cho SportNexus: COD + PayOS (QR ngân hàng, MoMo, thẻ, VNPay) với xác nhận tự động qua webhook.

**Architecture:** Provider pattern — registry `providers/index.js` map `PaymentMethod` → provider (`cod`, `payos`). Service `payment.service.js` chứa logic transaction/đối chiếu; controller/routes customer + management tách riêng. Webhook PayOS xác minh chữ ký HMAC SHA256 bằng `PAYOS_CHECKSUM_KEY`. Schema thêm bảng `PaymentTransactions`; nếu thiếu credential PayOS, tự fallback về COD + chuyển khoản thủ công.

**Tech Stack:** Express 5, Prisma (MySQL), `@payos/node` v2, Joi, Supabase Storage, React 19 (client), axios.

---

## File Structure

**Backend (server/):**

- `prisma/schema.prisma` — Modify: thêm model `PaymentTransactions` + relation trên `Orders`
- `prisma/migrations/<timestamp>_add_payment_transactions/migration.sql` — Created by `prisma migrate dev`
- `prisma/data/permissions.js` — Modify: thêm `paymentPermissions`
- `src/configs/payos.config.js` — Create: khởi tạo PayOS client, `isPayosConfigured()`
- `src/services/customer/payment/providers/index.js` — Create: registry
- `src/services/customer/payment/providers/cod.provider.js` — Create
- `src/services/customer/payment/providers/payos.provider.js` — Create
- `src/services/customer/payment/qr.service.js` — Create: tạo QR VietQR
- `src/services/customer/payment.service.js` — Rewrite: logic nghiệp vụ thanh toán
- `src/controllers/customer/payment.controller.js` — Rewrite
- `src/routes/customer/payment.route.js` — Rewrite
- `src/controllers/management/payment.controller.js` — Create
- `src/routes/management/payment.route.js` — Create
- `src/validators/customer/payment.validator.js` — Create
- `src/routes/index.route.js` — Modify: mount management payment
- `src/services/customer/order.service.js` — Modify: gọi `markCodPaid` khi Delivered
- `.env.example` — Modify: thêm biến PayOS

**Frontend (client/):**

- `src/api/customer/paymentApi.js` — Create
- `src/pages/Checkout/index.jsx` — Modify: gọi tạo payment sau khi tạo order, redirect PayOS
- `src/pages/Checkout/components/PaymentSection.jsx` — Modify: thêm CREDIT_CARD + PayOS
- `src/pages/Checkout/components/OrderSuccess.jsx` — Modify: hiển thị trạng thái thanh toán + poll

---

## Task 1: Cài đặt dependency `@payos/node`

**Files:**

- Modify: `server/package.json`

- [ ] **Step 1: Cài dependency**

Run (trong `server/`):

```bash
npm install @payos/node
```

Expected: `@payos/node@^2.0.5` được thêm vào `server/package.json` dependencies.

- [ ] **Step 2: Kiểm tra import hoạt động**

Run:

```bash
node -e "import('@payos/node').then(m => console.log('payos OK', typeof m.default))"
```

Expected: in ra `payos OK function`.

- [ ] **Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "chore(payment): add @payos/node dependency"
```

---

## Task 2: Schema — thêm model `PaymentTransactions`

**Files:**

- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Thêm model mới**

Trong `server/prisma/schema.prisma`, sau model `Orders` (sau dòng đóng ngoặc `}` của `Orders`), thêm:

```prisma
// PaymentTransactions - Lịch sử thanh toán của 1 order
model PaymentTransactions {
    id                Int             @id @default(autoincrement())
    order_id          Int
    Orders            Orders          @relation(fields: [order_id], references: [id], onDelete: Cascade)
    method            PaymentMethod
    amount            Decimal         @db.Decimal(10, 2)
    status            PaymentStatus   @default(Pending)
    provider_ref      String?
    transaction_code  String?
    receipt_image_url String?
    note              String?
    paid_at           DateTime?
    created_at        DateTime        @default(now())
    updated_at        DateTime        @updatedAt

    @@index([order_id])
    @@map("payment_transactions")
}
```

- [ ] **Step 2: Thêm relation field trên `Orders`**

Trong model `Orders`, sau dòng `Reviews Reviews[]` thêm:

```prisma
    PaymentTransactions PaymentTransactions[]
```

- [ ] **Step 3: Tạo migration**

Run (trong `server/`):

```bash
npx prisma migrate dev --name add_payment_transactions
```

Expected: migration SQL mới được tạo trong `server/prisma/migrations/`, Prisma Client được generate, kết nối DB thành công.

> Lưu ý: Nếu `prisma migrate dev` không chạy được (thiếu DB), chạy `npx prisma generate` để tối thiểu cập nhật client, và **nêu rõ gap này trong báo cáo cuối** (migrations chưa versioned theo AGENTS.md).

- [ ] **Step 4: Commit**

```bash
git add server/prisma/
git commit -m "feat(payment): add PaymentTransactions model"
```

---

## Task 3: Config PayOS + env

**Files:**

- Create: `server/src/configs/payos.config.js`
- Modify: `server/.env.example`

- [ ] **Step 1: Tạo config file**

Tạo `server/src/configs/payos.config.js`:

```js
import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const API_KEY = process.env.PAYOS_API_KEY;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

const payos =
  CLIENT_ID && API_KEY && CHECKSUM_KEY
    ? new PayOS({
        clientId: CLIENT_ID,
        apiKey: API_KEY,
        checksumKey: CHECKSUM_KEY,
      })
    : null;

export const isPayosConfigured = () => !!payos;

export const getPayos = () => {
  if (!payos) {
    const err = new Error("Cổng PayOS chưa được cấu hình.");
    err.code = "PAYOS_NOT_CONFIGURED";
    throw err;
  }
  return payos;
};

export { payos };
```

- [ ] **Step 2: Thêm biến env**

Thêm vào cuối `server/.env.example`:

```
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_ENV=dev
PAYOS_RETURN_URL=
```

- [ ] **Step 3: Kiểm tra syntax**

Run:

```bash
node --check src/configs/payos.config.js
```

Expected: không có output (thành công).

- [ ] **Step 4: Commit**

```bash
git add server/src/configs/payos.config.js server/.env.example
git commit -m "feat(payment): add PayOS config and env vars"
```

---

## Task 4: QR service (VietQR)

**Files:**

- Create: `server/src/services/customer/payment/qr.service.js`

- [ ] **Step 1: Tạo service**

Tạo `server/src/services/customer/payment/qr.service.js`:

```js
import { uploadFileToSupabase } from "../../../utils/imageUpload.utils.js";

const BANK_ACCOUNT_NO = process.env.BANK_ACCOUNT_NO;
const BANK_NAME = process.env.BANK_NAME || "Vietcombank";
const BANK_ID = process.env.BANK_ID || "970436";

const buildVietQRContent = ({ accountNo, bankId, amount, content }) => {
  // Không dùng thư viện encode chuẩn EMVCo để tránh phụ thuộc;
  // dùng cấu trúc VietQR đơn giản theo chuẩn qrcontent của API VietQR public.
  const payload = [
    ["00", "01"],
    ["01", bankId],
    ["02", accountNo],
    ["03", "TRAVEL"],
    ["04", "QRV1"],
    ["38", "0208QRIBFTTC"],
    ["53", "704"],
    ["54", String(amount)],
    ["55", content || "Thanh toan don hang"],
    ["58", "VN"],
    ["59", "SportNexus"],
  ];
  return payload
    .map(([id, val]) => `${id}${String(val.length).padStart(2, "0")}${val}`)
    .join("");
};

const buildQrUrl = (vietQRContent) =>
  `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT_NO}-qr_only.png?amount=0&addInfo=${encodeURIComponent(vietQRContent.split("|")[0] || "")}&accountName=SportNexus`;

const qrService = {
  getBankAccountInfo: () => ({
    bankName: BANK_NAME,
    bankId: BANK_ID,
    accountNo: BANK_ACCOUNT_NO,
    accountName: "SportNexus",
  }),

  buildQrImageUrl: ({ amount, orderId }) => {
    const content = `SN${orderId}${Date.now().toString().slice(-6)}`;
    const vietQRContent = buildVietQRContent({
      accountNo: BANK_ACCOUNT_NO,
      bankId: BANK_ID,
      amount,
      content,
    });
    return {
      qrImageUrl: buildQrUrl(vietQRContent),
      content,
    };
  },

  uploadReceiptImage: async (fileBuffer, transactionId) => {
    return uploadFileToSupabase(
      fileBuffer,
      "payment_receipts",
      `tx_${transactionId}`,
    );
  },
};

export default qrService;
```

> Lưu ý: QR dùng URL ảnh từ `img.vietqr.io` (public). Nếu cần thay đổi ngân hàng/số tài khoản, chỉnh qua env `BANK_ACCOUNT_NO`/`BANK_NAME`/`BANK_ID`.

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/services/customer/payment/qr.service.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/customer/payment/qr.service.js
git commit -m "feat(payment): add VietQR service for bank transfer"
```

---

## Task 5: Providers — registry + COD + PayOS

**Files:**

- Create: `server/src/services/customer/payment/providers/index.js`
- Create: `server/src/services/customer/payment/providers/cod.provider.js`
- Create: `server/src/services/customer/payment/providers/payos.provider.js`

- [ ] **Step 1: Tạo COD provider**

Tạo `server/src/services/customer/payment/providers/cod.provider.js`:

```js
const codProvider = {
  name: "COD",

  createPayment: async ({ order, transaction }) => {
    return {
      transactionId: transaction.id,
      status: "Pending",
      instructions: "Bạn sẽ thanh toán khi nhận hàng.",
      checkoutUrl: null,
    };
  },

  confirm: async () => {
    return { status: "Paid" };
  },

  refund: async () => {
    return { status: "Refunded" };
  },
};

export default codProvider;
```

- [ ] **Step 2: Tạo PayOS provider**

Tạo `server/src/services/customer/payment/providers/payos.provider.js`:

```js
import { getPayos } from "../../../../configs/payos.config.js";

const payosProvider = {
  name: "PayOS",

  createPayment: async ({
    order,
    transaction,
    channel,
    returnUrl,
    cancelUrl,
  }) => {
    const payos = getPayos();
    const result = await payos.paymentRequests.create({
      orderCode: transaction.id,
      amount: Math.round(Number(order.final_amount)),
      description: `SportNexus ${transaction.id}`,
      returnUrl,
      cancelUrl,
      buyerEmail: order.user_email || undefined,
    });

    return {
      transactionId: transaction.id,
      status: "Pending",
      checkoutUrl: result.checkoutUrl,
      providerRef: String(result.paymentLinkId),
    };
  },

  confirm: async () => {
    return { status: "Paid" };
  },

  refund: async ({ transaction }) => {
    // PayOS chưa có API hoàn tiền public qua SDK; việc hoàn tiền thật
    // thực hiện trên dashboard PayOS. Ở đây chỉ cập nhật trạng thái hệ thống.
    return {
      status: "Refunded",
      note: "Hoàn tiền thực hiện thủ công trên dashboard PayOS",
    };
  },
};

export default payosProvider;
```

> Lưu ý: SDK v2.0.5 không nhận `paymentMethod` trong `create` — khách chọn kênh thanh toán ngay trên trang thanh toán PayOS. Vì vậy `channel` chỉ mang tính ghi nhận; không ép kênh qua SDK. `channel` được lưu trong body nhưng PayOSProvider bỏ qua khi gọi API (khách chọn trên trang PayOS).

- [ ] **Step 3: Tạo registry**

Tạo `server/src/services/customer/payment/providers/index.js`:

```js
import codProvider from "./cod.provider.js";
import payosProvider from "./payos.provider.js";
import { isPayosConfigured } from "../../../../configs/payos.config.js";

const providers = {
  cod: codProvider,
  payos: payosProvider,
};

export const getProvider = (method) => {
  const key = String(method || "").toLowerCase();
  return providers[key] || null;
};

export const getAvailablePaymentMethods = () => {
  const methods = [
    { value: "COD", label: "Thanh toán khi nhận hàng", channels: ["COD"] },
  ];
  if (isPayosConfigured()) {
    methods.push(
      {
        value: "BANK_TRANSFER",
        label: "Chuyển khoản ngân hàng (PayOS)",
        channels: ["BANK_TRANSFER"],
      },
      { value: "MOMO", label: "Ví MoMo", channels: ["MOMO"] },
      {
        value: "CREDIT_CARD",
        label: "Thẻ ATM / thẻ quốc tế",
        channels: ["CREDIT_CARD"],
      },
      { value: "VNPAY", label: "VNPay", channels: ["VNPAY"] },
    );
  } else {
    methods.push({
      value: "BANK_TRANSFER",
      label: "Chuyển khoản ngân hàng",
      channels: ["BANK_TRANSFER"],
      manual: true,
    });
  }
  return methods;
};

export const isManualBankTransfer = (method) =>
  method === "BANK_TRANSFER" && !isPayosConfigured();

export default {
  providers,
  getProvider,
  getAvailablePaymentMethods,
  isManualBankTransfer,
};
```

- [ ] **Step 4: Kiểm tra syntax cả 3 file**

Run:

```bash
node --check src/services/customer/payment/providers/index.js; node --check src/services/customer/payment/providers/cod.provider.js; node --check src/services/customer/payment/providers/payos.provider.js
```

Expected: không có output.

- [ ] **Step 5: Commit**

```bash
git add server/src/services/customer/payment/providers/
git commit -m "feat(payment): add payment providers (COD, PayOS) and registry"
```

---

## Task 6: Validator

**Files:**

- Create: `server/src/validators/customer/payment.validator.js`

- [ ] **Step 1: Tạo validator**

Tạo `server/src/validators/customer/payment.validator.js`:

```js
import Joi from "Joi";

const paymentSchema = {
  createPayment: Joi.object({
    method: Joi.string()
      .valid("COD", "BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY")
      .required()
      .messages({
        "any.only": "Phương thức thanh toán không hợp lệ",
        "any.required": "Phương thức thanh toán là bắt buộc",
      }),
    channel: Joi.string()
      .valid("BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY", "COD")
      .optional(),
  }),

  uploadReceipt: Joi.object({
    transaction_code: Joi.string().min(3).max(100).required().messages({
      "any.required": "Mã giao dịch là bắt buộc",
      "string.min": "Mã giao dịch quá ngắn",
    }),
    note: Joi.string().allow(null, "").optional(),
  }),

  adminConfirm: Joi.object({
    note: Joi.string().allow(null, "").optional(),
  }),

  adminRefund: Joi.object({
    note: Joi.string().allow(null, "").optional(),
  }),
};

export default paymentSchema;
```

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/validators/customer/payment.validator.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/validators/customer/payment.validator.js
git commit -m "feat(payment): add payment validators"
```

---

## Task 7: payment.service.js — core nghiệp vụ

**Files:**

- Rewrite: `server/src/services/customer/payment.service.js`

- [ ] **Step 1: Viết service**

Ghi đè toàn bộ `server/src/services/customer/payment.service.js`:

```js
import prisma from "../../db/prisma.js";
import {
  getProvider,
  getAvailablePaymentMethods,
  isManualBankTransfer,
} from "./payment/providers/index.js";
import qrService from "./payment/qr.service.js";
import { isPayosConfigured } from "../../configs/payos.config.js";

const PAYMENT_METHODS_MAP = {
  BANK_TRANSFER: "BANK_TRANSFER",
  MOMO: "MOMO",
  CREDIT_CARD: "CREDIT_CARD",
  VNPAY: "VNPAY",
  COD: "COD",
};

const paymentService = {
  getAvailableMethods: () => getAvailablePaymentMethods(),

  getOrderWithUser: async (orderId) => {
    return prisma.Orders.findUnique({
      where: { id: Number(orderId) },
      include: { PaymentTransactions: true },
    });
  },

  createTransaction: async ({ orderId, method, channel }) => {
    const order = await prisma.Orders.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng.");
      err.code = "NOT_FOUND";
      throw err;
    }

    const providerName = isManualBankTransfer(method)
      ? "cod"
      : method === "COD"
        ? "cod"
        : "payos";
    const provider = getProvider(providerName);
    if (!provider) {
      const err = new Error("Phương thức thanh toán không khả dụng.");
      err.code = "INVALID_METHOD";
      throw err;
    }

    const transaction = await prisma.PaymentTransactions.create({
      data: {
        order_id: Number(orderId),
        method,
        amount: order.final_amount,
        status: "Pending",
      },
    });

    const returnUrl = `${process.env.PAYOS_RETURN_URL || process.env.FRONTEND_URL}/thanh-toan/success`;
    const cancelUrl = `${process.env.PAYOS_RETURN_URL || process.env.FRONTEND_URL}/thanh-toan`;
    const created = await provider.createPayment({
      order,
      transaction,
      channel,
      returnUrl,
      cancelUrl,
    });

    if (created.providerRef) {
      await prisma.PaymentTransactions.update({
        where: { id: transaction.id },
        data: { provider_ref: created.providerRef },
      });
    }

    return {
      transaction,
      checkoutUrl: created.checkoutUrl || null,
      instructions: created.instructions || null,
      bankAccount:
        created.status === "Pending" && isManualBankTransfer(method)
          ? qrService.getBankAccountInfo()
          : null,
      qrImageUrl:
        created.status === "Pending" && isManualBankTransfer(method)
          ? qrService.buildQrImageUrl({
              amount: Number(order.final_amount),
              orderId: order.id,
            }).qrImageUrl
          : null,
    };
  },

  getTransactionById: async (transactionId) => {
    const tx = await prisma.PaymentTransactions.findUnique({
      where: { id: Number(transactionId) },
      include: {
        Orders: {
          select: {
            id: true,
            final_amount: true,
            status: true,
            user_email: true,
          },
        },
      },
    });
    if (!tx) {
      const err = new Error("Không tìm thấy giao dịch thanh toán.");
      err.code = "NOT_FOUND";
      throw err;
    }
    return tx;
  },

  getTransactionsByOrder: async (orderId) => {
    return prisma.PaymentTransactions.findMany({
      where: { order_id: Number(orderId) },
      orderBy: { created_at: "desc" },
    });
  },

  getAllTransactions: async ({
    page = 1,
    status = "",
    method = "",
    order_id = "",
  } = {}) => {
    const limit = 10;
    const skip = (Math.max(1, Number(page)) - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;
    if (order_id) where.order_id = Number(order_id);

    const [items, total] = await Promise.all([
      prisma.PaymentTransactions.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          Orders: {
            select: { id: true, final_amount: true, user_email: true },
          },
        },
      }),
      prisma.PaymentTransactions.count({ where }),
    ]);
    return {
      items,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        itemsPerPage: limit,
      },
    };
  },

  updateTransactionStatus: async (transactionId, newStatus) => {
    return prisma.PaymentTransactions.update({
      where: { id: Number(transactionId) },
      data: {
        status: newStatus,
        paid_at: newStatus === "Paid" ? new Date() : undefined,
      },
    });
  },

  confirmTransaction: async (transactionId, { note } = {}) => {
    const tx = await paymentService.getTransactionById(transactionId);
    if (tx.status !== "Pending") {
      const err = new Error("Giao dịch không ở trạng thái chờ thanh toán.");
      err.code = "INVALID_STATE";
      throw err;
    }
    await paymentService.updateTransactionStatus(tx.id, "Paid");
    await prisma.Orders.update({
      where: { id: tx.order_id },
      data: { payment_status: "Paid" },
    });
    return paymentService.getTransactionById(tx.id);
  },

  markCodPaid: async (orderId) => {
    const pendingTx = await prisma.PaymentTransactions.findFirst({
      where: { order_id: Number(orderId), method: "COD", status: "Pending" },
    });
    if (!pendingTx) return null;
    await paymentService.updateTransactionStatus(pendingTx.id, "Paid");
    await prisma.Orders.update({
      where: { id: Number(orderId) },
      data: { payment_status: "Paid" },
    });
    return paymentService.getTransactionById(pendingTx.id);
  },

  cancelTransaction: async (transactionId) => {
    const tx = await paymentService.getTransactionById(transactionId);
    if (tx.status === "Paid") {
      const err = new Error("Không thể hủy giao dịch đã thanh toán.");
      err.code = "INVALID_STATE";
      throw err;
    }
    await paymentService.updateTransactionStatus(tx.id, "Failed");
    return paymentService.getTransactionById(tx.id);
  },

  refundTransaction: async (transactionId) => {
    const tx = await paymentService.getTransactionById(transactionId);
    if (tx.status !== "Paid") {
      const err = new Error("Chỉ giao dịch đã thanh toán mới hoàn tiền được.");
      err.code = "INVALID_STATE";
      throw err;
    }
    const provider = getProvider(tx.method === "COD" ? "cod" : "payos");
    await provider.refund({ transaction: tx });
    await paymentService.updateTransactionStatus(tx.id, "Refunded");
    await prisma.Orders.update({
      where: { id: tx.order_id },
      data: { payment_status: "Refunded" },
    });
    return paymentService.getTransactionById(tx.id);
  },

  uploadReceipt: async (
    transactionId,
    { transaction_code, note, fileBuffer },
  ) => {
    const tx = await paymentService.getTransactionById(transactionId);
    if (tx.method !== "BANK_TRANSFER" || tx.status !== "Pending") {
      const err = new Error(
        "Chỉ chuyển khoản thủ công đang chờ mới được nộp biên lai.",
      );
      err.code = "INVALID_STATE";
      throw err;
    }
    let receiptImageUrl = null;
    if (fileBuffer) {
      receiptImageUrl = await qrService.uploadReceiptImage(fileBuffer, tx.id);
    }
    return prisma.PaymentTransactions.update({
      where: { id: tx.id },
      data: {
        transaction_code,
        note: note || null,
        receipt_image_url: receiptImageUrl || tx.receipt_image_url,
      },
    });
  },

  handlePayosWebhook: async (webhookData) => {
    const payos = (await import("../../configs/payos.config.js")).payos;
    if (!payos) return null;

    // SDK v2.0.5: webhooks.verify() xác minh chữ ký, throw InvalidSignatureError nếu sai.
    const verified = await payos.webhooks.verify(webhookData);
    const transactionId = Number(verified.orderCode);
    const tx = await prisma.PaymentTransactions.findUnique({
      where: { id: transactionId },
    });
    if (!tx || tx.status !== "Pending") return null;

    await paymentService.updateTransactionStatus(tx.id, "Paid");
    await prisma.Orders.update({
      where: { id: tx.order_id },
      data: { payment_status: "Paid" },
    });
    return { transactionId: tx.id, orderId: tx.order_id };
  },

  getOrderPaymentStatus: async (orderId) => {
    const order = await prisma.Orders.findUnique({
      where: { id: Number(orderId) },
      select: {
        id: true,
        payment_method: true,
        payment_status: true,
        status: true,
      },
    });
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng.");
      err.code = "NOT_FOUND";
      throw err;
    }
    return order;
  },
};

export default paymentService;
```

> Lưu ý: `handlePayosWebhook` phải kiểm tra `verified` (SDK throw nếu chữ ký sai). Nếu SDK v2 không có method `verifyPaymentWebhookData`, thay bằng xác minh thủ công với `crypto.createHmac("sha256", CHECKSUM_KEY)` trên `webhookData` + so sánh với `webhookData.signature` — ghi rõ trong commit/báo cáo.

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/services/customer/payment.service.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/customer/payment.service.js
git commit -m "feat(payment): implement payment service (transactions, confirm, refund, webhook)"
```

---

## Task 8: payment.controller.js — customer

**Files:**

- Rewrite: `server/src/controllers/customer/payment.controller.js`

- [ ] **Step 1: Viết controller**

Ghi đè toàn bộ `server/src/controllers/customer/payment.controller.js`:

```js
import paymentService from "../../services/customer/payment.service.js";

const paymentController = {
  getMethods: async (req, res) => {
    return res.json({
      success: true,
      data: paymentService.getAvailableMethods(),
    });
  },

  createPayment: async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const { method, channel } = req.body;
      const result = await paymentService.createTransaction({
        orderId,
        method,
        channel,
      });
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      const status =
        { NOT_FOUND: 404, INVALID_METHOD: 400, PAYOS_NOT_CONFIGURED: 503 }[
          error.code
        ] || 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  getTransaction: async (req, res) => {
    try {
      const tx = await paymentService.getTransactionById(
        req.params.transactionId,
      );
      return res.json({ success: true, data: tx });
    } catch (error) {
      const status = error.code === "NOT_FOUND" ? 404 : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  getOrderTransactions: async (req, res) => {
    try {
      const list = await paymentService.getTransactionsByOrder(
        req.params.orderId,
      );
      return res.json({ success: true, data: list });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  getOrderPaymentStatus: async (req, res) => {
    try {
      const data = await paymentService.getOrderPaymentStatus(
        req.params.orderId,
      );
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.code === "NOT_FOUND" ? 404 : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  uploadReceipt: async (req, res) => {
    try {
      const tx = await paymentService.uploadReceipt(req.params.transactionId, {
        transaction_code: req.body.transaction_code,
        note: req.body.note,
        fileBuffer: req.file ? req.file.buffer : null,
      });
      return res.json({ success: true, data: tx });
    } catch (error) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_STATE"
            ? 409
            : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  handlePayosWebhook: async (req, res) => {
    try {
      const result = await paymentService.handlePayosWebhook(req.body);
      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("Lỗi xử lý webhook PayOS:", error.message);
      return res
        .status(400)
        .json({
          success: false,
          message: error.message || "Webhook không hợp lệ.",
        });
    }
  },
};

export default paymentController;
```

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/controllers/customer/payment.controller.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/controllers/customer/payment.controller.js
git commit -m "feat(payment): add customer payment controller"
```

---

## Task 9: customer payment.route.js

**Files:**

- Rewrite: `server/src/routes/customer/payment.route.js`

- [ ] **Step 1: Viết route**

Ghi đè toàn bộ `server/src/routes/customer/payment.route.js`:

```js
import express from "express";
import multer from "multer";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import paymentSchema from "../../validators/customer/payment.validator.js";
import paymentController from "../../controllers/customer/payment.controller.js";

const paymentRoute = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

paymentRoute.get("/methods", paymentController.getMethods);
paymentRoute.get(
  "/orders/:orderId/transactions",
  verifyToken,
  paymentController.getOrderTransactions,
);
paymentRoute.get(
  "/orders/:orderId/status",
  verifyToken,
  paymentController.getOrderPaymentStatus,
);
paymentRoute.get(
  "/transactions/:transactionId",
  verifyToken,
  paymentController.getTransaction,
);
paymentRoute.post(
  "/orders/:orderId",
  verifyToken,
  validate(paymentSchema.createPayment),
  paymentController.createPayment,
);
paymentRoute.post(
  "/transactions/:transactionId/receipt",
  verifyToken,
  upload.single("receipt_image"),
  validate(paymentSchema.uploadReceipt),
  paymentController.uploadReceipt,
);
paymentRoute.post(
  "/webhook/payos",
  express.json({ type: "application/json" }),
  paymentController.handlePayosWebhook,
);

export default paymentRoute;
```

> Lưu ý: thứ tự route — `/webhook/payos` public (không verifyToken). Các route khác yêu cầu đăng nhập.

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/routes/customer/payment.route.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/customer/payment.route.js
git commit -m "feat(payment): add customer payment routes"
```

---

## Task 10: management payment controller + route + permission seed

**Files:**

- Create: `server/src/controllers/management/payment.controller.js`
- Create: `server/src/routes/management/payment.route.js`
- Modify: `server/prisma/data/permissions.js`

- [ ] **Step 1: Tạo management controller**

Tạo `server/src/controllers/management/payment.controller.js`:

```js
import paymentService from "../../services/customer/payment.service.js";

const paymentController = {
  getAllTransactions: async (req, res) => {
    try {
      const result = await paymentService.getAllTransactions({
        page: req.query.page,
        status: req.query.status,
        method: req.query.method,
        order_id: req.query.order_id,
      });
      return res.json({ success: true, data: result });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  getTransaction: async (req, res) => {
    try {
      const tx = await paymentService.getTransactionById(
        req.params.transactionId,
      );
      return res.json({ success: true, data: tx });
    } catch (error) {
      const status = error.code === "NOT_FOUND" ? 404 : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  confirmTransaction: async (req, res) => {
    try {
      const tx = await paymentService.confirmTransaction(
        req.params.transactionId,
        { note: req.body?.note },
      );
      return res.json({
        success: true,
        message: "Xác nhận thanh toán thành công.",
        data: tx,
      });
    } catch (error) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_STATE"
            ? 409
            : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  cancelTransaction: async (req, res) => {
    try {
      const tx = await paymentService.cancelTransaction(
        req.params.transactionId,
      );
      return res.json({
        success: true,
        message: "Hủy giao dịch thành công.",
        data: tx,
      });
    } catch (error) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_STATE"
            ? 409
            : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },

  refundTransaction: async (req, res) => {
    try {
      const tx = await paymentService.refundTransaction(
        req.params.transactionId,
      );
      return res.json({
        success: true,
        message: "Hoàn tiền thành công.",
        data: tx,
      });
    } catch (error) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "INVALID_STATE"
            ? 409
            : error.code === "PAYOS_NOT_CONFIGURED"
              ? 503
              : 500;
      return res
        .status(status)
        .json({
          success: false,
          message: error.message || "Lỗi server nội bộ.",
        });
    }
  },
};

export default paymentController;
```

- [ ] **Step 2: Tạo management route**

Tạo `server/src/routes/management/payment.route.js`:

```js
import express from "express";
import {
  verifyToken,
  checkPermission,
} from "../../middlewares/verifyToken.middlware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import paymentSchema from "../../validators/customer/payment.validator.js";
import paymentController from "../../controllers/management/payment.controller.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { createDetails } from "../../middlewares/log.helpers.js";
import paymentService from "../../services/customer/payment.service.js";

const paymentRoute = express.Router();

paymentRoute
  .post(
    "/transactions/:transactionId/confirm",
    verifyToken,
    checkPermission("xem-don-hang"),
    validate(paymentSchema.adminConfirm),
    logAction({
      actionType: "UPDATE",
      entityType: "PaymentTransactions",
      getEntityId: (_, body) => body.data?.id,
      getChanges: createDetails,
    }),
    paymentController.confirmTransaction,
  )
  .post(
    "/transactions/:transactionId/refund",
    verifyToken,
    checkPermission("xem-don-hang"),
    validate(paymentSchema.adminRefund),
    paymentController.refundTransaction,
  )
  .post(
    "/transactions/:transactionId/cancel",
    verifyToken,
    checkPermission("xem-don-hang"),
    paymentController.cancelTransaction,
  )
  .get(
    "/transactions/:transactionId",
    verifyToken,
    checkPermission("xem-don-hang"),
    paymentController.getTransaction,
  )
  .get(
    "/transactions",
    verifyToken,
    checkPermission("xem-don-hang"),
    paymentController.getAllTransactions,
  );

export default paymentRoute;
```

> Lưu ý: `logAction.getEntityId` đọc `body.data?.id` — với transaction, id nằm trong `req.params` nên không lấy được qua body. Nếu cần, bỏ `logAction` cho các route này hoặc điều chỉnh `getEntityId` nhận `req`. Ghi rõ trong báo cáo.

- [ ] **Step 3: Thêm permissions**

Trong `server/prisma/data/permissions.js`, thêm sau `orderPermissions` (dòng ~90):

```js
export const paymentPermissions = [
  {
    slug: "xem-giao-dich",
    name: "Xem giao dịch thanh toán",
    module: "payments",
    action: "xem",
  },
  {
    slug: "xac-nhan-giao-dich",
    name: "Xác nhận giao dịch",
    module: "payments",
    action: "xac-nhan",
  },
  {
    slug: "hoan-tien",
    name: "Hoàn tiền giao dịch",
    module: "payments",
    action: "hoan-tien",
  },
];
```

Và thêm vào `allPermissions` (sau `...reviewPermissions`):

```js
  ...paymentPermissions,
```

- [ ] **Step 4: Seed permissions**

Run (trong `server/`):

```bash
npm run seed:permissions
```

Expected: `✅ Đã tạo N permissions.`

- [ ] **Step 5: Kiểm tra syntax**

Run:

```bash
node --check src/controllers/management/payment.controller.js; node --check src/routes/management/payment.route.js
```

Expected: không có output.

- [ ] **Step 6: Commit**

```bash
git add server/src/controllers/management/payment.controller.js server/src/routes/management/payment.route.js server/prisma/data/permissions.js
git commit -m "feat(payment): add management payment routes and permissions"
```

---

## Task 11: Mount management route

**Files:**

- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Import route**

Thêm vào đầu file `server/src/routes/index.route.js`:

```js
import managementPaymentRoute from "./management/payment.route.js";
```

- [ ] **Step 2: Mount route**

Trong `Routes(app)`, sau dòng `app.use(...management/product-attribute-key/)` (dòng 45) thêm:

```js
app.use(`${api_prefix_v1}management/payment/`, managementPaymentRoute);
```

- [ ] **Step 3: Kiểm tra syntax**

Run:

```bash
node --check src/routes/index.route.js
```

Expected: không có output.

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/index.route.js
git commit -m "feat(payment): mount management payment routes"
```

---

## Task 12: Nối COD — order.service đánh dấu Paid khi Delivered

**Files:**

- Modify: `server/src/services/customer/order.service.js`

- [ ] **Step 1: Thêm gọi markCodPaid**

Trong `updateOrder` của `server/src/services/customer/order.service.js`, thêm import ở đầu file:

```js
import paymentService from "./payment.service.js";
```

Sau khi `prisma.orders.update(...)` hoàn tất (trong `updateOrder`), thêm đoạn:

```js
if (dataUpdate.status === "Delivered") {
  try {
    await paymentService.markCodPaid(orderId);
  } catch (err) {
    console.error("[PAYMENT] Không đánh dấu COD Paid:", err.message);
  }
}
```

> Lưu ý: đặt đoạn này **trước** `return` của `updateOrder`, sau lệnh `return await prisma.orders.update(...)`. Do lệnh hiện tại là `return await`, cần tách ra: gán kết quả vào biến, chạy `markCodPaid`, rồi `return` biến đó. Ghi rõ khi implement.

- [ ] **Step 2: Kiểm tra syntax**

Run:

```bash
node --check src/services/customer/order.service.js
```

Expected: không có output.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/customer/order.service.js
git commit -m "feat(payment): mark COD paid when order delivered"
```

---

## Task 13: Frontend — paymentApi

**Files:**

- Create: `client/src/api/customer/paymentApi.js`

- [ ] **Step 1: Tạo API client**

Tạo `client/src/api/customer/paymentApi.js`:

```js
import axiosClient from "@/lib/axiosClient";

const paymentApi = {
  getMethods: () => {
    const url = "/customer/payment/methods";
    return axiosClient.get(url);
  },

  createPayment: (orderId, data) => {
    const url = `/customer/payment/orders/${orderId}`;
    return axiosClient.post(url, data);
  },

  getOrderTransactions: (orderId) => {
    const url = `/customer/payment/orders/${orderId}/transactions`;
    return axiosClient.get(url);
  },

  getOrderStatus: (orderId) => {
    const url = `/customer/payment/orders/${orderId}/status`;
    return axiosClient.get(url);
  },

  getTransaction: (transactionId) => {
    const url = `/customer/payment/transactions/${transactionId}`;
    return axiosClient.get(url);
  },

  uploadReceipt: (transactionId, formData) => {
    const url = `/customer/payment/transactions/${transactionId}/receipt`;
    return axiosClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default paymentApi;
```

- [ ] **Step 2: Verify — build**

Run (trong `client/`):

```bash
npm run build
```

Expected: build thành công (Vite).

- [ ] **Step 3: Commit**

```bash
git add client/src/api/customer/paymentApi.js
git commit -m "feat(payment): add frontend payment API client"
```

---

## Task 14: Frontend — Checkout flow + PaymentSection + OrderSuccess

**Files:**

- Modify: `client/src/pages/Checkout/index.jsx`
- Modify: `client/src/pages/Checkout/components/PaymentSection.jsx`
- Modify: `client/src/pages/Checkout/components/OrderSuccess.jsx`

- [ ] **Step 1: Cập nhật PaymentSection**

Thay `PAYMENT_METHODS` trong `client/src/pages/Checkout/components/PaymentSection.jsx`:

```jsx
const PAYMENT_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: Building },
  { value: "MOMO", label: "Ví MoMo", icon: Smartphone },
  { value: "CREDIT_CARD", label: "Thẻ ATM / quốc tế", icon: CreditCard },
  { value: "VNPAY", label: "VNPay", icon: Wallet },
];
```

- [ ] **Step 2: Cập nhật Checkout index**

Trong `client/src/pages/Checkout/index.jsx`:

1. Thêm import:

```jsx
import paymentApi from "@/api/customer/paymentApi";
```

2. Thêm state `paymentLoading`:

```jsx
const [paymentLoading, setPaymentLoading] = useState(false);
```

3. Thay `handleConfirmOrder` bằng luồng mới (tạo order → tạo payment → redirect):

```jsx
const handleConfirmOrder = useCallback(async () => {
  setSubmitting(true);
  try {
    const res = await orderApi.create(orderPayload);
    if (!res.success) throw new Error(res.message || "Tạo đơn thất bại");
    const order = res.data;
    setOrderResult(order);

    const isOnline = ["BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY"].includes(
      paymentMethod,
    );
    if (!isOnline) {
      setShowConfirm(false);
      return;
    }

    setPaymentLoading(true);
    const payRes = await paymentApi.createPayment(order.id, {
      method: paymentMethod,
      channel: paymentMethod,
    });
    if (payRes.data?.checkoutUrl) {
      window.location.href = payRes.data.checkoutUrl;
    } else {
      setShowConfirm(false);
    }
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
    alert(msg);
  } finally {
    setSubmitting(false);
    setPaymentLoading(false);
  }
}, [orderPayload, paymentMethod]);
```

4. Truyền `paymentLoading` vào `OrderSummary` nếu nó dùng để vô hiệu hóa nút (tùy chọn).

- [ ] **Step 3: Cập nhật OrderSuccess**

Trong `client/src/pages/Checkout/components/OrderSuccess.jsx`, thêm poll trạng thái thanh toán cho đơn online:

```jsx
import { useEffect, useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import paymentApi from "@/api/customer/paymentApi";

const ONLINE_METHODS = ["BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY"];

const OrderSuccess = ({ orderId, paymentMethod }) => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!orderId || !ONLINE_METHODS.includes(paymentMethod)) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await paymentApi.getOrderStatus(orderId);
        if (!cancelled) setPaymentStatus(res.data?.payment_status || null);
        if (!cancelled && res.data?.payment_status === "Pending") {
          setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentMethod]);

  const statusLabel =
    paymentStatus === "Paid"
      ? "Thanh toán thành công"
      : paymentStatus === "Failed"
        ? "Thanh toán thất bại"
        : "Đang chờ xác nhận thanh toán...";

  return (
    <div className="flex flex-col items-center gap-3 text-center text-slate-800 dark:text-slate-100 transition-colors duration-200 py-10">
      <div
        className={`w-16 h-16 rounded-full border flex items-center justify-center ${
          paymentStatus === "Paid"
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
            : "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20"
        }`}
      >
        {paymentStatus === "Paid" ? (
          <ShoppingBag
            size={32}
            className="text-emerald-600 dark:text-emerald-400"
          />
        ) : (
          <Loader2
            size={32}
            className="text-sky-600 dark:text-sky-400 animate-spin"
          />
        )}
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Đặt hàng thành công!
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Mã đơn hàng:{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          #{orderId}
        </span>
      </p>
      {ONLINE_METHODS.includes(paymentMethod) && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {statusLabel}
        </p>
      )}
      <p className="text-slate-400 dark:text-slate-500 text-sm">
        Cảm ơn bạn đã mua hàng.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-2.5 bg-sky-600 dark:bg-sky-500 text-white rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium cursor-pointer shadow-sm mt-2"
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
};

export default OrderSuccess;
```

- [ ] **Step 4: Truyền `paymentMethod` vào OrderSuccess**

Trong `client/src/pages/Checkout/index.jsx`, đổi dòng:

```jsx
if (orderResult) {
  return <OrderSuccess orderId={orderResult.id} />;
}
```

thành:

```jsx
if (orderResult) {
  return (
    <OrderSuccess orderId={orderResult.id} paymentMethod={paymentMethod} />
  );
}
```

- [ ] **Step 5: Verify — lint + build**

Run (trong `client/`):

```bash
npm run lint
npm run build
```

Expected: lint không lỗi nghiêm trọng, build thành công.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Checkout/
git commit -m "feat(payment): wire checkout to PayOS payment flow"
```

---

## Task 15: Verify toàn bộ backend khởi động

**Files:**

- (không đổi file)

- [ ] **Step 1: Kiểm tra server khởi động**

Run (trong `server/`):

```bash
node --check src/index.js
node -e "await import('./src/routes/customer/payment.route.js').then(() => console.log('payment route OK'))"
```

Expected: `payment route OK`, không lỗi import.

- [ ] **Step 2: Chạy server dev (nếu có env)**

Run:

```bash
npm run dev
```

Expected: server khởi động, log route mount, không lỗi.

> Lưu ý gap verification: repo chưa có test suite backend (`npm test --prefix server` là placeholder). Việc verify ở mức syntax + startup + curl thủ công. Nên mô tả gap này trong báo cáo cuối.

---

## Self-Review Notes

**Spec coverage:**

- Model `PaymentTransactions` → Task 2 ✔
- PayOS config + fallback → Task 3, 5 ✔
- Provider pattern (COD, PayOS) → Task 5 ✔
- VietQR → Task 4 ✔
- Customer API (methods, create, transactions, status, receipt, webhook) → Task 8, 9 ✔
- Management API (list, confirm, refund, cancel) + permission → Task 10, 11 ✔
- COD auto-Paid khi Delivered → Task 12 ✔
- Frontend checkout + PaymentSection + OrderSuccess → Task 13, 14 ✔
- Env `.env.example` → Task 3 ✔
- Schema change báo cáo rõ → noted ✔

**Placeholders:** không có TBD/TODO trong các bước code.

**Type consistency:** tên service/controller/provider dùng nhất quán (`getProvider`, `createTransaction`, `confirmTransaction`, `handlePayosWebhook`); `isPayosConfigured` dùng ở registry + service.
