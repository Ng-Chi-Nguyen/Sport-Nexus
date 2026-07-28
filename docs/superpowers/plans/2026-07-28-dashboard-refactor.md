# Dashboard Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chia nhỏ file `Dashboard/dashboard.jsx` monolithic thành cấu trúc folder/components/section.

**Architecture:** Page `dashboard.jsx` thin — chỉ orchestrate FilterBar + TabNav + section active. Shared components trong `components/`. Mỗi section (VD: business) là 1 folder với các file presentational.

**Tech Stack:** React 19, React Router, Tailwind CSS, Lucide icons

---

### Task 1: Move dashboard.utils.js to shared utils

**Files:**
- Move: `client/src/pages/Admin/Dashboard/dashboard.utils.js` → `client/src/utils/dashboard.utils.js`
- Modify: `client/test/dashboard.utils.test.js`
- Delete: `client/src/pages/Admin/Dashboard/dashboard.utils.js`

- [ ] **Create `client/src/utils/dashboard.utils.js`** — copy nội dung từ file cũ

```js
export function buildDashboardRangeParams(searchParams, nextFrom, nextTo) {
  const next = new URLSearchParams(searchParams?.toString() || "");
  if (nextFrom) next.set("from", nextFrom);
  else next.delete("from");
  if (nextTo) next.set("to", nextTo);
  else next.delete("to");
  return next;
}

export function buildDashboardGroupParams(searchParams, groupBy) {
  const next = new URLSearchParams(searchParams?.toString() || "");
  next.set("group_by", groupBy);
  return next;
}
```

- [ ] **Update import trong `client/test/dashboard.utils.test.js`**

```js
import {
  buildDashboardGroupParams,
  buildDashboardRangeParams,
} from "../src/utils/dashboard.utils.js";
```

- [ ] **Xóa file cũ `client/src/pages/Admin/Dashboard/dashboard.utils.js`**

- [ ] **Chạy test để verify**

Run: `node --test client/test/dashboard.utils.test.js`
Expected: 2 tests pass

- [ ] **Commit**

```bash
git add client/src/utils/dashboard.utils.js client/test/dashboard.utils.test.js
git rm client/src/pages/Admin/Dashboard/dashboard.utils.js
git commit -m "refactor: move dashboard.utils to shared utils/"
```

---

### Task 2: Create shared components (Card, KpiCard, ProgressBar)

**Files:**
- Create: `client/src/pages/Admin/Dashboard/components/Card.jsx`
- Create: `client/src/pages/Admin/Dashboard/components/KpiCard.jsx`
- Create: `client/src/pages/Admin/Dashboard/components/ProgressBar.jsx`

- [ ] **Create `components/Card.jsx`** — reusable card wrapper

```jsx
export const Card = ({ title, icon, action, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-slate-900 bg-[#0D121F]/85 p-4 shadow-xl backdrop-blur-md ${className}`}
  >
    {title && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 text-sky-400">
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
```

- [ ] **Create `components/KpiCard.jsx`**

```jsx
export const KpiCard = ({ label, value, sub, icon, tone }) => (
  <div
    className={`rounded-xl border bg-gradient-to-br ${tone} to-transparent p-3 shadow-sm`}
  >
    <div className="flex items-start justify-between gap-1">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold text-slate-100">{value}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300">
        {icon}
      </div>
    </div>
  </div>
);
```

- [ ] **Create `components/ProgressBar.jsx`**

```jsx
export const ProgressBar = ({ label, count, valueText, color, percent }) => (
  <div className="space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-slate-300 font-medium">{label}</span>
      <span className="font-semibold text-slate-200">{valueText || count}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-900 border border-slate-800 p-0.5">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);
```

- [ ] **Commit**

```bash
git add client/src/pages/Admin/Dashboard/components/
git commit -m "refactor: create shared Card, KpiCard, ProgressBar components"
```

---

### Task 3: Create FilterBar component

**Files:**
- Create: `client/src/pages/Admin/Dashboard/components/FilterBar.jsx`

- [ ] **Create `components/FilterBar.jsx`**

```jsx
import { useState } from "react";
import { useSearchParams, useRevalidator } from "react-router-dom";
import { RefreshCw, BarChart3 } from "lucide-react";
import {
  buildDashboardGroupParams,
  buildDashboardRangeParams,
} from "@/utils/dashboard.utils";

const PRESETS = [
  { key: "7d", label: "7 ng\xe0y", days: 7 },
  { key: "30d", label: "30 ng\xe0y", days: 30 },
  { key: "90d", label: "90 ng\xe0y", days: 90 },
];

const formatDateInput = (date) => date.toISOString().split("T")[0];

export const FilterBar = ({ meta = {} }) => {
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePreset, setActivePreset] = useState("30d");

  const currentFrom = searchParams.get("from") || meta.from || "";
  const currentTo = searchParams.get("to") || meta.to || "";
  const currentGroupBy = searchParams.get("group_by") || meta.group_by || "day";

  const applyRange = (nextFrom, nextTo) => {
    setSearchParams(buildDashboardRangeParams(searchParams, nextFrom, nextTo));
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.key);
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (preset.days - 1));
    applyRange(formatDateInput(start), formatDateInput(end));
  };

  return (
    <section className="rounded-2xl border border-slate-900 bg-gradient-to-br from-[#0D121F] to-[#0A1020] p-4 shadow-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
          <BarChart3 size={12} /> Dashboard tổng quan
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePreset(p)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activePreset === p.key
                  ? "border-sky-400 bg-sky-500/15 text-sky-300"
                  : "border-slate-800 bg-slate-900/70 text-slate-300 hover:text-sky-300"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => revalidator.revalidate()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-sky-300"
          >
            <RefreshCw
              size={12}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />{" "}
            Tải lại
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-[11px] text-slate-400">
          <span>Từ ng\xe0y</span>
          <input
            type="date"
            value={currentFrom}
            onChange={(e) => applyRange(e.target.value, currentTo)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B1220] px-2.5 py-1.5 text-xs text-slate-100 outline-none"
          />
        </label>
        <label className="space-y-1 text-[11px] text-slate-400">
          <span>Đến ng\xe0y</span>
          <input
            type="date"
            value={currentTo}
            onChange={(e) => applyRange(currentFrom, e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B1220] px-2.5 py-1.5 text-xs text-slate-100 outline-none"
          />
        </label>
        <div className="space-y-1 text-[11px] text-slate-400 sm:col-span-2">
          <span>Nhóm dữ liệu</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B1220] p-1">
            {["day", "week", "month"].map((g) => (
              <button
                key={g}
                onClick={() =>
                  setSearchParams(buildDashboardGroupParams(searchParams, g))
                }
                className={`flex-1 rounded-md py-1 text-xs font-medium capitalize ${
                  currentGroupBy === g
                    ? "bg-sky-500/15 text-sky-300"
                    : "text-slate-400"
                }`}
              >
                {g === "day" ? "Ng\xe0y" : g === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Commit**

```bash
git add client/src/pages/Admin/Dashboard/components/FilterBar.jsx
git commit -m "refactor: extract FilterBar component"
```

---

### Task 4: Create TabNav component

**Files:**
- Create: `client/src/pages/Admin/Dashboard/components/TabNav.jsx`

- [ ] **Create `components/TabNav.jsx`**

```jsx
import { useSearchParams } from "react-router-dom";

const TABS = [
  { key: "business", label: "Tổng quan kinh doanh" },
];

export const TabNav = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("tab") || "business";

  const handleTab = (key) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", key);
    setSearchParams(next);
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-900 bg-[#0D121F]/50 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleTab(tab.key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === tab.key
              ? "bg-sky-500/15 text-sky-300 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

- [ ] **Commit**

```bash
git add client/src/pages/Admin/Dashboard/components/TabNav.jsx
git commit -m "refactor: extract TabNav component"
```

---

### Task 5: Create Business section components

**Files:**
- Create: `client/src/pages/Admin/Dashboard/business/OverviewCards.jsx`
- Create: `client/src/pages/Admin/Dashboard/business/RevenueChart.jsx`
- Create: `client/src/pages/Admin/Dashboard/business/StatusBreakdown.jsx`
- Create: `client/src/pages/Admin/Dashboard/business/PaymentBreakdown.jsx`
- Create: `client/src/pages/Admin/Dashboard/business/BusinessOverview.jsx`

- [ ] **Create `business/OverviewCards.jsx`**

```jsx
import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import {
  CircleDollarSign,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export const OverviewCards = ({ summary = {} }) => {
  const stats = [
    {
      label: "Tổng doanh thu",
      value: formatCurrency(summary.totalRevenue || 0),
      icon: <CircleDollarSign size={16} />,
      tone: "from-cyan-500/15 border-cyan-500/20",
    },
    {
      label: "Tổng đơn h\xe0ng",
      value: summary.totalOrders ?? 0,
      icon: <ShoppingCart size={16} />,
      tone: "from-violet-500/15 border-violet-500/20",
    },
    {
      label: "Gi\xe1 trị đơn TB",
      value: formatCurrency(summary.averageOrderValue || 0),
      icon: <ArrowUpRight size={16} />,
      tone: "from-emerald-500/15 border-emerald-500/20",
    },
    {
      label: "Th\xe0nh c\xf4ng",
      value: `${summary.successRate ?? 0}%`,
      icon: <TrendingUp size={16} />,
      tone: "from-lime-500/15 border-lime-500/20",
    },
    {
      label: "Hủy đơn",
      value: `${summary.cancelRate ?? 0}%`,
      icon: <AlertTriangle size={16} />,
      tone: "from-rose-500/15 border-rose-500/20",
    },
    {
      label: "Ho\xe0n tiền",
      value: `${summary.refundRate ?? 0}%`,
      icon: <Percent size={16} />,
      tone: "from-amber-500/15 border-amber-500/20",
    },
  ];

  return (
    <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((s, idx) => (
        <KpiCard key={idx} {...s} />
      ))}
    </div>
  );
};
```

- [ ] **Create `business/RevenueChart.jsx`**

```jsx
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export const RevenueChart = ({ revenueTrend = [] }) => {
  const maxTrend = Math.max(
    ...revenueTrend.map((i) => Number(i.revenue || 0)),
    1,
  );

  return (
    <Card
      title="Doanh thu theo thời gian"
      icon={<TrendingUp size={16} />}
      action={
        <span className="text-xs text-slate-500">
          {revenueTrend.length} mốc
        </span>
      }
    >
      {revenueTrend.length ? (
        <div className="flex h-[220px] items-end gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {revenueTrend.map((item) => {
            const height = Math.max(
              (Number(item.revenue || 0) / maxTrend) * 100,
              4,
            );
            const hasRev = Number(item.revenue || 0) > 0;
            return (
              <div
                key={item.period}
                className="group relative flex min-w-[28px] flex-1 flex-col items-center gap-1"
              >
                <div className="absolute -top-10 z-10 hidden rounded bg-slate-900 border border-slate-700 px-2 py-0.5 text-center shadow-lg group-hover:block whitespace-nowrap">
                  <p className="text-[9px] text-slate-400">{item.period}</p>
                  <p className="text-xs font-semibold text-sky-400">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
                <div className="flex h-[170px] w-full items-end rounded-lg border border-slate-800/80 bg-[#08101E] p-0.5">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      hasRev
                        ? "bg-gradient-to-t from-sky-500 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                        : "bg-slate-800/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">
                  {item.period.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};
```

- [ ] **Create `business/StatusBreakdown.jsx`**

```jsx
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { BarChart3 } from "lucide-react";

const STATUS_CFG = {
  Processing: { label: "Chuẩn bị h\xe0ng", color: "from-amber-500 to-yellow-400" },
  Shipping: { label: "Đang giao", color: "from-sky-500 to-blue-500" },
  Delivered: { label: "Đã giao", color: "from-emerald-500 to-teal-400" },
  Cancelled: { label: "Đã hủy", color: "from-rose-500 to-red-500" },
  Refunded: { label: "Ho\xe0n tiền", color: "from-purple-500 to-indigo-500" },
};

export const StatusBreakdown = ({ ordersByStatus = {}, totalOrders = 0 }) => {
  const rows = Object.entries(ordersByStatus);
  const maxVal = Math.max(...rows.map(([, c]) => Number(c)), 1);

  return (
    <Card
      title="Trạng th\xe1i đơn h\xe0ng"
      icon={<BarChart3 size={16} />}
      action={
        <span className="text-xs text-slate-500">{totalOrders} đơn</span>
      }
    >
      <div className="space-y-3 py-1">
        {rows.map(([st, count]) => {
          const num = Number(count || 0);
          const cfg = STATUS_CFG[st] || {
            label: st,
            color: "from-sky-500 to-blue-500",
          };
          return (
            <ProgressBar
              key={st}
              label={cfg.label}
              count={`${num} đơn`}
              color={cfg.color}
              percent={Math.max((num / maxVal) * 100, num > 0 ? 6 : 0)}
            />
          );
        })}
      </div>
    </Card>
  );
};
```

- [ ] **Create `business/PaymentBreakdown.jsx`**

```jsx
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const PAYMENT_CFG = {
  COD: "Thanh to\xe1n khi nhận h\xe0ng (COD)",
  BANK_TRANSFER: "Chuyển khoản ng\xe2n h\xe0ng",
  MOMO: "V\xed MoMo",
  VNPAY: "Cổng VNPay",
  CREDIT_CARD: "Thẻ t\xedn dụng",
};

export const PaymentBreakdown = ({ revenueByPaymentMethod = {} }) => {
  const rows = Object.entries(revenueByPaymentMethod);
  const maxVal = Math.max(...rows.map(([, v]) => Number(v)), 1);

  return (
    <Card title="Phương thức thanh to\xe1n" icon={<CreditCard size={16} />}>
      <div className="space-y-3 py-1">
        {rows.map(([method, val]) => {
          const num = Number(val || 0);
          return (
            <ProgressBar
              key={method}
              label={PAYMENT_CFG[method] || method}
              valueText={formatCurrency(num)}
              color="from-cyan-500 to-blue-500"
              percent={Math.max((num / maxVal) * 100, num > 0 ? 6 : 0)}
            />
          );
        })}
      </div>
    </Card>
  );
};
```

- [ ] **Create `business/BusinessOverview.jsx`** — composition parent

```jsx
import { OverviewCards } from "./OverviewCards";
import { RevenueChart } from "./RevenueChart";
import { StatusBreakdown } from "./StatusBreakdown";
import { PaymentBreakdown } from "./PaymentBreakdown";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { CalendarRange } from "lucide-react";
import { formatDate } from "@/utils/formatters";

export const BusinessOverview = ({ data = {} }) => {
  const {
    summary = {},
    ordersByStatus = {},
    revenueTrend = [],
    revenueByPaymentMethod = {},
    meta = {},
  } = data;

  return (
    <div className="space-y-4">
      <OverviewCards summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart revenueTrend={revenueTrend} />
        <StatusBreakdown
          ordersByStatus={ordersByStatus}
          totalOrders={summary.totalOrders || 0}
        />
        <PaymentBreakdown revenueByPaymentMethod={revenueByPaymentMethod} />
        <Card title="Bộ lọc \xe1p dụng" icon={<CalendarRange size={16} />}>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800/80 bg-[#08101E] p-3">
              <span className="text-[10px] uppercase text-slate-500 font-medium">
                Khoảng thời gian
              </span>
              <p className="mt-1 font-semibold text-slate-200">
                {meta.from ? formatDate(meta.from) : "-"} →{" "}
                {meta.to ? formatDate(meta.to) : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#08101E] p-3">
              <span className="text-[10px] uppercase text-slate-500 font-medium">
                Nhóm theo
              </span>
              <p className="mt-1 font-semibold text-slate-200 capitalize">
                {meta.group_by === "day"
                  ? "Ng\xe0y"
                  : meta.group_by === "week"
                    ? "Tuần"
                    : "Th\xe1ng"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

- [ ] **Commit**

```bash
git add client/src/pages/Admin/Dashboard/business/
git commit -m "refactor: extract BusinessOverview section components"
```

---

### Task 6: Rewrite dashboard.jsx as thin page

**Files:**
- Modify: `client/src/pages/Admin/Dashboard/dashboard.jsx`

- [ ] **Rewrite `dashboard.jsx`**

```jsx
import { useLoaderData } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FilterBar } from "./components/FilterBar";
import { TabNav } from "./components/TabNav";
import { BusinessOverview } from "./business/BusinessOverview";

const BREADCRUMBS = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản trị", route: "" },
  { title: "Dashboard tổng quan", route: "#" },
];

const SECTIONS = {
  business: BusinessOverview,
};

const Dashboard = () => {
  const loaderData = useLoaderData();
  const db = loaderData?.data?.data || loaderData?.data || {};

  const params = new URLSearchParams(window.location.search);
  const activeTab = params.get("tab") || "business";
  const SectionComponent = SECTIONS[activeTab];

  return (
    <div className="space-y-4">
      <Breadcrumbs data={BREADCRUMBS} />
      <FilterBar meta={db.meta} />
      <TabNav />
      {SectionComponent ? (
        <SectionComponent data={db} />
      ) : (
        <p className="text-center text-sm text-slate-500">Chưa có dữ liệu</p>
      )}
    </div>
  );
};

export default Dashboard;
```

- [ ] **Commit**

```bash
git add client/src/pages/Admin/Dashboard/dashboard.jsx
git commit -m "refactor: rewrite dashboard.jsx as thin orchestration page"
```

---

### Task 7: Verify build and lint

**Files:** (none)

- [ ] **Run build**

Run: `npm run build --prefix client`
Expected: Build succeeds

- [ ] **Run lint**

Run: `npm run lint --prefix client`
Expected: No errors

- [ ] **Fix any issues found**

- [ ] **Commit if fixes were needed**

```bash
git add -A
git commit -m "fix: lint and build issues after dashboard refactor"
```
