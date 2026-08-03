# Tặng Coupon & Giới Hạn Dùng/User — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép admin tặng coupon công khai có sẵn cho từng user và chặn 1 user dùng cùng 1 mã quá số lần `max_uses_per_user`, bắt buộc đăng nhập để dùng mã giảm giá.

**Architecture:** Thêm bảng trung gian `UserCoupons` (unique `(user_id, coupon_id)`, `used_count`, `is_gift`) để vừa lưu lần tặng vừa theo dõi số lần dùng theo user. Giới hạn/user được enforce atomic bằng `updateMany` có điều kiện trong transaction của `createOrder`. Check coupon chuyển sang endpoint customer có `verifyToken`. Admin tặng qua endpoint management có permission `tang-ma-giam-gia`. Client: thêm modal tặng ở trang coupon admin, section "Coupon được tặng" ở trang "Mã của tôi".

**Tech Stack:** Prisma (PostgreSQL), Express 5, JWT, React 19 + Vite, TanStack Query, i18next, axios.

**Quy ước chung:**

- Backend KHÔNG có test suite. Với mỗi thay đổi JS phía server, verify bằng `node --check <file>` (bước "Syntax check"). Kiểm tra chức năng bằng curl ở Task cuối (Task 14).
- Frontend verify bằng `npm run build --prefix client` và `npm run lint --prefix client`.
- Chạy mọi lệnh từ thư mục gốc `D:\Programming\SportNexus` trừ khi ghi rõ khác.
- Migrations chưa versioned → Task 2 dùng `prisma db push`.

---

### Task 1: Schema Prisma — `max_uses_per_user` + model `UserCoupons`

**Files:**

- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Sửa model `Coupons`**

Tìm block `model Coupons` (bắt đầu tại dòng 224) và sửa các dòng liên quan thành:

```prisma
// Coupons Done
model Coupons {
    id                Int          @id @default(autoincrement())
    code              String       @unique
    discount_value    Int
    discount_type     DiscountType @default(CASH)
    max_discount      Int
    min_order_value   Int
    start_date        DateTime
    end_date          DateTime
    usage_limit       Int
    usage_count       Int          @default(0)
    is_active         Boolean
    max_uses_per_user Int          @default(1)
    deleted_at        DateTime     @default(dbgenerated("'1000-01-01 00:00:00'"))
    Orders            Orders[]
    Users             Users[]
    UserCoupons       UserCoupons[]
    created_at        DateTime     @default(now())
    updated_at        DateTime     @updatedAt

    @@map("coupons")
}
```

- [ ] **Step 2: Thêm model `UserCoupons` ngay sau model `Coupons`**

```prisma
// UserCoupons Done
model UserCoupons {
    id         Int      @id @default(autoincrement())
    user_id    Int
    coupon_id  Int
    used_count Int      @default(0)
    is_gift    Boolean  @default(false)
    created_at DateTime @default(now())
    updated_at DateTime @updatedAt
    user       Users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
    coupon     Coupons  @relation(fields: [coupon_id], references: [id], onDelete: Cascade)

    @@unique([user_id, coupon_id])
    @@map("user_coupons")
}
```

- [ ] **Step 3: Thêm quan hệ vào model `Users`**

Trong block `model Users`, sau dòng `Coupons            Coupons[]` thêm:

```prisma
    UserCoupons        UserCoupons[]
```

- [ ] **Step 4: Format + syntax check**

Chạy trong thư mục `server`:

```
npx prisma format
```

Kỳ vọng: không lỗi, file được format lại.

- [ ] **Step 5: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "feat(coupon): add UserCoupons model and max_uses_per_user"
```

---

### Task 2: Push schema lên database

**Files:** (không đổi file nào, chỉ chạy lệnh)

- [ ] **Step 1: Push schema**

Chạy trong thư mục `server`:

```
npx prisma db push
```

Kỳ vọng: log `The database is now in sync with your schema.` Nếu thiếu `DATABASE_URL` thì export từ `.env` trước khi chạy.

- [ ] **Step 2: Sinh Prisma Client**

```
npx prisma generate
```

Kỳ vọng: log `Generated Prisma Client`.

- [ ] **Step 3: Verify model mới tồn tại trong client**

Grep file `server/node_modules/.prisma/client/index.d.ts` có chứa `userCoupons`:

```
rg -l "userCoupons" server/node_modules/.prisma/client/index.d.ts
```

Kỳ vọng: có ít nhất 1 dòng.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(coupon): push schema for UserCoupons" --allow-empty
```

Nếu không muốn empty commit thì bỏ qua bước commit này (không có file thay đổi).

---

### Task 3: Permission `tang-ma-giam-gia`

**Files:**

- Modify: `server/prisma/data/permissions.js`
- Modify: `server/src/config/rolePermissions.js`

- [ ] **Step 1: Thêm permission vào `couponPermissions`**

Tại dòng 29-34 của `server/prisma/data/permissions.js`, sửa thành:

```js
export const couponPermissions = [
  {
    slug: "them-ma-giam-gia",
    name: "Thêm mã giảm giá",
    module: "coupons",
    action: "them",
  },
  {
    slug: "sua-ma-giam-gia",
    name: "Sửa mã giảm giá",
    module: "coupons",
    action: "sua",
  },
  {
    slug: "xoa-ma-giam-gia",
    name: "Xóa mã giảm giá",
    module: "coupons",
    action: "xoa",
  },
  {
    slug: "xem-ma-giam-gia",
    name: "Xem mã giảm giá",
    module: "coupons",
    action: "xem",
  },
  {
    slug: "tang-ma-giam-gia",
    name: "Tặng mã giảm giá",
    module: "coupons",
    action: "tang",
  },
];
```

- [ ] **Step 2: Cấp permission tặng cho `sales_staff`**

Trong `server/src/config/rolePermissions.js`, sửa mảng `sales_staff` (dòng 3-8) thành:

```js
  sales_staff: [
    "them-don-hang", "sua-don-hang", "xem-don-hang",
    "them-ma-giam-gia", "sua-ma-giam-gia", "xem-ma-giam-gia", "tang-ma-giam-gia",
    "them-danh-gia", "sua-danh-gia", "xem-danh-gia",
    "xem-san-pham", "xem-bien-the-san-pham", "xem-danh-muc", "xem-thuong-hieu",
  ],
```

- [ ] **Step 3: Đồng bộ permissions vào DB**

Chạy trong thư mục `server`:

```
npm run seed:permissions
node prisma/seed-roles-permissions.js
```

(`seed:permissions` chạy `seed-permissions.js` — script đã có sẵn trong `server/package.json`. `seed-roles-permissions.js` không có npm script riêng, chạy trực tiếp bằng node để gán `tang-ma-giam-gia` cho `sales_staff`.)

Kỳ vọng: log `Đã tạo N permissions` và `sales_staff: đã gán M permissions`.

- [ ] **Step 4: Syntax check + Commit**

```
node --check prisma/data/permissions.js
node --check src/config/rolePermissions.js
```

```bash
git add server/prisma/data/permissions.js server/src/config/rolePermissions.js
git commit -m "feat(coupon): add tang-ma-giam-gia permission"
```

---

### Task 4: Validator coupon — `max_uses_per_user` + schema gift

**Files:**

- Modify: `server/src/validators/management/coupon.validator.js`

- [ ] **Step 1: Thêm `max_uses_per_user` vào `createCoupon`**

Trong object `createCoupon`, sau dòng `usage_limit` block (dòng 25-29), thêm:

```js
        max_uses_per_user: Joi.number().integer().min(1).default(1)
            .messages({
                'number.base': 'Số lần dùng tối đa/user phải là số nguyên.',
                'number.min': 'Số lần dùng tối đa/user phải ít nhất là 1.',
            }),
```

- [ ] **Step 2: Thêm `max_uses_per_user` vào `updateCoupon`**

Trong object `updateCoupon`, sau block `usage_limit` (dòng 68-71), thêm:

```js
        max_uses_per_user: Joi.number().integer().min(1).messages({
            'number.base': 'Số lần dùng tối đa/user phải là số nguyên.',
            'number.min': 'Số lần dùng tối đa/user phải ít nhất là 1.',
        }),
```

- [ ] **Step 3: Thêm schema `giftCoupon`**

Trước `export default couponSchema;`, thêm:

```js
    giftCoupon: Joi.object({
        coupon_id: Joi.number().integer().required().messages({
            'number.base': 'ID mã giảm giá không hợp lệ.',
            'any.required': 'Thiếu ID mã giảm giá.',
        }),
        user_id: Joi.number().integer().required().messages({
            'number.base': 'ID người dùng không hợp lệ.',
            'any.required': 'Thiếu ID người dùng.',
        }),
    }).unknown(false).min(2),
```

- [ ] **Step 4: Syntax check + Commit**

```
node --check server/src/validators/management/coupon.validator.js
```

```bash
git add server/src/validators/management/coupon.validator.js
git commit -m "feat(coupon): validate max_uses_per_user and gift schema"
```

---

### Task 5: Middleware `verifyTokenOptional`

**Files:**

- Modify: `server/src/middlewares/verifyToken.middlware.js`

- [ ] **Step 1: Thêm `verifyTokenOptional` cuối file**

```js
export const verifyTokenOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    const decoded = jwt.verify(token, secret);
    const user = await prisma.Users.findUnique({
      where: { id: decoded.id },
      include: {
        role: true,
        permissions: true,
      },
    });

    if (!user) {
      req.user = null;
      return next();
    }

    const userPermissionSlugs = user.permissions.map((p) => p.slug);
    req.user = {
      ...user,
      permissionSlugs: userPermissionSlugs,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Phiên đăng nhập đã hết hạn",
        code: "TOKEN_EXPIRED",
      });
    }
    req.user = null;
    next();
  }
};
```

- [ ] **Step 2: Syntax check + Commit**

```
node --check server/src/middlewares/verifyToken.middlware.js
```

```bash
git add server/src/middlewares/verifyToken.middlware.js
git commit -m "feat(auth): add verifyTokenOptional middleware"
```

---

### Task 6: Customer coupon API — `check` + `gifted`

**Files:**

- Create: `server/src/services/customer/coupon.service.js`
- Create: `server/src/controllers/customer/coupon.controller.js`
- Create: `server/src/validators/customer/coupon.validator.js`
- Create: `server/src/routes/customer/coupon.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Tạo service**

`server/src/services/customer/coupon.service.js`:

```js
import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

export const computeCouponDiscount = (coupon, amount) => {
  let discount = 0;
  if (coupon.discount_type === "CASH") {
    discount = coupon.discount_value;
  }
  if (coupon.discount_type === "PERCENTAGE") {
    discount = amount * (coupon.discount_value / 100);
    if (discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  }
  return Math.round(discount);
};

const couponCustomerService = {
  checkCoupon: async ({ userId, amount, code }) => {
    const coupon = await prisma.coupons.findFirst({
      where: { code: code, deleted_at: ACTIVE },
    });

    if (!coupon) return { message: "Mã giảm giá không tồn tại" };
    if (!coupon.is_active) return { message: "Mã giảm giá đã hết hiệu lực" };

    const now = new Date();
    if (now < coupon.start_date)
      return { message: "Mã giảm giá chưa đến thời hạn sử dụng" };
    if (now > coupon.end_date) return { message: "Mã giảm giá đã hết hạn" };
    if (coupon.usage_count >= coupon.usage_limit)
      return { message: "Mã giảm giá đã hết lượt sử dụng" };
    if (amount < coupon.min_order_value) {
      return {
        message: `Đơn hàng giá tối thiểu là ${coupon.min_order_value}đ mới có hiệu lực`,
      };
    }

    const used = await prisma.userCoupons.findUnique({
      where: { user_id_coupon_id: { user_id: userId, coupon_id: coupon.id } },
      select: { used_count: true },
    });
    const usedCount = used?.used_count ?? 0;
    if (usedCount >= coupon.max_uses_per_user) {
      return { message: "Bạn đã dùng hết số lần của mã giảm giá này" };
    }

    const discount = computeCouponDiscount(coupon, amount);
    return {
      discount,
      newAmount: amount - discount,
      remainingUses: coupon.max_uses_per_user - usedCount,
      max_uses_per_user: coupon.max_uses_per_user,
    };
  },

  getGiftedCoupons: async (userId) => {
    const list = await prisma.userCoupons.findMany({
      where: { user_id: userId, is_gift: true },
      include: { coupon: true },
      orderBy: { created_at: "desc" },
    });
    return list.map((uc) => uc.coupon);
  },
};

export default couponCustomerService;
```

- [ ] **Step 2: Tạo validator**

`server/src/validators/customer/coupon.validator.js`:

```js
import Joi from "Joi";

const couponSchema = {
  checkCoupon: Joi.object({
    amount: Joi.number().min(0).required().messages({
      "number.base": "Tổng tiền đơn hàng phải là định dạng số",
      "number.min": "Tổng tiền không được là số âm",
      "any.required": "Hệ thống cần biết tổng tiền để áp dụng mã",
    }),
    code: Joi.string().trim().uppercase().required().messages({
      "string.empty": "Mã giảm giá không được để trống",
      "any.required": "Vui lòng cung cấp mã giảm giá",
    }),
  })
    .unknown(false)
    .min(2),
};

export default couponSchema;
```

- [ ] **Step 3: Tạo controller**

`server/src/controllers/customer/coupon.controller.js`:

```js
import couponCustomerService from "../../services/customer/coupon.service.js";

const couponCustomerController = {
  checkCoupon: async (req, res) => {
    try {
      const { amount, code } = req.body;
      const result = await couponCustomerService.checkCoupon({
        userId: req.user.id,
        amount,
        code,
      });

      if (result.message) {
        return res
          .status(400)
          .json({ success: false, message: result.message });
      }

      return res.json({
        success: true,
        data: result,
        message: "Thêm mã giảm giá thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server nội bộ",
        error: error.message,
      });
    }
  },

  getGiftedCoupons: async (req, res) => {
    try {
      const coupons = await couponCustomerService.getGiftedCoupons(req.user.id);
      return res.status(200).json({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server nội bộ",
        error: error.message,
      });
    }
  },
};

export default couponCustomerController;
```

- [ ] **Step 4: Tạo route**

`server/src/routes/customer/coupon.route.js`:

```js
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import couponSchema from "../../validators/customer/coupon.validator.js";
import couponCustomerController from "../../controllers/customer/coupon.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";

const couponCustomerRoute = express.Router();

couponCustomerRoute
  .post(
    "/check",
    verifyToken,
    validate(couponSchema.checkCoupon),
    couponCustomerController.checkCoupon,
  )
  .get("/gifted", verifyToken, couponCustomerController.getGiftedCoupons);

export default couponCustomerRoute;
```

- [ ] **Step 5: Đăng ký route**

Trong `server/src/routes/index.route.js`, thêm import sau dòng `import managementPaymentRoute from "./management/payment.route.js";`:

```js
import customerCouponRoute from "./customer/coupon.route.js";
```

Và đăng ký trong khối Customer, sau dòng `app.use(\`${api_prefix_v1}customer/order/\`, orderRoute)`:

```js
app.use(`${api_prefix_v1}customer/coupon/`, customerCouponRoute);
```

- [ ] **Step 6: Syntax check + Commit**

```
node --check server/src/services/customer/coupon.service.js
node --check server/src/controllers/customer/coupon.controller.js
node --check server/src/validators/customer/coupon.validator.js
node --check server/src/routes/customer/coupon.route.js
node --check server/src/routes/index.route.js
```

```bash
git add server/src/services/customer/coupon.service.js server/src/controllers/customer/coupon.controller.js server/src/validators/customer/coupon.validator.js server/src/routes/customer/coupon.route.js server/src/routes/index.route.js
git commit -m "feat(coupon): add customer coupon check and gifted endpoints"
```

---

### Task 7: Management gift API

**Files:**

- Modify: `server/src/services/management/coupon.service.js`
- Modify: `server/src/controllers/management/coupons.controller.js`
- Modify: `server/src/routes/management/coupon.route.js`

- [ ] **Step 1: Thêm service `giftCoupon`**

Trong `server/src/services/management/coupon.service.js`, trước `checkCoupon` (dòng 111), thêm:

```js
    giftCoupon: async ({ couponId, userId }) => {
        const coupon = await prisma.coupons.findFirst({
            where: { id: couponId, deleted_at: ACTIVE }
        });
        if (!coupon) {
            const err = new Error("Không tìm thấy mã giảm giá");
            err.status = 404;
            throw err;
        }
        if (!coupon.is_active) {
            const err = new Error("Không thể tặng mã giảm giá đã hết hiệu lực");
            err.status = 400;
            throw err;
        }
        const now = new Date();
        if (now > coupon.end_date) {
            const err = new Error("Không thể tặng mã giảm giá đã hết hạn");
            err.status = 400;
            throw err;
        }

        const user = await prisma.users.findFirst({
            where: { id: userId, deleted_at: ACTIVE }
        });
        if (!user) {
            const err = new Error("Không tìm thấy người dùng");
            err.status = 404;
            throw err;
        }

        try {
            return await prisma.userCoupons.create({
                data: { user_id: userId, coupon_id: couponId, is_gift: true, used_count: 0 },
                include: {
                    user: { select: { full_name: true, email: true } },
                    coupon: true
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                const err = new Error("Coupon này đã được tặng cho user này rồi");
                err.status = 409;
                throw err;
            }
            throw error;
        }
    },
```

- [ ] **Step 2: Thêm controller `giftCoupon`**

Trong `server/src/controllers/management/coupons.controller.js`, trước `checkCoupon` (dòng 138), thêm:

```js
    giftCoupon: async (req, res) => {
        const { coupon_id, user_id } = req.body;
        try {
            const gift = await couponService.giftCoupon({ couponId: coupon_id, userId: user_id });
            return res.status(201).json({
                success: true,
                message: "Đã tặng mã giảm giá thành công",
                data: gift
            });
        } catch (error) {
            const status = error.status || 500;
            if (status === 500) {
                return res.status(500).json({
                    success: false,
                    message: "Lỗi server nội bộ",
                    error: error.message
                });
            }
            return res.status(status).json({
                success: false,
                message: error.message
            });
        }
    },
```

- [ ] **Step 3: Thêm route gift**

Trong `server/src/routes/management/coupon.route.js`, sau dòng `.post("/check/", ...)` (dòng 30), thêm:

```js
    .post("/gift", verifyToken, checkPermission("tang-ma-giam-gia"), validate(couponSchema.giftCoupon),
      logAction({ actionType: "CREATE", entityType: "UserCoupons", getChanges: createDetails }),
      couponController.giftCoupon)
```

- [ ] **Step 4: Syntax check + Commit**

```
node --check server/src/services/management/coupon.service.js
node --check server/src/controllers/management/coupons.controller.js
node --check server/src/routes/management/coupon.route.js
```

```bash
git add server/src/services/management/coupon.service.js server/src/controllers/management/coupons.controller.js server/src/routes/management/coupon.route.js
git commit -m "feat(coupon): add management gift coupon endpoint"
```

---

### Task 8: `createOrder` — server-side validation + per-user limit + tính lại discount

**Files:**

- Modify: `server/src/services/customer/order.service.js`
- Modify: `server/src/controllers/customer/order.controller.js`
- Modify: `server/src/routes/customer/order.route.js`

- [ ] **Step 1: Import `computeCouponDiscount`**

Trong `server/src/services/customer/order.service.js`, sau dòng `import paymentService from "./payment.service.js";` thêm:

```js
import { computeCouponDiscount } from "./coupon.service.js";
```

- [ ] **Step 2: Sửa `createOrder` thành nhận thêm `authUser` và validate coupon**

Thay toàn bộ hàm `createOrder` (dòng 5-114) bằng:

```js
    createOrder: async (orderData, authUser) => {
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items } = orderData;

        if (coupon_code && !authUser) {
            const err = new Error("Vui lòng đăng nhập để dùng mã giảm giá");
            err.code = 'COUPON_REQUIRES_LOGIN';
            throw err;
        }

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
            // ---- Validate coupon + tính lại discount phía server ----
            if (coupon_code) {
                const coupon = await tx.coupons.findFirst({
                    where: { code: coupon_code, deleted_at: ACTIVE }
                });
                if (!coupon) {
                    const err = new Error("Mã giảm giá không tồn tại");
                    err.code = 'COUPON_INVALID';
                    throw err;
                }
                if (!coupon.is_active) {
                    const err = new Error("Mã giảm giá đã hết hiệu lực");
                    err.code = 'COUPON_INVALID';
                    throw err;
                }
                const now = new Date();
                if (now < coupon.start_date || now > coupon.end_date) {
                    const err = new Error("Mã giảm giá không trong thời hạn sử dụng");
                    err.code = 'COUPON_INVALID';
                    throw err;
                }
                if (coupon.usage_count >= coupon.usage_limit) {
                    const err = new Error("Mã giảm giá đã hết lượt sử dụng");
                    err.code = 'COUPON_INVALID';
                    throw err;
                }
                if (Number(total_amount) < coupon.min_order_value) {
                    const err = new Error(`Đơn hàng giá tối thiểu là ${coupon.min_order_value}đ mới có hiệu lực`);
                    err.code = 'COUPON_INVALID';
                    throw err;
                }

                discount_amount = computeCouponDiscount(coupon, Number(total_amount));
                final_amount = Number(total_amount) - discount_amount;

                await tx.userCoupons.upsert({
                    where: { user_id_coupon_id: { user_id: authUser.id, coupon_id: coupon.id } },
                    create: { user_id: authUser.id, coupon_id: coupon.id, used_count: 0 },
                    update: {}
                });
                const incr = await tx.userCoupons.updateMany({
                    where: { user_id: authUser.id, coupon_id: coupon.id, used_count: { lt: coupon.max_uses_per_user } },
                    data: { used_count: { increment: 1 } }
                });
                if (incr.count === 0) {
                    const err = new Error("Bạn đã dùng hết số lần của mã giảm giá này");
                    err.code = 'COUPON_LIMIT_REACHED';
                    throw err;
                }
            }

            const orderEmail = authUser?.email || user_email || null;
            const customer = orderEmail
                ? await tx.users.findFirst({ where: { email: orderEmail }, select: { full_name: true, email: true, phone_number: true } })
                : null;

            const subtotal = Number(total_amount) + Number(discount_amount);
            const vatRate = Number(process.env.VAT_RATE) || 0.08;
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
                    user_email: orderEmail,

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
                            customer_name: customer?.full_name || orderEmail || 'Khách vãng lai',
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

- [ ] **Step 3: Sửa controller `createOrder` truyền `authUser`**

Trong `server/src/controllers/customer/order.controller.js`, sửa hàm `createOrder` (dòng 28-67) thành:

```js
    createOrder: async (req, res) => {
        let orderData = req.body;
        try {
            const authUser = req.user?.id ? { id: req.user.id, email: req.user.email } : null;
            let newOrder = await orderService.createOrder(orderData, authUser);
            let emailResult = null;

            if (newOrder.user_email) {
                try {
                    emailResult = await emailService.sendOrderConfirmationEmail(
                        newOrder.user_email,
                        newOrder.user_email || "Khách hàng",
                        newOrder,
                        newOrder.OrderItems || [],
                        PAYMENT_LABELS[orderData.payment_method] || orderData.payment_method,
                        STATUS_LABELS[newOrder.status] || newOrder.status,
                        PAYMENT_STATUS_LABELS[newOrder.payment_status] || newOrder.payment_status,
                    );
                    console.log(`Email xác nhận đã gửi đến ${newOrder.user_email}`);
                } catch (emailErr) {
                    console.error(`Gửi email thất bại:`, emailErr.message);
                }
            }

            return res.status(201).json({
                success: true,
                message: "Đơn hàng đã được tạo.",
                data: newOrder,
                email_sent: !!emailResult,
            })
        } catch (error) {
            const couponErrors = ['COUPON_REQUIRES_LOGIN', 'COUPON_INVALID', 'COUPON_LIMIT_REACHED'];
            const status = error.code === 'INSUFFICIENT_STOCK' || couponErrors.includes(error.code) ? 400 : 500;
            return res.status(status).json({
                success: false,
                message: error.message || "Lỗi server nội bộ.",
            })
        }
    },
```

- [ ] **Step 4: Thêm `verifyTokenOptional` vào route POST create**

Trong `server/src/routes/customer/order.route.js`, sửa import:

```js
import { verifyTokenOptional } from "../../middlewares/verifyToken.middlware.js";
```

Và sửa dòng `.post("/", ...)` (dòng 16) thành:

```js
    .post("/", verifyTokenOptional, validate(orderSchema.createOrder),
      logAction({ actionType: "CREATE", entityType: "Orders", getEntityId: (_, body) => body.data?.id, getChanges: createDetails }),
      orderController.createOrder)
```

- [ ] **Step 5: Syntax check + Commit**

```
node --check server/src/services/customer/order.service.js
node --check server/src/controllers/customer/order.controller.js
node --check server/src/routes/customer/order.route.js
```

```bash
git add server/src/services/customer/order.service.js server/src/controllers/customer/order.controller.js server/src/routes/customer/order.route.js
git commit -m "feat(order): enforce per-user coupon limit and server-side discount"
```

---

### Task 9: Client API layer

**Files:**

- Create: `client/src/api/customer/couponApi.jsx`
- Modify: `client/src/api/management/couponApi.jsx`
- Modify: `client/src/api/management/userApi.jsx`

- [ ] **Step 1: Tạo customer couponApi**

`client/src/api/customer/couponApi.jsx`:

```jsx
import axiosClient from "@/lib/axiosClient";

const couponApi = {
  check: (data) => {
    const url = "/customer/coupon/check";
    return axiosClient.post(url, data);
  },
  getGifted: () => {
    const url = "/customer/coupon/gifted";
    return axiosClient.get(url);
  },
};

export default couponApi;
```

- [ ] **Step 2: Thêm `gift` vào management couponApi**

Trong `client/src/api/management/couponApi.jsx`, thêm vào object `couponApi` (sau `delete`):

```jsx
  gift: (data) => {
    const url = "/management/coupon/gift";
    return axiosClient.post(url, data);
  },
```

- [ ] **Step 3: Thêm `getAll` vào userApi**

Trong `client/src/api/management/userApi.jsx`, thêm vào đầu object `userApi`:

```jsx
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `/management/user${query ? `?${query}` : ""}`;
    return axiosClient.get(url);
  },
```

- [ ] **Step 4: Lint + Commit**

```
npm run lint --prefix client
```

```bash
git add client/src/api/customer/couponApi.jsx client/src/api/management/couponApi.jsx client/src/api/management/userApi.jsx
git commit -m "feat(client): add coupon gift and customer coupon APIs"
```

---

### Task 10: Hook `useCoupon` + gate login ở checkout

**Files:**

- Modify: `client/src/hooks/useCoupon.js`
- Modify: `client/src/pages/Checkout/index.jsx`

- [ ] **Step 1: Sửa `useCoupon.js`**

Thay toàn bộ `client/src/hooks/useCoupon.js` bằng:

```js
import { useState, useCallback } from "react";
import couponApi from "@/api/customer/couponApi";

const useCoupon = () => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyCoupon = useCallback(async (amount, code) => {
    if (!code.trim()) return;

    if (!localStorage.getItem("accessToken")) {
      setCouponData(null);
      setCouponMsg({
        type: "error",
        text: "Vui lòng đăng nhập để dùng mã giảm giá",
      });
      return;
    }

    setLoading(true);
    setCouponMsg(null);

    try {
      const res = await couponApi.check({ amount, code });

      if (res.data?.discount !== undefined) {
        setCouponData(res.data);
        setCouponMsg({
          type: "success",
          text: "Áp dụng mã giảm giá thành công",
        });
      } else {
        setCouponData(null);
        setCouponMsg({
          type: "error",
          text: res.data?.message || "Mã giảm giá không hợp lệ",
        });
      }
    } catch (error) {
      setCouponData(null);
      setCouponMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          error.message ||
          "Đã có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setCouponData(null);
    setCouponMsg(null);
  }, []);

  return {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading,
    applyCoupon,
    clearCoupon,
  };
};

export default useCoupon;
```

- [ ] **Step 2: Gate submit ở Checkout nếu có coupon mà chưa đăng nhập**

Trong `client/src/pages/Checkout/index.jsx`, tìm hàm xử lý submit đơn hàng (nơi kiểm tra trước khi gọi `orderApi.create`), thêm block kiểm tra trước khi gửi:

```jsx
if (couponCode && !localStorage.getItem("accessToken")) {
  ShowToast("error", "Vui lòng đăng nhập để dùng mã giảm giá");
  return;
}
```

Nếu file Checkout chưa import `ShowToast`, thêm dòng import (kiểm tra đường dẫn đúng trong dự án):

```jsx
import ShowToast from "@/components/ui/toast";
```

- [ ] **Step 3: Build + Lint**

```
npm run build --prefix client
npm run lint --prefix client
```

Kỳ vọng: build thành công, lint không lỗi mới.

- [ ] **Step 4: Commit**

```bash
git add client/src/hooks/useCoupon.js client/src/pages/Checkout/index.jsx
git commit -m "feat(client): require login for coupon checkout"
```

---

### Task 11: Admin — nút "Tặng" + modal

**Files:**

- Create: `client/src/components/admin/GiftCouponModal.jsx`
- Modify: `client/src/pages/Admin/coupons/index.jsx`

- [ ] **Step 1: Tạo modal**

`client/src/components/admin/GiftCouponModal.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import { Search, Gift, X } from "lucide-react";
import userApi from "@/api/management/userApi";
import couponApi from "@/api/management/couponApi";
import ShowToast from "@/components/ui/toast";

const GiftCouponModal = ({ isOpen, coupon, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setUsers([]);
      setSelectedUser(null);
      return;
    }
    handleSearch("");
  }, [isOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!term.trim()) {
        setUsers([]);
        return;
      }
      setSearching(true);
      try {
        const res = await userApi.getAll({ search: term.trim() });
        setUsers(res?.data?.data || []);
      } catch {
        setUsers([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      ShowToast("error", "Vui lòng chọn user nhận");
      return;
    }
    setSubmitting(true);
    try {
      const res = await couponApi.gift({
        coupon_id: coupon.id,
        user_id: selectedUser.id,
      });
      ShowToast("success", res.message || "Đã tặng mã giảm giá thành công");
      onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
      ShowToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D121F] shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift size={16} className="text-sky-500" />
            Tặng mã giảm giá: {coupon.code}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm user theo email hoặc tên..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827]/40 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
            />
          </div>

          {searching && <p className="text-xs text-slate-400">Đang tìm...</p>}

          {!searching && searchTerm && users.length > 0 && (
            <div className="max-h-52 overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    selectedUser?.id === u.id
                      ? "bg-sky-50 dark:bg-sky-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {u.full_name}
                  </div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </button>
              ))}
            </div>
          )}

          {!searching && searchTerm && users.length === 0 && (
            <p className="text-xs text-slate-400">Không tìm thấy user</p>
          )}

          {selectedUser && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {selectedUser.full_name}
                </div>
                <div className="text-xs text-slate-500">
                  {selectedUser.email}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Đã chọn
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Đang gửi..." : "Gửi tặng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftCouponModal;
```

- [ ] **Step 2: Gắn nút "Tặng" vào bảng coupon**

Trong `client/src/pages/Admin/coupons/index.jsx`:

- Thêm import (KHÔNG dùng `BtnGift` — component này không tồn tại trong `client/src/components/ui/button.jsx`, dùng `<button>` thường):

```jsx
import GiftCouponModal from "@/components/admin/GiftCouponModal";
```

- Thêm import icon và state (icon `Gift` trong import lucide hiện có, dòng 5):

```jsx
import {
  LayoutDashboard,
  ChevronDown,
  Filter,
  RefreshCw,
  Gift,
} from "lucide-react";
```

```jsx
const [giftCoupon, setGiftCoupon] = useState(null);

const openGift = (coupon) => {
  setGiftCoupon(coupon);
};
```

- Trong ô `<td className="px-6 py-4">` của mỗi dòng (dòng 373-384), thêm nút Tặng cạnh `BtnEdit`/`BtnDelete`:

```jsx
<td className="px-6 py-4">
  <div className="flex gap-2 justify-center">
    <button
      type="button"
      onClick={() => openGift(coupon)}
      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
    >
      <Gift size={14} />
      {t("gift_btn")}
    </button>
    <BtnEdit
      route={`/management/coupons/edit/${coupon.id}`}
      name={t("edit_btn")}
    />
    <BtnDelete name={t("delete_btn")} onClick={() => openConfirm(coupon.id)} />
  </div>
</td>
```

- Trước thẻ đóng `</div>` cuối cùng (sau `<Pagination .../>` block, dòng 407-413), thêm modal:

```jsx
<GiftCouponModal
  isOpen={!!giftCoupon}
  coupon={giftCoupon}
  onClose={() => setGiftCoupon(null)}
  onSuccess={() => {
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
  }}
/>
```

- [ ] **Step 3: Build + Lint**

```
npm run build --prefix client
npm run lint --prefix client
```

Kỳ vọng: build + lint thành công.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/admin/GiftCouponModal.jsx client/src/pages/Admin/coupons/index.jsx
git commit -m "feat(admin): add gift coupon button and modal"
```

---

### Task 12: Admin — trường `max_uses_per_user` ở form coupon

**Files:**

- Modify: `client/src/pages/Admin/coupons/create.jsx`
- Modify: `client/src/pages/Admin/coupons/edit.jsx`

- [ ] **Step 1: Thêm state `maxUsesPerUser`**

Trong cả `create.jsx` và `edit.jsx`, sau dòng `const [usageLimit, setUsageLimit] = useState(1);` thêm:

```jsx
const [maxUsesPerUser, setMaxUsesPerUser] = useState(1);
```

- [ ] **Step 2: Thêm field vào payload submit**

Trong `dataToSend` của cả 2 file, thêm:

```jsx
      max_uses_per_user: Number(maxUsesPerUser) || 1,
```

- [ ] **Step 3: Thêm input vào form**

Trong cả 2 file, trong card "Điều kiện sử dụng" (`usage_conditions_title`), cạnh `FloatingInput usage_limit_input` (dòng ~183-189), thêm input thứ hai:

```jsx
<FloatingInput
  label={t("max_uses_per_user_label")}
  min={1}
  type="number"
  value={maxUsesPerUser}
  onChange={(e) => setMaxUsesPerUser(e.target.value)}
/>
```

- [ ] **Step 4: Build + Lint + Commit**

```
npm run build --prefix client
npm run lint --prefix client
```

```bash
git add client/src/pages/Admin/coupons/create.jsx client/src/pages/Admin/coupons/edit.jsx
git commit -m "feat(admin): add max_uses_per_user field to coupon form"
```

---

### Task 13: User — section "Coupon được tặng" trên trang "Mã của tôi"

**Files:**

- Modify: `client/src/pages/coupons/index.jsx`

- [ ] **Step 1: Sửa trang coupons**

Thay toàn bộ `client/src/pages/coupons/index.jsx` bằng:

```jsx
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Gift } from "lucide-react";
import webCouponApi from "@/api/web/couponApi";
import customerCouponApi from "@/api/customer/couponApi";
import { useCoupons } from "@/contexts/CouponContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import CouponCard from "@/components/ui/couponCard";

const CouponsPage = () => {
  const { savedCodes } = useCoupons();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const { data, isLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => webCouponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const { data: giftedData, isLoading: giftedLoading } = useQuery({
    queryKey: ["gifted-coupons"],
    queryFn: () => customerCouponApi.getGifted(),
    enabled: isLoggedIn,
  });

  const coupons = data?.success ? data.data.coupons : [];
  const giftedCoupons =
    isLoggedIn && giftedData?.success ? giftedData.data.coupons : [];

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Mã của tôi", route: "" },
          ]}
        />

        {giftedCoupons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Gift size={18} className="text-amber-500" />
              Coupon được tặng ({giftedCoupons.length})
            </h2>
            {giftedLoading ? (
              <div className="py-10 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {giftedCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </div>
        )}

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Mã của tôi ({savedCodes.length})
        </h1>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : savedCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
```

- [ ] **Step 2: Build + Lint + Commit**

```
npm run build --prefix client
npm run lint --prefix client
```

```bash
git add client/src/pages/coupons/index.jsx
git commit -m "feat(client): show gifted coupons section on my coupons page"
```

---

### Task 14: i18n keys (vi + en)

**Files:**

- Modify: `client/src/locales/vi/dashboard.json`
- Modify: `client/src/locales/en/dashboard.json`

- [ ] **Step 1: Thêm key vào `vi/dashboard.json`**

Trong object `"coupon"` (bắt đầu dòng 409), sau `"usage_limit_input"` thêm:

```json
    "usage_limit_input": "Giới hạn sử dụng",
    "max_uses_per_user_label": "Số lần dùng tối đa/user",
    "gift_btn": "Tặng",
    "gift_modal_title": "Tặng mã giảm giá",
    "search_user_placeholder": "Tìm user theo email hoặc tên...",
    "gift_send_btn": "Gửi tặng"
```

- [ ] **Step 2: Thêm key vào `en/dashboard.json`**

Trong object `"coupon"` tương ứng (dòng 409 vùng en), sau `"usage_limit_input"` thêm:

```json
    "usage_limit_input": "Usage Limit",
    "max_uses_per_user_label": "Max uses per user",
    "gift_btn": "Gift",
    "gift_modal_title": "Gift coupon",
    "search_user_placeholder": "Search user by email or name...",
    "gift_send_btn": "Send gift"
```

- [ ] **Step 3: Lint + Commit**

```
npm run lint --prefix client
```

```bash
git add client/src/locales/vi/dashboard.json client/src/locales/en/dashboard.json
git commit -m "feat(client): add gift coupon i18n keys"
```

---

### Task 15: Verification tổng thể

**Files:** (không sửa file)

- [ ] **Step 1: Frontend build + lint**

```
npm run build --prefix client
npm run lint --prefix client
```

Kỳ vọng: cả 2 thành công.

- [ ] **Step 2: Backend startup check**

Chạy server (dừng sau khi log khởi động xong, hoặc chạy nền):

```
npm run dev --prefix server
```

Kỳ vọng: log khởi động không lỗi import/syntax. Dừng server.

- [ ] **Step 3: Test tay bằng curl**

Với server đang chạy (lấy `VITE_API_URL`/port từ `.env`, ví dụ `http://localhost:5000`), lần lượt:

1. **Tặng coupon thành công** (admin token):

```
curl -X POST http://localhost:5000/api/v1/management/coupon/gift -H "Content-Type: application/json" -H "Authorization: Bearer <ADMIN_TOKEN>" -d "{\"coupon_id\":1,\"user_id\":3}"
```

Kỳ vọng: HTTP 201, `success: true`.

2. **Tặng trùng bị chặn**:

```
curl -X POST http://localhost:5000/api/v1/management/coupon/gift -H "Content-Type: application/json" -H "Authorization: Bearer <ADMIN_TOKEN>" -d "{\"coupon_id\":1,\"user_id\":3}"
```

Kỳ vọng: HTTP 409, message `"Coupon này đã được tặng cho user này rồi"`.

3. **Check coupon với user** (customer token):

```
curl -X POST http://localhost:5000/api/v1/customer/coupon/check -H "Content-Type: application/json" -H "Authorization: Bearer <USER_TOKEN>" -d "{\"amount\":500000,\"code\":\"<CODE>\"}"
```

Kỳ vọng: HTTP 200, `data.discount > 0`.

4. **Dùng hết lượt bị chặn**: tạo đơn có coupon 1 lần (POST `/customer/order` với `coupon_code`, có user token), lặp lại lần 2 → kỳ vọng lần 2 trả HTTP 400 message `"Bạn đã dùng hết số lần của mã giảm giá này"`.

5. **Check coupon khi chưa đăng nhập** (không header): kỳ vọng HTTP 401 `"Bạn chưa đăng nhập!"`.

- [ ] **Step 4: Commit nốt mọi thay đổi còn sót**

```bash
git status
git add -A
git commit -m "chore(coupon): finalize gift and per-user limit feature"
```

(Chỉ commit nếu còn file chưa commit.)

---

## Self-Review Checklist

- [ ] Spec mục 1a/1b/1c (schema + max_uses_per_user + UserCoupons + quan hệ) → Task 1, 2
- [ ] Spec mục 1d (permission tang-ma-giam-gia) → Task 3
- [ ] Spec mục 2a (POST /customer/coupon/check) → Task 6
- [ ] Spec mục 2b (POST /management/coupon/gift) → Task 7
- [ ] Spec mục 2c (GET /customer/coupon/gifted) → Task 6
- [ ] Spec mục 2d (createOrder enforce + discount server-side) → Task 8
- [ ] Spec mục 2e (validator max_uses_per_user + gift) → Task 4
- [ ] Spec mục 3a (admin nút Tặng + modal) → Task 11
- [ ] Spec mục 3b (form max_uses_per_user) → Task 12
- [ ] Spec mục 3c (section Coupon được tặng) → Task 13
- [ ] Spec mục 3d (useCoupon + login gate) → Task 10
- [ ] i18n → Task 14
- [ ] Verification → Task 15
