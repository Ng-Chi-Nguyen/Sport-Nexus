# System Logs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete audit log system with backend API and admin UI activity feed.

**Architecture:** Backend service/controller/route following existing patterns, plus log middleware for auto-logging CRUD. Frontend uses React Router loaders + TanStack Query with FilterPanel/Pagination components.

**Tech Stack:** Express 5, Prisma, Joi, React 19, React Router, TanStack Query, Axios, Tailwind CSS

---

### Task 1: Log Service

**Files:**
- Create: `server/src/services/management/log.service.js`

- [ ] **Step 1: Create log service**

```js
import prisma from "../../db/prisma.js";

const logService = {
  create: async ({ userId, actionType, entityType, entityId, status, details, ipAddress }) => {
    return prisma.SystemLogs.create({
      data: {
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        status,
        details: details || [],
        ip_address: ipAddress || null,
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar: true },
        },
      },
    });
  },

  getAll: async ({ page = 1, limit = 20, userId, actionType, entityType, status, from, to, ipAddress, search } = {}) => {
    const where = {};
    if (userId) where.user_id = parseInt(userId);
    if (actionType) where.action_type = actionType;
    if (entityType) where.entity_type = entityType;
    if (status) where.status = status;
    if (ipAddress) where.ip_address = { contains: ipAddress };
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.SystemLogs.findMany({
        where,
        include: {
          user: {
            select: { id: true, full_name: true, email: true, avatar: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.SystemLogs.count({ where }),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  },

  getById: async (id) => {
    return prisma.SystemLogs.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar: true },
        },
      },
    });
  },
};

export default logService;
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path server/src/services/management/log.service.js`

---

### Task 2: Log Controller

**Files:**
- Create: `server/src/controllers/management/log.controller.js`

- [ ] **Step 1: Create log controller**

```js
import logService from "../../services/management/log.service.js";

const logController = {
  getAll: async (req, res) => {
    try {
      const { page, user_id, action_type, entity_type, status, from, to, ip_address, search } = req.query;
      const result = await logService.getAll({
        page: parseInt(page || 1),
        userId: user_id,
        actionType: action_type,
        entityType: entity_type,
        status,
        from,
        to,
        ipAddress: ip_address,
        search,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách logs.",
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const log = await logService.getById(req.params.id);
      if (!log) {
        return res.status(404).json({ success: false, message: "Không tìm thấy log." });
      }
      return res.status(200).json({ success: true, data: log });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết log.",
        error: error.message,
      });
    }
  },
};

export default logController;
```

- [ ] **Step 2: Verify file created**

Run: `Test-Path server/src/controllers/management/log.controller.js`

---

### Task 3: Log Route

**Files:**
- Create: `server/src/routes/management/log.route.js`

- [ ] **Step 1: Create log route**

```js
import express from "express";
import logController from "../../controllers/management/log.controller.js";
import { verifyToken, isAdmin } from "../../middlewares/verifyToken.middlware.js";

const logRoute = express.Router();

logRoute
  .get("/", verifyToken, isAdmin, logController.getAll)
  .get("/:id", verifyToken, isAdmin, logController.getById);

export default logRoute;
```

- [ ] **Step 2: Register route in index.route.js**

Add import and use line in `server/src/routes/index.route.js`:

```js
import logRoute from "./management/log.route.js";
```

Add after the permission route line:

```js
app.use(`${api_prefix_v1}management/log/`, logRoute)
```

- [ ] **Step 3: Verify files**

---

### Task 4: Log Middleware (Auto-log CRUD)

**Files:**
- Create: `server/src/middlewares/log.middleware.js`

- [ ] **Step 1: Create log middleware**

```js
import logService from "../services/management/log.service.js";

export const logAction = ({ actionType, entityType, getEntityId, getDetails }) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      try {
        const status = res.statusCode >= 200 && res.statusCode < 300 ? "SUCCESS" : "FAILED";
        const entityId = getEntityId ? getEntityId(req, body) : req.params.id ? parseInt(req.params.id) : null;
        const details = getDetails ? getDetails(req, body) : [];
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

        await logService.create({
          userId: req.user?.id,
          actionType,
          entityType,
          entityId,
          status,
          details: status === "FAILED" ? [{ error: body?.message || "Unknown error" }] : details,
          ipAddress,
        });
      } catch (err) {
        console.error("Log middleware error:", err.message);
      }

      return originalJson(body);
    };

    next();
  };
};
```

- [ ] **Step 2: Verify file created**

---

### Task 5: Log Loader (Frontend API)

**Files:**
- Create: `client/src/loaders/management/logLoader.jsx`

- [ ] **Step 1: Create log loader**

```jsx
import axiosClient from "@/lib/axiosClient";

const LoaderLog = {
  getAllLogs: async ({ page = 1, action_type, entity_type, status, from, to, user_id } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    if (action_type) params.set("action_type", action_type);
    if (entity_type) params.set("entity_type", entity_type);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (user_id) params.set("user_id", user_id);
    try {
      const response = await axiosClient.get(`management/log?${params.toString()}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: { data: [], pagination: { totalPages: 1, currentPage: 1 } } };
      }
      throw error;
    }
  },

  getLogById: ({ params }) => {
    const { logId } = params;
    return axiosClient.get(`management/log/${logId}`);
  },
};

export default LoaderLog;
```

- [ ] **Step 2: Verify file created**

---

### Task 6: Log Admin Loader (React Router)

**Files:**
- Modify: `client/src/routes/adminLoader.jsx`

- [ ] **Step 1: Add import and loader function**

Add import:

```js
import LoaderLog from "@/loaders/management/logLoader";
```

Add export:

```js
const getSearchParam = (request, key) => new URL(request.url).searchParams.get(key) || "";

export const logsLoader = async ({ request }) => {
  return queryClient.fetchQuery({
    queryKey: ["system-logs", getPage(request), getSearchParam(request, "action_type"), getSearchParam(request, "entity_type"), getSearchParam(request, "status"), getSearchParam(request, "from"), getSearchParam(request, "to")],
    queryFn: () => LoaderLog.getAllLogs({
      page: getPage(request),
      action_type: getSearchParam(request, "action_type"),
      entity_type: getSearchParam(request, "entity_type"),
      status: getSearchParam(request, "status"),
      from: getSearchParam(request, "from"),
      to: getSearchParam(request, "to"),
    }),
  });
};
```

- [ ] **Step 2: Add loader to admin routes**

In `adminRoutes.jsx`:
```js
{ path: "logs", element: <LogPage />, loader: RouteLoaders.logsLoader },
```

---

### Task 7: Log Page Component

**Files:**
- Modify: `client/src/pages/Admin/systemlogs/index.jsx`

- [ ] **Step 1: Write the complete LogPage component**

```jsx
import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FilterPanel from "@/components/ui/FilterPanel";
import Pagination from "@/components/ui/pagination";
import { SimpleSelect } from "@/components/ui/select";
import useTableFilters from "@/hooks/useTableFilters";
import LogEntry from "./LogEntry";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Hệ thống", route: "" },
  { title: "Lịch sử hoạt động", route: "" },
];

const actionTypes = [
  { slug: "", name: "Tất cả hành động" },
  { slug: "CREATE", name: "Thêm mới" },
  { slug: "UPDATE", name: "Cập nhật" },
  { slug: "DELETE", name: "Xoá" },
  { slug: "STOCK_ADJUSTMENT", name: "Điều chỉnh tồn kho" },
];

const entityTypes = [
  { slug: "", name: "Tất cả đối tượng" },
  { slug: "Orders", name: "Đơn hàng" },
  { slug: "Products", name: "Sản phẩm" },
  { slug: "Users", name: "Người dùng" },
  { slug: "ProductVariants", name: "Biến thể" },
  { slug: "Coupons", name: "Khuyến mãi" },
  { slug: "Brands", name: "Thương hiệu" },
  { slug: "Categories", name: "Danh mục" },
  { slug: "Suppliers", name: "Nhà cung cấp" },
];

const statusOptions = [
  { slug: "", name: "Tất cả trạng thái" },
  { slug: "SUCCESS", name: "Thành công" },
  { slug: "FAILED", name: "Thất bại" },
];

const LogPage = () => {
  const responses = useLoaderData();
  const { data: logs, pagination } = responses?.data || {};
  const {
    searchParams,
    setSearchParams,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const paginationInfo = pagination || { totalPages: 1, currentPage: 1 };
  const allLogs = useMemo(() => {
    if (!logs) return [];
    return Array.isArray(logs) ? logs : Object.values(logs).flat();
  }, [logs]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchParams.get("search") || ""}
        onSearchChange={(val) => setFilter("search", val)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder="Tìm kiếm theo IP, user..."
      >
        <SimpleSelect
          value={searchParams.get("action_type") || ""}
          onChange={(val) => setFilter("action_type", val)}
          options={actionTypes}
          placeholder="Hành động"
        />
        <SimpleSelect
          value={searchParams.get("entity_type") || ""}
          onChange={(val) => setFilter("entity_type", val)}
          options={entityTypes}
          placeholder="Đối tượng"
        />
        <SimpleSelect
          value={searchParams.get("status") || ""}
          onChange={(val) => setFilter("status", val)}
          options={statusOptions}
          placeholder="Trạng thái"
        />
        <div>
          <input
            type="date"
            value={searchParams.get("from") || ""}
            onChange={(e) => setFilter("from", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-slate-800 rounded-lg text-slate-300"
          />
        </div>
        <div>
          <input
            type="date"
            value={searchParams.get("to") || ""}
            onChange={(e) => setFilter("to", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-slate-800 rounded-lg text-slate-300"
          />
        </div>
      </FilterPanel>

      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="section-title">Lịch sử hoạt động</h2>

        {allLogs.length > 0 ? (
          <div className="space-y-2 mb-6">
            {allLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 italic text-sm">
            Không có hoạt động nào.
          </div>
        )}

        <div className="mt-6 border-t border-white/5 pt-4">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LogPage;
```

Import `SimpleSelect` from `@/components/ui/select`. The component uses `slug` and `name` option keys.

- [ ] **Step 2: Verify file**

---

### Task 8: LogEntry Component

**Files:**
- Create: `client/src/pages/Admin/systemlogs/LogEntry.jsx`

- [ ] **Step 1: Create LogEntry component**

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

const actionConfig = {
  CREATE: { icon: PlusCircle, label: "đã thêm", color: "text-emerald-400" },
  UPDATE: { icon: Pencil, label: "đã cập nhật", color: "text-sky-400" },
  DELETE: { icon: Trash2, label: "đã xoá", color: "text-rose-400" },
  STOCK_ADJUSTMENT: { icon: Package, label: "đã điều chỉnh tồn kho", color: "text-amber-400" },
};

const entityLinks = {
  Orders: (id) => `/management/orders/edit/${id}`,
  Products: (id) => `/management/products/edit/${id}`,
  Users: (id) => `/management/users/edit/${id}`,
  ProductVariants: (id) => `/management/product-variants/edit/${id}`,
  Coupons: (id) => `/management/coupons/edit/${id}`,
  Brands: (id) => `/management/brands/edit/${id}`,
  Categories: (id) => `/management/categories/edit/${id}`,
  Suppliers: (id) => `/management/suppliers/edit/${id}`,
};

const entityNames = {
  Orders: "đơn hàng",
  Products: "sản phẩm",
  Users: "người dùng",
  ProductVariants: "biến thể",
  Coupons: "khuyến mãi",
  Brands: "thương hiệu",
  Categories: "danh mục",
  Suppliers: "nhà cung cấp",
  StockMovements: "phiếu kho",
  PurchaseOrders: "đơn nhập hàng",
};

const LogEntry = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const config = actionConfig[log.action_type] || { icon: Pencil, label: "đã tác động", color: "text-slate-400" };
  const ActionIcon = config.icon;
  const isDelete = log.action_type === "DELETE";
  const entityLink = isDelete ? null : entityLinks[log.entity_type]?.(log.entity_id);
  const entityName = entityNames[log.entity_type] || log.entity_type;
  const displayId = log.entity_id ? `#${log.entity_id}` : "";

  const time = new Date(log.timestamp).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
        log.status === "FAILED"
          ? "border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10"
          : "border-slate-800/50 bg-[#0D121F]/60 hover:bg-slate-800/30"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className={`shrink-0 mt-0.5 ${config.color}`}>
        <ActionIcon size={18} strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-slate-500 text-xs font-mono shrink-0">{time}</span>
          <span className="text-slate-300 font-medium truncate">
            {log.user?.full_name || log.user?.email || "Hệ thống"}
          </span>
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          <span className="text-slate-400">{entityName}</span>
          {entityLink ? (
            <Link
              to={entityLink}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-400 hover:text-sky-300 font-medium underline-offset-2 hover:underline"
            >
              {displayId}
            </Link>
          ) : (
            <span className="text-slate-400 font-medium">{displayId}</span>
          )}
          {log.status === "FAILED" && (
            <span className="inline-flex items-center gap-1 text-xs text-rose-400">
              <XCircle size={12} /> Thất bại
            </span>
          )}
          {log.status === "SUCCESS" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle size={12} /> Thành công
            </span>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pl-0 space-y-2">
            {renderDetails(log)}
            <div className="text-xs text-slate-500">
              IP: {log.ip_address || "N/A"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderDetails(log) {
  const details = log.details;

  if (!details || (Array.isArray(details) && details.length === 0)) {
    return null;
  }

  const changes = Array.isArray(details) ? details : [details];

  if (log.status === "FAILED") {
    const errorMsg = changes[0]?.error || "Lỗi không xác định";
    return (
      <div className="text-xs text-rose-300 bg-rose-500/10 rounded-lg p-3 font-mono">
        {errorMsg}
      </div>
    );
  }

  if (log.action_type === "DELETE") {
    return (
      <div className="text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3">
        <div className="font-medium text-slate-300 mb-1">Dữ liệu đã xoá:</div>
        <pre className="whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(changes[0]?.from || changes[0], null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1">
      {changes.map((change, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-400">
          <span className="text-slate-500">{change.field}:</span>
          {change.from !== undefined && (
            <span className="line-through text-rose-400/70">{String(change.from)}</span>
          )}
          {change.from !== undefined && change.to !== undefined && (
            <span className="text-slate-600">→</span>
          )}
          {change.to !== undefined && (
            <span className="text-emerald-400">{String(change.to)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default LogEntry;
```

- [ ] **Step 2: Verify file**

---

### Task 9: Verify builds

- [ ] **Step 1: Run backend syntax check**

Run: `cd server && node -e "import('./src/index.js').catch(e => console.log(e.message))"`

- [ ] **Step 2: Run frontend build**

Run: `cd client && npm run build 2>&1`

- [ ] **Step 3: Fix any errors**
