# #6 Tích điểm / Thành viên — Giai đoạn 3: Backend Admin (management)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cung cấp API admin quản lý chương trình tích điểm/thành viên: CRUD hạng (`MembershipTiers`), CRUD bảng đổi quà (`TierRewards`), cập nhật cấu hình tỷ lệ (`LoyaltySettings`), xem danh sách user (hạng/điểm/tổng chi) và lịch sử điểm.

**Architecture:** Service ở `server/src/services/management/loyalty.service.js`, controller ở `controllers/management/loyalty.controller.js`, route ở `routes/management/loyalty.route.js`, mount vào `/api/v1/management/loyalty/`. Mọi route bảo vệ `verifyToken` + `checkPermission("...")`. Pattern service/controller theo `management/coupon.service.js` & `management/coupon.route.js`. Phân trang giống admin hiện tại (`limit`, `skip`).

**Tech Stack:** Express 5, Prisma, Joi, `verifyToken` + `checkPermission`. Backend chưa có test suite — dùng `node --check` + HTTP request thủ công.

---

### Task 1: Tạo service loyalty (management)

**Files:**
- Create: `server/src/services/management/loyalty.service.js`

- [ ] **Step 1: Tạo file service**

Tạo `server/src/services/management/loyalty.service.js`:

```js
import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const safeInt = (val) => { const n = parseInt(val); return isNaN(n) ? undefined : n; };
const money = (v) => Number(v);

const loyaltyManagementService = {
  // ---------- MembershipTiers ----------
  createTier: async (data) => {
    return prisma.membershipTiers.create({
      data: {
        name: data.name,
        min_spent: data.min_spent,
        reward_rate: data.reward_rate,
        discount_percent: data.discount_percent ?? 0,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      },
    });
  },

  getAllTiers: async () => {
    return prisma.membershipTiers.findMany({
      orderBy: { sort_order: "asc" },
    });
  },

  updateTier: async (tierId, data) => {
    const id = safeInt(tierId);
    return prisma.membershipTiers.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.min_spent !== undefined && { min_spent: data.min_spent }),
        ...(data.reward_rate !== undefined && { reward_rate: data.reward_rate }),
        ...(data.discount_percent !== undefined && { discount_percent: data.discount_percent }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  },

  deleteTier: async (tierId) => {
    const id = safeInt(tierId);
    return prisma.membershipTiers.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },

  // ---------- TierRewards ----------
  createReward: async (data) => {
    return prisma.tierRewards.create({
      data: {
        tier_id: data.tier_id,
        name: data.name,
        point_cost: data.point_cost,
        coupon_code: data.coupon_code ?? null,
        is_active: data.is_active ?? true,
      },
    });
  },

  getAllRewards: async () => {
    return prisma.tierRewards.findMany({
      where: { deleted_at: ACTIVE },
      include: { tier: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });
  },

  updateReward: async (rewardId, data) => {
    const id = safeInt(rewardId);
    return prisma.tierRewards.update({
      where: { id },
      data: {
        ...(data.tier_id !== undefined && { tier_id: data.tier_id }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.point_cost !== undefined && { point_cost: data.point_cost }),
        ...(data.coupon_code !== undefined && { coupon_code: data.coupon_code }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  },

  deleteReward: async (rewardId) => {
    const id = safeInt(rewardId);
    return prisma.tierRewards.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },

  // ---------- LoyaltySettings ----------
  updateSettings: async (data) => {
    // Chỉ cập nhật key có sẵn; thêm key mới nếu chưa có
    for (const [key, value] of Object.entries(data)) {
      await prisma.loyaltySettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  getSettings: async () => {
    const rows = await prisma.loyaltySettings.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  },

  // ---------- Users & transactions ----------
  getUsers: async ({ page = 1, search = "" } = {}) => {
    const limit = 10;
    const currentPage = Math.max(1, page || 1);
    const skip = (currentPage - 1) * limit;
    const where = { deleted_at: ACTIVE };
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { full_name: { contains: search } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true, email: true, full_name: true, phone_number: true,
          points_balance: true, total_spent: true,
          tier: { select: { id: true, name: true, sort_order: true } },
          status: true,
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);
    return { users, total, page: currentPage, limit };
  },

  getUserDetail: async (userId) => {
    const id = safeInt(userId);
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true, email: true, full_name: true, phone_number: true,
        points_balance: true, total_spent: true, created_at: true,
        tier: { select: { id: true, name: true, sort_order: true } },
      },
    });
    if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
    const transactions = await prisma.pointTransactions.findMany({
      where: { user_id: id },
      orderBy: { created_at: "desc" },
      take: 100,
      select: { id: true, type: true, points: true, balance_after: true, note: true, created_at: true, order_id: true },
    });
    return { user, transactions };
  },

  adjustPoints: async (userId, points, note) => {
    const id = safeInt(userId);
    const delta = safeInt(points);
    if (!delta) throw Object.assign(new Error("Số điểm không hợp lệ"), { status: 400 });

    return prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({ where: { id }, select: { points_balance: true } });
      if (!user) throw Object.assign(new Error("Người dùng không tồn tại"), { status: 404 });
      const newBalance = user.points_balance + delta;
      if (newBalance < 0) throw Object.assign(new Error("Kết quả không thể âm"), { status: 400 });

      await tx.users.update({ where: { id }, data: { points_balance: newBalance } });
      await tx.pointTransactions.create({
        data: {
          user_id: id,
          type: "ADJUST",
          points: delta,
          balance_after: newBalance,
          note: note || "Admin điều chỉnh",
        },
      });
      return { new_balance: newBalance };
    });
  },
};

export default loyaltyManagementService;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/services/management/loyalty.service.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/management/loyalty.service.js
git commit -m "feat: loyalty management service"
```

---

### Task 2: Tạo validator loyalty (management)

**Files:**
- Create: `server/src/validators/management/loyalty.validator.js`

- [ ] **Step 1: Tạo validator**

Tạo `server/src/validators/management/loyalty.validator.js`:

```js
import Joi from "Joi";

const loyaltyManagementSchema = {
  createTier: Joi.object({
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Tên hạng không được để trống",
      "any.required": "Vui lòng nhập tên hạng",
    }),
    min_spent: Joi.number().min(0).required().messages({
      "number.base": "Ngưỡng chi phải là số",
      "any.required": "Vui lòng nhập ngưỡng chi",
    }),
    reward_rate: Joi.number().min(0).default(0),
    discount_percent: Joi.number().integer().min(0).max(100).default(0),
    sort_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
  })
    .unknown(false)
    .min(2),

  updateTier: Joi.object({
    name: Joi.string().trim().min(1).optional(),
    min_spent: Joi.number().min(0).optional(),
    reward_rate: Joi.number().min(0).optional(),
    discount_percent: Joi.number().integer().min(0).max(100).optional(),
    sort_order: Joi.number().integer().min(0).optional(),
    is_active: Joi.boolean().optional(),
  })
    .unknown(false)
    .min(1),

  createReward: Joi.object({
    tier_id: Joi.number().integer().positive().required().messages({
      "any.required": "Vui lòng chọn hạng",
    }),
    name: Joi.string().trim().min(1).required().messages({
      "string.empty": "Tên quà không được để trống",
      "any.required": "Vui lòng nhập tên quà",
    }),
    point_cost: Joi.number().integer().positive().required().messages({
      "any.required": "Vui lòng nhập số điểm",
    }),
    coupon_code: Joi.string().trim().allow("", null).optional(),
    is_active: Joi.boolean().default(true),
  })
    .unknown(false)
    .min(2),

  updateReward: Joi.object({
    tier_id: Joi.number().integer().positive().optional(),
    name: Joi.string().trim().min(1).optional(),
    point_cost: Joi.number().integer().positive().optional(),
    coupon_code: Joi.string().trim().allow("", null).optional(),
    is_active: Joi.boolean().optional(),
  })
    .unknown(false)
    .min(1),

  updateSettings: Joi.object({
    points_to_money_rate: Joi.number().integer().positive().optional(),
  })
    .unknown(false)
    .min(1),

  adjustPoints: Joi.object({
    points: Joi.number().integer().required().messages({
      "number.base": "Số điểm phải là số nguyên",
      "any.required": "Vui lòng nhập số điểm",
    }),
    note: Joi.string().trim().allow("", null).optional(),
  })
    .unknown(false)
    .min(1),
};

export default loyaltyManagementSchema;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/validators/management/loyalty.validator.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/validators/management/loyalty.validator.js
git commit -m "feat: loyalty management validators"
```

---

### Task 3: Tạo controller loyalty (management)

**Files:**
- Create: `server/src/controllers/management/loyalty.controller.js`

- [ ] **Step 1: Tạo controller**

Tạo `server/src/controllers/management/loyalty.controller.js`:

```js
import loyaltyManagementService from "../../services/management/loyalty.service.js";
import { t } from "../../locales/messages.js";

const ok = (res, req, data, message) =>
  res.json({ success: true, data, message: message ? t(req, message) : undefined });

const handleError = (res, req, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
  });
};

const loyaltyManagementController = {
  // Tiers
  createTier: async (req, res) => {
    try {
      const tier = await loyaltyManagementService.createTier(req.body);
      return ok(res, req, tier, "Tạo hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  getAllTiers: async (req, res) => {
    try {
      const tiers = await loyaltyManagementService.getAllTiers();
      return ok(res, req, { tiers });
    } catch (e) { return handleError(res, req, e); }
  },
  updateTier: async (req, res) => {
    try {
      const tier = await loyaltyManagementService.updateTier(req.params.id, req.body);
      return ok(res, req, tier, "Cập nhật hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  deleteTier: async (req, res) => {
    try {
      await loyaltyManagementService.deleteTier(req.params.id);
      return ok(res, req, null, "Xóa hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  // Rewards
  createReward: async (req, res) => {
    try {
      const reward = await loyaltyManagementService.createReward(req.body);
      return ok(res, req, reward, "Tạo quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  getAllRewards: async (req, res) => {
    try {
      const rewards = await loyaltyManagementService.getAllRewards();
      return ok(res, req, { rewards });
    } catch (e) { return handleError(res, req, e); }
  },
  updateReward: async (req, res) => {
    try {
      const reward = await loyaltyManagementService.updateReward(req.params.id, req.body);
      return ok(res, req, reward, "Cập nhật quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  deleteReward: async (req, res) => {
    try {
      await loyaltyManagementService.deleteReward(req.params.id);
      return ok(res, req, null, "Xóa quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  // Settings
  getSettings: async (req, res) => {
    try {
      const settings = await loyaltyManagementService.getSettings();
      return ok(res, req, settings);
    } catch (e) { return handleError(res, req, e); }
  },
  updateSettings: async (req, res) => {
    try {
      const settings = await loyaltyManagementService.updateSettings(req.body);
      return ok(res, req, settings, "Cập nhật cấu hình thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  // Users
  getUsers: async (req, res) => {
    try {
      const { page, search } = req.query;
      const data = await loyaltyManagementService.getUsers({ page, search });
      return ok(res, req, data);
    } catch (e) { return handleError(res, req, e); }
  },
  getUserDetail: async (req, res) => {
    try {
      const data = await loyaltyManagementService.getUserDetail(req.params.id);
      return ok(res, req, data);
    } catch (e) { return handleError(res, req, e); }
  },
  adjustPoints: async (req, res) => {
    try {
      const { points, note } = req.body;
      const data = await loyaltyManagementService.adjustPoints(req.params.id, points, note);
      return ok(res, req, data, "Điều chỉnh điểm thành công");
    } catch (e) { return handleError(res, req, e); }
  },
};

export default loyaltyManagementController;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check src/controllers/management/loyalty.controller.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/controllers/management/loyalty.controller.js
git commit -m "feat: loyalty management controller"
```

---

### Task 4: Tạo route loyalty (management) + mount

**Files:**
- Create: `server/src/routes/management/loyalty.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Tạo route**

Tạo `server/src/routes/management/loyalty.route.js`:

```js
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { checkPermission, verifyToken } from "../../middlewares/verifyToken.middlware.js";
import loyaltySchema from "../../validators/management/loyalty.validator.js";
import loyaltyController from "../../controllers/management/loyalty.controller.js";

const loyaltyRoute = express.Router();

loyaltyRoute.use(verifyToken);

// Hạng thành viên
loyaltyRoute
  .get("/tiers", checkPermission("xem-hang-thanh-vien"), loyaltyController.getAllTiers)
  .post("/tiers", checkPermission("them-hang-thanh-vien"), validate(loyaltySchema.createTier), loyaltyController.createTier)
  .put("/tiers/:id", checkPermission("sua-hang-thanh-vien"), validate(loyaltySchema.updateTier), loyaltyController.updateTier)
  .delete("/tiers/:id", checkPermission("xoa-hang-thanh-vien"), loyaltyController.deleteTier);

// Bảng đổi quà
loyaltyRoute
  .get("/rewards", checkPermission("xem-qua-doi-diem"), loyaltyController.getAllRewards)
  .post("/rewards", checkPermission("them-qua-doi-diem"), validate(loyaltySchema.createReward), loyaltyController.createReward)
  .put("/rewards/:id", checkPermission("sua-qua-doi-diem"), validate(loyaltySchema.updateReward), loyaltyController.updateReward)
  .delete("/rewards/:id", checkPermission("xoa-qua-doi-diem"), loyaltyController.deleteReward);

// Cấu hình
loyaltyRoute
  .get("/settings", checkPermission("cau-hinh-tich-diem"), loyaltyController.getSettings)
  .put("/settings", checkPermission("cau-hinh-tich-diem"), validate(loyaltySchema.updateSettings), loyaltyController.updateSettings);

// Người dùng & điểm
loyaltyRoute
  .get("/users", checkPermission("xem-hang-thanh-vien"), loyaltyController.getUsers)
  .get("/users/:id", checkPermission("xem-hang-thanh-vien"), loyaltyController.getUserDetail)
  .post("/users/:id/adjust-points", checkPermission("cau-hinh-tich-diem"), validate(loyaltySchema.adjustPoints), loyaltyController.adjustPoints);

export default loyaltyRoute;
```

- [ ] **Step 2: Mount route vào index.route.js**

Mở `server/src/routes/index.route.js`. Thêm import (sau dòng import managementShippingRoute, dòng 37):

```js
import loyaltyManagementRoute from "./management/loyalty.route.js";
```

Thêm vào khối Management (sau dòng 58 `management/shipping/`):

```js
    app.use(`${api_prefix_v1}management/loyalty/`, loyaltyManagementRoute)
```

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check src/routes/management/loyalty.route.js` và `node --check src/routes/index.route.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/management/loyalty.route.js server/src/routes/index.route.js
git commit -m "feat: mount management loyalty routes"
```

---

### Task 5: Verify API admin bằng HTTP

**Files:**
- N/A (verify)

- [ ] **Step 1: Khởi động server**

Run: `npm run dev` (trong `server/`).
Expected: server lắng nghe trên cổng 8080.

- [ ] **Step 2: Đăng nhập admin lấy token**

Đăng nhập tài khoản admin hiện có, lưu token vào `TOKEN`.

- [ ] **Step 3: Kiểm tra get all tiers**

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/management/loyalty/tiers
```

Expected: `{ success: true, data: { tiers: [...4 hạng đã seed] } }`.

- [ ] **Step 4: Kiểm tra create tier (không token)**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"Test","min_spent":0}' http://localhost:8080/api/v1/management/loyalty/tiers
```

Expected: status 401 (verifyToken chặn).

- [ ] **Step 5: Kiểm tra update settings**

```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"points_to_money_rate":1000}' http://localhost:8080/api/v1/management/loyalty/settings
```

Expected: `{ success: true, data: { points_to_money_rate: "1000" }, message: "Cập nhật cấu hình thành công" }`.

- [ ] **Step 6: Kiểm tra list users**

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/management/loyalty/users?page=1"
```

Expected: `{ success: true, data: { users: [...], total, page, limit } }`.

- [ ] **Step 7: Commit nếu có sửa phát sinh**

```bash
git add -A
git commit -m "fix: loyalty admin api adjustments"
```

---

## Self-Review

- **Spec coverage:** Giai đoạn 3 phủ mục 5.4 (management) của design doc: CRUD hạng, CRUD bảng đổi quà, cấu hình tỷ lệ, xem user/lịch sử điểm. Permission slugs khớp giai đoạn 1 (Task 2): `them/sua/xoa/xem-hang-thanh-vien`, `them/sua/xoa/xem-qua-doi-diem`, `cau-hinh-tich-diem`.
- **Placeholder scan:** Không placeholder; mọi step có code/command đầy đủ.
- **Type consistency:** Field khớp schema giai đoạn 1: `membershipTiers`, `tierRewards`, `loyaltySettings`, `pointTransactions`, `points_balance`, `total_spent`, `tier_id`, `deleted_at`, `ACTIVE`. Prisma accessor lowercase (`prisma.membershipTiers`, `prisma.tierRewards`, `prisma.loyaltySettings`, `prisma.users`, `prisma.pointTransactions`). Route dùng `checkPermission` với slug đã seed.
- **Note:** `validate` middleware chỉ validate `req.body`. Các route admin dùng params `:id` (tiers/rewards/users) nên không cần validator cho id — service tự `safeInt`.
