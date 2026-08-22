# Admin Review Reply — Phase 1 (Backend API) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** API quản lý review cho admin: trả lời/sửa/xóa trả lời, ẩn-hiện review, danh sách có filter; đồng thời sửa API public để lọc review ẩn và trả `reply_comment`.

**Architecture:** Module management riêng theo layering của repo (route → middleware verifyToken/checkPermission → validate Joi → controller → service → Prisma). Dùng lại cột `reply_comment` có sẵn trong model `Reviews`, không đổi schema.

**Tech Stack:** Express 5, Prisma (MySQL), Joi, JWT auth (`verifyToken` + `checkPermission`), SystemLogs qua `logAction`.

**Spec:** `docs/superpowers/specs/2026-08-22-admin-review-reply-design.md`

**Lưu ý quy trình:**
- Server chưa có test suite (theo AGENTS.md): verification bằng `node --check`, khởi động server và bộ JSON mẫu Postman ở Task 6.
- KHÔNG tự commit — chỉ commit khi người dùng yêu cầu rõ ràng.
- Phase 2 (frontend admin + public hiển thị reply) nằm ngoài kế hoạch này, làm sau khi user duyệt API.

---

### Task 1: Validator quản lý review

**Files:**
- Create: `server/src/validators/management/review.validator.js`

- [ ] **Step 1: Tạo file validator**

```js
import Joi from "Joi";

const reviewSchema = {
    // PUT /:id/reply — tạo/cập nhật nội dung trả lời
    replyReview: Joi.object({
        reply_comment: Joi.string().trim().min(1).max(1000).required()
    }).unknown(false),

    // PUT /:id/visibility — ẩn/hiện review
    visibilityReview: Joi.object({
        is_hidden: Joi.boolean().required()
    }).unknown(false)
}

export default reviewSchema;
```

Ghi chú: dùng `import Joi from "Joi"` (chữ hoa) để khớp convention sẵn có trong `server/src/validators/customer/review.validator.js`.

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check server/src/validators/management/review.validator.js`
Expected: không có output (exit code 0).

---

### Task 2: Service quản lý review

**Files:**
- Create: `server/src/services/management/review.service.js`

- [ ] **Step 1: Tạo file service**

```js
import prisma from "../../db/prisma.js";

const REVIEW_LIST_LIMIT = 10;

const buildListWhere = ({ search, product_id, rating, status, reply }) => {
    const where = {};
    if (search) where.comment = { contains: search };
    if (product_id) where.product_id = Number(product_id);
    if (rating) where.rating = Number(rating);
    if (status === "hidden") where.is_hidden = true;
    if (status === "visible") where.is_hidden = false;
    if (reply === "replied") where.reply_comment = { not: null };
    if (reply === "unreplied") where.reply_comment = null;
    return where;
};

const reviewService = {
    getAllReviews: async ({ page, search, product_id, rating, status, reply } = {}) => {
        const currentPage = Math.max(1, page || 1);
        const skip = (currentPage - 1) * REVIEW_LIST_LIMIT;
        const where = buildListWhere({ search, product_id, rating, status, reply });

        const [reviews, totalItems] = await Promise.all([
            prisma.reviews.findMany({
                where,
                include: {
                    user: { select: { id: true, full_name: true, avatar: true } },
                    product: { select: { id: true, name: true, slug: true } }
                },
                orderBy: { created_at: "desc" },
                take: REVIEW_LIST_LIMIT,
                skip
            }),
            prisma.reviews.count({ where })
        ]);

        return {
            reviews,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / REVIEW_LIST_LIMIT),
                currentPage,
                itemsPerPage: REVIEW_LIST_LIMIT
            }
        };
    },

    getReviewById: async (reviewId) => {
        return prisma.reviews.findUnique({ where: { id: Number(reviewId) } });
    },

    replyToReview: async (reviewId, replyComment) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { reply_comment: replyComment }
        });
    },

    deleteReply: async (reviewId) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { reply_comment: null }
        });
    },

    setVisibility: async (reviewId, isHidden) => {
        return prisma.reviews.update({
            where: { id: Number(reviewId) },
            data: { is_hidden: Boolean(isHidden) }
        });
    }
}

export default reviewService;
```

Ghi chú: các method `update` ném Prisma lỗi `P2025` nếu id không tồn tại — controller sẽ map sang 404 (giống pattern trong `customer/review.controller.js`).

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check server/src/services/management/review.service.js`
Expected: không có output (exit code 0).

---

### Task 3: Controller quản lý review

**Files:**
- Create: `server/src/controllers/management/review.controller.js`

- [ ] **Step 1: Tạo file controller**

```js
import reviewService from "../../services/management/review.service.js";
import { t } from "../../locales/messages.js";

const parseIdOrThrow = (rawId) => {
    const id = parseInt(rawId);
    if (!Number.isInteger(id) || id <= 0) {
        const err = new Error("ID đánh giá không hợp lệ.");
        err.code = "REVIEW_INVALID_ID";
        throw err;
    }
    return id;
};

const reviewController = {
    getAllReviews: async (req, res) => {
        const { page, search, product_id, rating, status, reply } = req.query;
        try {
            const result = await reviewService.getAllReviews({
                page, search, product_id, rating, status, reply
            });
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi tải danh sách đánh giá."),
                error: error.message
            });
        }
    },

    replyToReview: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            const updated = await reviewService.replyToReview(reviewId, req.body.reply_comment);
            return res.status(200).json({
                success: true,
                message: t(req, "Phản hồi đánh giá thành công."),
                data: updated
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi phản hồi đánh giá."),
                error: error.message
            });
        }
    },

    deleteReply: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            await reviewService.deleteReply(reviewId);
            return res.status(200).json({
                success: true,
                message: t(req, "Xóa phản hồi đánh giá thành công.")
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi xóa phản hồi đánh giá."),
                error: error.message
            });
        }
    },

    setVisibility: async (req, res) => {
        try {
            const reviewId = parseIdOrThrow(req.params.id);
            const updated = await reviewService.setVisibility(reviewId, req.body.is_hidden);
            return res.status(200).json({
                success: true,
                message: t(req, req.body.is_hidden ? "Đã ẩn đánh giá." : "Đã hiện đánh giá."),
                data: updated
            });
        } catch (error) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy đánh giá.")
                });
            }
            if (error.code === "REVIEW_INVALID_ID") {
                return res.status(400).json({
                    success: false,
                    message: t(req, error.message)
                });
            }
            return res.status(500).json({
                success: false,
                message: t(req, "Lỗi server nội bộ khi cập nhật trạng thái đánh giá."),
                error: error.message
            });
        }
    }
}

export default reviewController;
```

- [ ] **Step 2: Kiểm tra syntax**

Run: `node --check server/src/controllers/management/review.controller.js`
Expected: không có output (exit code 0).

---

### Task 4: Route + mount vào index

**Files:**
- Create: `server/src/routes/management/review.route.js`
- Modify: `server/src/routes/index.route.js` (thêm import + mount)

- [ ] **Step 1: Tạo file route**

```js
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken, checkPermission } from "../../middlewares/verifyToken.middlware.js";
import reviewSchema from "../../validators/management/review.validator.js";
import reviewController from "../../controllers/management/review.controller.js";
import reviewService from "../../services/management/review.service.js";
import { logAction } from "../../middlewares/log.middleware.js";
import { updateDetails, fetchEntity } from "../../middlewares/log.helpers.js";

const fetchOldReview = fetchEntity(
    (id) => reviewService.getReviewById(id)
);

const clearReplyChanges = () => [{ field: "reply_comment", to: null }];

const reviewRoute = express.Router();

reviewRoute
    .get("/", verifyToken, checkPermission("xem-danh-gia"),
      reviewController.getAllReviews)

    .put("/:id/reply", verifyToken, checkPermission("sua-danh-gia"),
      validate(reviewSchema.replyReview),
      logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: updateDetails }),
      reviewController.replyToReview)

    .delete("/:id/reply", verifyToken, checkPermission("sua-danh-gia"),
      logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: clearReplyChanges }),
      reviewController.deleteReply)

    .put("/:id/visibility", verifyToken, checkPermission("sua-danh-gia"),
      validate(reviewSchema.visibilityReview),
      logAction({ actionType: "UPDATE", entityType: "Reviews", getOldData: fetchOldReview, getChanges: updateDetails }),
      reviewController.setVisibility)

export default reviewRoute;
```

Ghi chú: thứ tự middleware (validate trước logAction) khớp pattern của `customer/review.route.js`; `logAction` ghi SystemLogs với old/new data qua `fetchEntity`.

- [ ] **Step 2: Mount route trong `index.route.js`**

Thêm import sau dòng `import loyaltyManagementRoute from "./management/loyalty.route.js";` (đặt cạnh import management khác, ví dụ sau dòng 38):

```js
import managementReviewRoute from "./management/review.route.js";
```

Thêm mount ngay sau dòng `app.use(`${api_prefix_v1}management/loyalty/`, loyaltyManagementRoute)`:

```js
    app.use(`${api_prefix_v1}management/review/`, managementReviewRoute)
```

Tên `managementReviewRoute` tránh trùng với `reviewRoute` (customer) đã import sẵn ở dòng 9.

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check server/src/routes/management/review.route.js` và `node --check server/src/routes/index.route.js`
Expected: cả hai không có output (exit code 0).

---

### Task 5: Sửa API public

**Files:**
- Modify: `server/src/services/core/product.service.js` (hàm `getProductBySlug`, khối `Reviews:` khoảng dòng 85–92)
- Modify: `server/src/services/customer/review.service.js` (hàm `getReviewByProductId`, khoảng dòng 142–147)

- [ ] **Step 1: Sửa include Reviews trong `getProductBySlug`**

Thay khối:

```js
                Reviews: {
                    select: {
                        id: true, rating: true, comment: true, user_id: true, created_at: true, media_urls: true,
                        user: { select: { id: true, full_name: true, avatar: true } },
                    },
                    take: 10,
                    orderBy: { created_at: "desc" },
                },
```

bằng:

```js
                Reviews: {
                    where: { is_hidden: false },
                    select: {
                        id: true, rating: true, comment: true, reply_comment: true, user_id: true, created_at: true, media_urls: true,
                        user: { select: { id: true, full_name: true, avatar: true } },
                    },
                    take: 10,
                    orderBy: { created_at: "desc" },
                },
```

- [ ] **Step 2: Sửa `getReviewByProductId` trong customer service**

Thay hàm:

```js
    getReviewByProductId: async (productId) => {
        let reviews = await prisma.reviews.findMany({
            where: { product_id: productId }
        })
        return reviews;
    },
```

bằng:

```js
    getReviewByProductId: async (productId) => {
        let reviews = await prisma.reviews.findMany({
            where: { product_id: productId, is_hidden: false },
            include: { user: { select: { id: true, full_name: true, avatar: true } } }
        })
        return reviews;
    },
```

- [ ] **Step 3: Kiểm tra syntax**

Run: `node --check server/src/services/core/product.service.js` và `node --check server/src/services/customer/review.service.js`
Expected: cả hai không có output (exit code 0).

---

### Task 6: Verification tổng thể (startup + Postman)

**Files:**
- Không tạo file mới; chỉ chạy kiểm chứng.

- [ ] **Step 1: Khởi động server**

Run: `npm run dev --prefix server`
Expected: server lên không lỗi import/module-not-found.

- [ ] **Step 2: Test Postman theo kịch bản**

Base URL: `http://localhost:<PORT>/api/v1/management/review` (PORT theo `.env`). Header chung: `Authorization: Bearer <admin_token>` từ `POST /api/v1/auth/login`.

1. `GET /?page=1&status=visible&reply=unreplied&rating=5`
   Expected 200:
```json
{
  "success": true,
  "data": {
    "reviews": [
      { "id": 1, "rating": 5, "comment": "...", "media_urls": "[...]", "reply_comment": null,
        "is_hidden": false, "created_at": "...",
        "user": { "id": 2, "full_name": "...", "avatar": null },
        "product": { "id": 10, "name": "...", "slug": "..." } }
    ],
    "pagination": { "totalItems": 0, "totalPages": 0, "currentPage": 1, "itemsPerPage": 10 }
  }
}
```
2. `PUT /<id>/reply` body `{ "reply_comment": "Cảm ơn anh đã tin tưởng cửa hàng!" }` → 200, `data.reply_comment` đúng nội dung.
3. Gọi lại bước 2 với nội dung khác → nội dung được cập nhật.
4. `DELETE /<id>/reply` → 200; `GET /?reply=replied` không còn id đó.
5. `PUT /<id>/visibility` body `{ "is_hidden": true }` → 200, `data.is_hidden = true`.
6. `GET /api/v1/home/product/slug/<slug>` (không cần token) → review vừa ẩn biến mất khỏi mảng `Reviews`; review còn lại có trường `reply_comment`.
7. Negative: token user thường → 403; `PUT /99999999/reply` → 404; body thiếu `reply_comment` → 400 với `errors[]`; `PUT /abc/reply` → 400.

- [ ] **Step 3: Báo cáo verification gap**

Nếu không chạy được DB/local env, ghi rõ gap trong báo cáo cuối (theo AGENTS.md: backend không có test suite tự động).

---

## Self-review plan

1. **Spec coverage** — Section 3 (module management: GET list/PUT reply/DELETE reply/PUT visibility + permission + logAction + Joi) → Task 1–4. Section 4 (public lọc ẩn + reply_comment + include user) → Task 5. Section 6 (Postman guide) → Task 6. Section 5 (frontend Phase 2) → cố ý ngoài phạm vi, đã ghi chú ở header.
2. **Placeholder scan** — mọi step đều có code/lệnh cụ thể, không TBD/TODO.
3. **Type consistency** — tên hàm service (`getAllReviews`, `getReviewById`, `replyToReview`, `deleteReply`, `setVisibility`) dùng thống nhất giữa Task 2/3/4; schema keys (`replyReview`, `visibilityReview`) khớp Task 1/4; response shape `{ reviews, pagination }` khớp spec mục 3.2.
