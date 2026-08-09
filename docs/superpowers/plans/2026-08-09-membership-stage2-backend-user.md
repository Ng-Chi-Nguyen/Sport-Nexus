# #6 Tích điểm / Thành viên — Giai đoạn 2: Backend API người dùng (web/customer)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cung cấp API cho người dùng (có tài khoản) xem hạng/điểm/tổng chi, xem bảng đổi quà, đổi quà, xem lịch sử điểm, và dùng điểm quy đổi tiền. Kèm service tích điểm khi đơn `Delivered`.

**Architecture:** Service đặt ở `server/src/services/customer/loyalty.service.js`, controller ở `controllers/customer/loyalty.controller.js`, route ở `routes/customer/loyalty.route.js` và mount vào prefix `/api/v1/customer/loyalty/`. Các route đều cần `verifyToken` (đọc `req.user.id`). Service `awardPoints` được hook vào `order.service.js` tại block `Delivered`. Dùng `prisma`, `ACTIVE`, pattern `t(req, ...)` trong controller.

**Tech Stack:** Express 5, Prisma, Joi, `verifyToken` middleware. Backend chưa có test suite — dùng `node --check` + HTTP request thủ công.

---

### Task 1: Tạo service loyalty (customer)

**Files:**
- Create: `server/src/services/customer/loyalty.service.js`

- [ ] **Step 1: Tạo file service**

Tạo `server/src/services/customer/loyalty.service.js`:

```js
import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const safeInt = (val) => { const n = parseInt(val); return isNaN(n) ? undefined : n; };

const money = (v) => Number(v);

// Xác định hạng theo total_spent: hạng cao nhất có min_spent <= total_spent
const resolveTier = (tiers, totalSpent) => {
  const active = tiers
    .filter((t) => t.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
  let current = null;
  for (const t of active) {
    if (money(t.min_spent) <= totalSpent) current = t;
  }
  return current;
};

const loyaltyService = {
  getSettings: async () => {
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  // Lấy hạng/điểm/tổng chi + tiến độ lên hạng kế tiếp
  getUserMembership: async (userId) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true, total_spent: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });

    const tiers = await prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
    const current = resolveTier(tiers, money(user.total_spent));
    const activeTiers = tiers.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
    const nextTier = current
      ? activeTiers.find((t) => t.sort_order > current.sort_order) || null
      : activeTiers[0] || null;

    let progress = 0;
    if (current && nextTier) {
      const span = money(nextTier.min_spent) - money(current.min_spent);
      if (span > 0) {
        progress = Math.min(1, Math.max(0, (money(user.total_spent) - money(current.min_spent)) / span));
      }
    }

    const settings = await loyaltyService.getSettings();
    const pointsToMoney = parseInt(settings.points_to_money_rate, 10) || 0;

    return {
      tier: current
        ? { id: current.id, name: current.name, discount_percent: current.discount_percent, sort_order: current.sort_order }
        : null,
      next_tier: nextTier
        ? { id: nextTier.id, name: nextTier.name, min_spent: money(nextTier.min_spent) }
        : null,
      points_balance: user.points_balance,
      total_spent: money(user.total_spent),
      progress,
      points_to_money_rate: pointsToMoney,
    };
  },

  // Danh sách quà đổi được theo hạng hiện tại
  getTierRewards: async (userId) => {
    const membership = await loyaltyService.getUserMembership(userId);
    if (!membership.tier) return { rewards: [] };
    const rewards = await prisma.tierRewards.findMany({
      where: { tier_id: membership.tier.id, is_active: true, deleted_at: ACTIVE },
      select: { id: true, name: true, point_cost: true, coupon_code: true },
      orderBy: { id: "asc" },
    });
    return { rewards };
  },

  // Đổi quà: trừ điểm + cấp coupon cho user
  redeemReward: async (userId, rewardId) => {
    const reward = await prisma.tierRewards.findFirst({
      where: { id: safeInt(rewardId), is_active: true, deleted_at: ACTIVE },
      include: { tier: true },
    });
    if (!reward) throw Object.assign(new Error("Quà không tồn tại"), { status: 400 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true, tier_id: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    if (user.tier_id !== reward.tier_id) {
      throw Object.assign(new Error("Hạng của bạn không đủ điều kiện đổi quà này"), { status: 400 });
    }
    if (user.points_balance < reward.point_cost) {
      throw Object.assign(new Error("Điểm không đủ để đổi quà"), { status: 400 });
    }

    return prisma.$transaction(async (tx) => {
      const locked = await tx.users.findUnique({
        where: { id: userId },
        select: { points_balance: true },
      });
      if (locked.points_balance < reward.point_cost) {
        throw Object.assign(new Error("Điểm không đủ để đổi quà"), { status: 400 });
      }

      const newBalance = locked.points_balance - reward.point_cost;
      await tx.users.update({
        where: { id: userId },
        data: { points_balance: newBalance },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: userId,
          type: "REDEEM",
          points: -reward.point_cost,
          balance_after: newBalance,
          note: `Đổi quà: ${reward.name}`,
        },
      });

      let coupon = null;
      if (reward.coupon_code) {
        coupon = await tx.coupons.findFirst({
          where: { code: reward.coupon_code, deleted_at: ACTIVE },
        });
        if (coupon) {
          await tx.userCoupons.upsert({
            where: { user_id_coupon_id: { user_id: userId, coupon_id: coupon.id } },
            create: { user_id: userId, coupon_id: coupon.id, used_count: 0, is_gift: true },
            update: {},
          });
        }
      }

      return { reward, coupon: coupon ? { code: coupon.code } : null };
    });
  },

  // Lịch sử điểm
  getTransactions: async (userId) => {
    const list = await prisma.pointTransactions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50,
      select: { id: true, type: true, points: true, balance_after: true, note: true, created_at: true },
    });
    return { transactions: list };
  },

  // Dùng điểm quy đổi tiền: trừ điểm, trả số tiền giảm
  applyPoints: async (userId, points) => {
    const pointsUsed = safeInt(points);
    if (!pointsUsed || pointsUsed <= 0) {
      throw Object.assign(new Error("Số điểm không hợp lệ"), { status: 400 });
    }

    const settings = await loyaltyService.getSettings();
    const rate = parseInt(settings.points_to_money_rate, 10) || 0;
    if (rate <= 0) throw Object.assign(new Error("Chưa cấu hình tỷ lệ quy đổi điểm"), { status: 400 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { points_balance: true },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    if (user.points_balance < pointsUsed) {
      throw Object.assign(new Error("Số điểm vượt quá điểm hiện có"), { status: 400 });
    }

    const discount = pointsUsed * rate;

    return prisma.$transaction(async (tx) => {
      const newBalance = user.points_balance - pointsUsed;
      await tx.users.update({
        where: { id: userId },
        data: { points_balance: newBalance },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: userId,
          type: "SPEND",
          points: -pointsUsed,
          balance_after: newBalance,
          note: `Quy đổi thành tiền: ${discount.toLocaleString("vi-VN")} đ`,
        },
      });
      return { discount, points_used: pointsUsed, new_balance: newBalance };
    });
  },

  // Tích điểm khi đơn Delivered (gọi từ order.service.js)
  awardPoints: async (orderId) => {
    const order = await prisma.orders.findUnique({
      where: { id: safeInt(orderId) },
      select: { id: true, usersId: true, final_amount: true },
    });
    if (!order || !order.usersId) return;

    const already = await prisma.pointTransactions.findFirst({
      where: { order_id: order.id, type: "EARN" },
    });
    if (already) return;

    const user = await prisma.users.findUnique({
      where: { id: order.usersId },
      select: { tier_id: true },
    });
    if (!user) return;

    const tiers = await prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
    const currentTier = tiers.find((t) => t.id === user.tier_id)
      || resolveTier(tiers, money(order.final_amount));

    const rate = currentTier ? money(currentTier.reward_rate) : 0;
    const points = Math.floor(money(order.final_amount) * rate);

    return prisma.$transaction(async (tx) => {
      const locked = await tx.users.findUnique({ where: { id: order.usersId }, select: { points_balance: true, total_spent: true } });
      const newBalance = locked.points_balance + points;
      const newTotal = Number(locked.total_spent) + Number(order.final_amount);

      await tx.users.update({
        where: { id: order.usersId },
        data: { points_balance: newBalance, total_spent: newTotal },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: order.usersId,
          type: "EARN",
          points,
          balance_after: newBalance,
          order_id: order.id,
          note: points > 0 ? `Tích điểm đơn hàng #${order.id}` : null,
        },
      });

      // Cập nhật hạng theo total_spent mới
      const allTiers = await tx.membershipTiers.findMany({ orderBy: { sort_order: "asc" } });
      const newTier = resolveTier(allTiers, newTotal);
      if (newTier) {
        await tx.users.update({ where: { id: order.usersId }, data: { tier_id: newTier.id } });
      }
      return { points };
    });
  },
};

export default loyaltyService;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/services/customer/loyalty.service.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/customer/loyalty.service.js
git commit -m "feat: loyalty customer service (membership, redeem, apply points, award)"
```

---

### Task 2: Hook `awardPoints` khi đơn Delivered

**Files:**
- Modify: `server/src/services/customer/order.service.js:401`

- [ ] **Step 1: Import loyaltyService**

Mở `server/src/services/customer/order.service.js`. Thêm import sau `ACTIVE` (dòng 5):

```js
import loyaltyService from "./loyalty.service.js";
```

- [ ] **Step 2: Gọi awardPoints trong block Delivered**

Trong block `if (dataUpdate.status === 'Delivered')` (dòng 401-407), thêm lời gọi sau khi `markCodPaid`:

```js
        // 4. Nếu đơn giao thành công → đánh dấu thanh toán COD là Paid
        if (dataUpdate.status === 'Delivered') {
            try {
                await paymentService.markCodPaid(Number(orderId));
            } catch (err) {
                console.error("[PAYMENT] Không đánh dấu COD Paid:", err.message);
            }
            try {
                await loyaltyService.awardPoints(Number(orderId));
            } catch (err) {
                console.error("[LOYALTY] Không tích điểm đơn:", err.message);
            }
        }
```

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check src/services/customer/order.service.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 4: Commit**

```bash
git add server/src/services/customer/order.service.js
git commit -m "feat: award loyalty points when order delivered"
```

---

### Task 3: Tạo validator loyalty (customer)

**Files:**
- Create: `server/src/validators/customer/loyalty.validator.js`

- [ ] **Step 1: Tạo validator**

Tạo `server/src/validators/customer/loyalty.validator.js`:

```js
import Joi from "Joi";

const loyaltySchema = {
  applyPoints: Joi.object({
    points: Joi.number().integer().positive().required().messages({
      "number.base": "Số điểm phải là số nguyên",
      "number.integer": "Số điểm phải là số nguyên",
      "number.positive": "Số điểm phải lớn hơn 0",
      "any.required": "Vui lòng nhập số điểm",
    }),
  })
    .unknown(false)
    .min(1),
};

export default loyaltySchema;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/validators/customer/loyalty.validator.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/validators/customer/loyalty.validator.js
git commit -m "feat: loyalty customer validators"
```

---

### Task 4: Tạo controller loyalty (customer)

**Files:**
- Create: `server/src/controllers/customer/loyalty.controller.js`

- [ ] **Step 1: Tạo controller**

Tạo `server/src/controllers/customer/loyalty.controller.js`:

```js
import loyaltyService from "../../services/customer/loyalty.service.js";
import { t } from "../../locales/messages.js";

const loyaltyCustomerController = {
  getMembership: async (req, res) => {
    try {
      const data = await loyaltyService.getUserMembership(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  getRewards: async (req, res) => {
    try {
      const data = await loyaltyService.getTierRewards(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  redeemReward: async (req, res) => {
    try {
      const { rewardId } = req.params;
      const result = await loyaltyService.redeemReward(req.user.id, rewardId);
      return res.json({
        success: true,
        data: result,
        message: t(req, "Đổi quà thành công"),
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const data = await loyaltyService.getTransactions(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  applyPoints: async (req, res) => {
    try {
      const { points } = req.body;
      const result = await loyaltyService.applyPoints(req.user.id, points);
      return res.json({
        success: true,
        data: result,
        message: t(req, "Áp dụng điểm thành công"),
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },
};

export default loyaltyCustomerController;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/controllers/customer/loyalty.controller.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/controllers/customer/loyalty.controller.js
git commit -m "feat: loyalty customer controller"
```

---

### Task 5: Tạo route loyalty (customer) + mount

**Files:**
- Create: `server/src/routes/customer/loyalty.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Tạo route**

Tạo `server/src/routes/customer/loyalty.route.js`:

```js
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken } from "../../middlewares/verifyToken.middlware.js";
import loyaltySchema from "../../validators/customer/loyalty.validator.js";
import loyaltyCustomerController from "../../controllers/customer/loyalty.controller.js";

const loyaltyCustomerRoute = express.Router();

loyaltyCustomerRoute.use(verifyToken);

loyaltyCustomerRoute
  .get("/membership", loyaltyCustomerController.getMembership)
  .get("/rewards", loyaltyCustomerController.getRewards)
  .get("/transactions", loyaltyCustomerController.getTransactions)
  .post("/rewards/:rewardId/redeem", loyaltyCustomerController.redeemReward)
  .post("/apply-points", validate(loyaltySchema.applyPoints), loyaltyCustomerController.applyPoints);

export default loyaltyCustomerRoute;
```

> Lưu ý: middleware `validate` chỉ validate `req.body` (xem `validation.middleware.js`). `rewardId` nằm trong `req.params`, nên route redeem KHÔNG dùng validator — service tự kiểm tra `safeInt(rewardId)` (đã làm trong `redeemReward`). Chỉ route `apply-points` dùng validator (validate `req.body.points`).

- [ ] **Step 2: Mount route vào index.route.js**

Mở `server/src/routes/index.route.js`. Thêm import (sau dòng import customerShippingRoute, dòng 36):

```js
import loyaltyCustomerRoute from "./customer/loyalty.route.js";
```

Thêm vào khối Customer (sau dòng 70 `customer/shipping/`):

```js
    app.use(`${api_prefix_v1}customer/loyalty/`, loyaltyCustomerRoute)
```

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check src/routes/customer/loyalty.route.js` và `node --check src/routes/index.route.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/customer/loyalty.route.js server/src/routes/index.route.js
git commit -m "feat: mount customer loyalty routes"
```

---

### Task 6: Verify API bằng HTTP

**Files:**
- N/A (verify)

- [ ] **Step 1: Khởi động server**

Run: `npm run dev` (trong `server/`) — hoặc nếu đang chạy, bỏ qua.
Expected: server lắng nghe trên cổng 8080.

- [ ] **Step 2: Đăng nhập lấy token**

Lấy token qua API đăng nhập hiện có (vd `POST /api/v1/auth/login`). Lưu token vào biến `TOKEN`.

- [ ] **Step 3: Kiểm tra membership**

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/customer/loyalty/membership
```

Expected: `{ success: true, data: { tier: {...}, next_tier: {...}, points_balance: 0, total_spent: ..., progress: ..., points_to_money_rate: 1000 } }`.

- [ ] **Step 4: Kiểm tra apply-points với điểm không đủ**

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"points":99999}' http://localhost:8080/api/v1/customer/loyalty/apply-points
```

Expected: `{ success: false, message: "Số điểm vượt quá điểm hiện có" }` (status 400).

- [ ] **Step 5: Kiểm tra endpoint không token bị chặn**

```bash
curl http://localhost:8080/api/v1/customer/loyalty/membership
```

Expected: status 401 (middleware `verifyToken` chặn).

- [ ] **Step 6: Commit nếu có sửa phát sinh**

Nếu bước 1-5 phát hiện lỗi, sửa và commit riêng:

```bash
git add -A
git commit -m "fix: loyalty api adjustments"
```

---

## Self-Review

- **Spec coverage:** Giai đoạn 2 phủ mục 5.1 (service), 5.2 (awardPoints), 5.3 (applyPoints), 5.4 (controller/route user) của design doc. `getUserMembership`, `getTierRewards`, `redeemReward`, `getTransactions`, `applyPoints`, `awardPoints` đầy đủ.
- **Placeholder scan:** Không placeholder; mọi step có code/command đầy đủ.
- **Type consistency:** Tên field khớp schema giai đoạn 1: `membershipTiers`, `loyaltySettings`, `pointTransactions`, `tierRewards`, `points_balance`, `total_spent`, `tier_id`, `deleted_at`, `ACTIVE`. Prisma accessor lowercase. Controller dùng `t(req, ...)` nhất quán với customer controller hiện có.
- **Note:** `redeemReward` truyền `rewardId` từ `req.params`; route không dùng `validate` (middleware chỉ validate body). Service tự kiểm tra `safeInt`.
