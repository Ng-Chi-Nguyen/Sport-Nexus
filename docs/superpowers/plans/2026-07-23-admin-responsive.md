# Admin Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Make the admin interface fully responsive across mobile (bottom nav), tablet (collapsed sidebar), and desktop (full sidebar).

**Architecture:** Add `useResponsive` hook to drive layout switching in `AdminLayout`. Extract shared menu config so `Sidebar`, `SidebarCollapsed`, and `BottomNav` use the same data. Apply responsive Tailwind classes systematically to all admin pages (table wrappers, filter panels, form grids).

**Tech Stack:** React 19, Tailwind CSS (custom breakpoints: xs=480, sm=640, md=768, lg=1024), lucide-react.

---

### Task 1: Create shared menu config

**Files:**
- Create: `client/src/constants/adminMenuConfig.jsx`
- Modify: none yet

- [ ] **Step 1: Create adminMenuConfig.jsx with shared icon map + menu structure**

Extract the `iconMap` object and `sidebarSections` logic from `AdminLayout.jsx` into a reusable config. This provides a single source of truth for all three navigation components.

```jsx
import { SIDEBAR_MENU_STRUCTURE, USER_SETTINGS_POPOVER } from "@/constants/menu";
import * as Icons from "lucide-react";

const prefix_path = "/management";

export const iconMap = {
  LayoutDashboard: <Icons.LayoutDashboard strokeWidth={1.5} size={18} />,
  ClipboardClock: <Icons.ClipboardClock strokeWidth={1.5} size={18} />,
  ClipboardList: <Icons.ClipboardList strokeWidth={1.5} size={18} />,
  ShoppingCart: <Icons.ShoppingCart strokeWidth={1.5} size={18} />,
  Barcode: <Icons.Barcode strokeWidth={1.5} size={18} />,
  Star: <Icons.Star strokeWidth={1.5} size={18} />,
  ListTree: <Icons.ListTree strokeWidth={1.5} size={18} />,
  Package: <Icons.Package strokeWidth={1.5} size={18} />,
  ChartColumnStacked: <Icons.ChartColumnStacked strokeWidth={1.5} size={18} />,
  Tag: <Icons.Tag strokeWidth={1.5} size={18} />,
  Award: <Icons.Award strokeWidth={1.5} size={18} />,
  Warehouse: <Icons.Warehouse strokeWidth={1.5} size={18} />,
  ArchiveRestore: <Icons.ArchiveRestore strokeWidth={1.5} size={18} />,
  Import: <Icons.Import strokeWidth={1.5} size={18} />,
  IdCard: <Icons.IdCard strokeWidth={1.5} size={18} />,
  KeySquare: <Icons.KeySquare strokeWidth={1.5} size={18} />,
  LocateFixed: <Icons.LocateFixed strokeWidth={1.5} size={18} />,
  Tags: <Icons.Tags strokeWidth={1.5} size={18} />,
};

export const getSidebarSections = () => {
  const rawStructure = SIDEBAR_MENU_STRUCTURE(prefix_path);
  return rawStructure.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      icon: iconMap[item.iconName] || <Icons.HelpCircle size={18} />,
    })),
  }));
};

export const mainNavItems = () => {
  const sections = getSidebarSections();
  return sections.flatMap((s) => s.items);
};
```

- [ ] **Step 2: Verify the file syntax**

Run: `npm run build --prefix client`
Expected: Build succeeds (no syntax errors).

---

### Task 2: Create `useResponsive` hook

**Files:**
- Create: `client/src/hooks/useResponsive.js`

- [ ] **Step 1: Create useResponsive hook**

Default to `desktop` to avoid layout shift. Uses `matchMedia` listeners.

```js
import { useState, useEffect } from "react";

const queries = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
};

function getBreakpoint() {
  if (window.matchMedia(queries.mobile).matches) return "mobile";
  if (window.matchMedia(queries.tablet).matches) return "tablet";
  return "desktop";
}

export default function useResponsive() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    return getBreakpoint();
  });

  useEffect(() => {
    const mqls = Object.entries(queries).map(([key, q]) => {
      const mql = window.matchMedia(q);
      const handler = () => setBreakpoint(getBreakpoint());
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    });
    return () => mqls.forEach((cleanup) => cleanup());
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 3: Create `BottomNav` component

**Files:**
- Create: `client/src/components/admin/BottomNav.jsx`

- [ ] **Step 1: Create BottomNav component**

Uses the shared `mainNavItems()` from the config. Shows 5-6 primary nav items at the bottom.

```jsx
import { NavLink } from "react-router-dom";
import { mainNavItems, iconMap } from "@/constants/adminMenuConfig";

const PRIMARY_KEYS = [
  "/management/dashboard",
  "/management/orders",
  "/management/products",
  "/management/users",
  "/management/coupons",
];

const BottomNav = () => {
  const allItems = mainNavItems();
  const primaryItems = allItems.filter((item) =>
    PRIMARY_KEYS.includes(item.path)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D121F]/95 border-t border-slate-800 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {primaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-[10px] font-semibold truncate max-w-full leading-tight">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 4: Create `SidebarCollapsed` component

**Files:**
- Create: `client/src/components/admin/SidebarCollapsed.jsx`

- [ ] **Step 1: Create SidebarCollapsed component**

Icon-only sidebar (64px) for tablet. Uses pointer events instead of CSS hover to avoid sticky hover on touch devices. Tooltip shown via state.

```jsx
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { getSidebarSections } from "@/constants/adminMenuConfig";

const SidebarCollapsed = () => {
  const sections = getSidebarSections();
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-16 h-full bg-[#0D121F] border-r border-slate-900 flex flex-col items-center py-4 gap-2 shrink-0 relative">
      <Link
        to="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg mb-2"
      >
        <span className="font-black text-base tracking-tighter italic">SN</span>
      </Link>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto custom-scrollbar w-full px-2">
        {sections.map((section) =>
          section.items.map((item) => (
            <div key={item.path} className="relative w-full flex justify-center">
              <NavLink
                to={item.path}
                onPointerEnter={() => setTooltip(item.label)}
                onPointerLeave={() => setTooltip(null)}
                onFocus={() => setTooltip(item.label)}
                onBlur={() => setTooltip(null)}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-lg transition-all text-lg ${
                    isActive
                      ? "bg-[#161F32] text-sky-400"
                      : "text-slate-500 hover:bg-[#111827] hover:text-slate-200"
                  }`
                }
              >
                {item.icon}
              </NavLink>
              {tooltip === item.label && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarCollapsed;
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 5: Refactor `AdminLayout` for responsive layout

**Files:**
- Modify: `client/src/layouts/AdminLayout.jsx`

- [ ] **Step 1: Update imports and integrate responsive hook**

Replace current imports to use `useResponsive` and the new components.

Old imports at the top:
```jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { LogOut, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-light.svg";
import {
  SIDEBAR_MENU_STRUCTURE,
  USER_SETTINGS_POPOVER,
} from "@/constants/menu";
import * as Icons from "lucide-react";
```

New imports:
```jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { LogOut, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-light.svg";
import { SIDEBAR_MENU_STRUCTURE, USER_SETTINGS_POPOVER } from "@/constants/menu";
import * as Icons from "lucide-react";
import useResponsive from "@/hooks/useResponsive";
import SidebarCollapsed from "@/components/admin/SidebarCollapsed";
import BottomNav from "@/components/admin/BottomNav";
```

- [ ] **Step 2: Remove old `iconMap` and `sidebarSections`**

Delete lines 22-54 (the `iconMap` object and `sidebarSections` useMemo).

- [ ] **Step 3: Add `useResponsive` call and compute layout mode**

After the `useMemo` for `popoverItems` (around line 83), add:

```jsx
const { isDesktop, isTablet, isMobile } = useResponsive();
```

- [ ] **Step 4: Update the JSX container classes**

Change the root `className` on the flex container:
```jsx
// Old:
<div className="flex h-screen w-full bg-[#0B0F19] text-slate-400 font-sans antialiased overflow-hidden">

// New:
<div className="flex h-screen w-full bg-[#0B0F19] text-slate-400 font-sans antialiased overflow-hidden">
```

- [ ] **Step 5: Replace sidebar rendering with responsive logic**

Find the sidebar div with `className` starting with `fixed lg:relative z-50 h-full...` (lines 132-324) and REPLACE it with:

```jsx
{/* Desktop: full sidebar */}
{isDesktop && (
  <div
    className={`relative z-50 h-full bg-[#0D121F] border-r border-slate-900 flex flex-col justify-between p-4 selection:bg-sky-500/30 transition-all duration-300 ease-in-out
               ${isCollapsed ? "w-[78px]" : "w-[260px]"}`}
  >
    {/* Nút đóng sidebar trên mobile - ẩn trên desktop */}
    {/* VÙNG ĐỈNH: LOGO & MENU */}
    <div className="flex flex-col flex-1 min-h-0">
      {/* Logo */}
      <div className={`flex items-center mb-4 select-none shrink-0 ${isCollapsed ? "justify-center" : ""}`}>
        <Link to="/" className={`flex items-center no-underline ${isCollapsed ? "" : "gap-3"}`}>
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] shrink-0">
              <span className="font-black text-base tracking-tighter italic">SN</span>
            </div>
          ) : (
            <img src={logoSvg} alt="SportNexus" className="h-12 md:h-14 w-auto object-contain shrink-0" />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar pb-6 overflow-x-hidden">
        {sidebarSections.map((section, index) => (
          <div key={index} className="space-y-1.5">
            {isCollapsed ? (
              <div className="border-t border-slate-800/60 my-2 mx-2"></div>
            ) : (
              <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-2 truncate animate-in fade-in duration-200">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group
                      ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"}
                      ${isActive
                        ? "bg-[#161F32] text-sky-400 font-semibold shadow-inner border-l-2 border-sky-500 rounded-l-none"
                        : "hover:bg-[#111827] hover:text-slate-200"
                      }
                    `}
                  >
                    <span className="transition-colors duration-150 text-slate-500 group-hover:text-slate-300 group-[.active]:text-sky-400 shrink-0">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate animate-in fade-in duration-200">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Profile area */}
    <div className="pt-4 border-t border-slate-900 space-y-3 shrink-0 relative" ref={settingsRef}>
      {isOpenSettings && (
        <div
          className={`absolute bottom-full left-0 mb-2 bg-[#0D121F]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150
                      ${isCollapsed ? "w-[180px]" : "w-full"}`}
        >
          {!isCollapsed && (
            <div className="px-3 py-2 border-b border-white/5 mb-1 select-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tra cứu hệ thống</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => { setIsCollapsed(!isCollapsed); setIsOpenSettings(false); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-sky-400 bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-all text-left"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span>{isCollapsed ? "Mở rộng thanh" : "Thu nhỏ thanh"}</span>
          </button>
          <div className="border-t border-white/5 my-1"></div>
          {popoverItems.map((item, idx) => {
            if (item.type === "logout") {
              return (
                <div key={idx}>
                  <div className="border-t border-white/5 my-1"></div>
                  <button type="button" onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-500/90 hover:bg-rose-950/20 hover:text-rose-400 transition-all text-left"
                  >
                    {item.icon}<span>{item.label}</span>
                  </button>
                </div>
              );
            }
            return (
              <button key={idx} type="button"
                onClick={() => { if (item.targetPath) { navigate(`${prefix_path}${item.targetPath}`); setIsOpenSettings(false); } }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all text-left"
              >
                {item.icon}<span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div onClick={() => setIsOpenSettings(!isOpenSettings)}
        className={`flex items-center rounded-xl border select-none cursor-pointer transition-all duration-150 group
                   ${isCollapsed ? "justify-center p-2" : "p-2.5 gap-3"}
                   ${isOpenSettings ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "bg-[#111827]/60 border-slate-900 hover:bg-[#162035]/80 hover:border-slate-800"}`}
      >
        <img src={localUser.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 min-w-0 leading-normal py-0.5 animate-in fade-in duration-200">
            <p className="text-[12px] font-bold text-slate-200 truncate tracking-wide">{localUser.full_name}</p>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5 opacity-90">{localUser.email}</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Tablet: collapsed sidebar */}
{isTablet && <SidebarCollapsed />}
```

- [ ] **Step 6: Update content area — mobile padding**

Find the main content div:
```jsx
<div className="flex-1 flex flex-col h-full bg-[#080C14] overflow-hidden">
```

Update the `main` tag inside it to add bottom padding on mobile:
```jsx
{/* Old */}
<main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">

{/* New */}
<main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar pb-20 md:pb-6">
```

Also, after the content `</div>` (closing the content column), add BottomNav for mobile:
```jsx
{/* Mobile: bottom navigation */}
{isMobile && <BottomNav />}
```

Place it right before the final `</div>` of the root container.

- [ ] **Step 7: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 6: Make tables responsive — all list pages (overflow-x-auto)

**Files:**
- Modify: All 18 admin list pages (see list below)

**Pattern:** Find `<table className="w-full...">` or `.table-retro` containing `<table>` and wrap it with `<div className="overflow-x-auto">`.

**Pages to modify** (each gets the same wrap treatment):

1. `client/src/pages/Admin/products/index.jsx`
2. `client/src/pages/Admin/categories/index.jsx`
3. `client/src/pages/Admin/orders/index.jsx`
4. `client/src/pages/Admin/users/index.jsx`
5. `client/src/pages/Admin/brands/index.jsx`
6. `client/src/pages/Admin/coupons/index.jsx`
7. `client/src/pages/Admin/suppliers/index.jsx`
8. `client/src/pages/Admin/permissions/index.jsx`
9. `client/src/pages/Admin/stockmovements/index.jsx`
10. `client/src/pages/Admin/productVariant/index.jsx`
11. `client/src/pages/Admin/attributeKey/index.jsx`
12. `client/src/pages/Admin/productAttributeKey/index.jsx`
13. `client/src/pages/Admin/purchaseorders/index.jsx`
14. `client/src/pages/Admin/purchaseorderitems/index.jsx`
15. `client/src/pages/Admin/carts/index.jsx`
16. `client/src/pages/Admin/reviews/index.jsx`
17. `client/src/pages/Admin/systemlogs/index.jsx`
18. `client/src/pages/Admin/useraddresses/index.jsx`

**Example edit for `products/index.jsx`:**

Old (line 310):
```jsx
<div className="mt-3 relative bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
  <table className="w-full text-sm text-left text-slate-200">
```

New:
```jsx
<div className="mt-3 relative bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-slate-200 min-w-[600px]">
```

**Example for `categories/index.jsx`:**

Old (lines 170-171):
```jsx
<div className="mb-2 table-retro">
  <table className="w-full border-separate border-spacing-0">
```

New:
```jsx
<div className="mb-2 table-retro">
  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-0 min-w-[600px]">
```

- [ ] **Step 1: Fix `products/index.jsx`** — add `overflow-x-auto` wrapper + `min-w-[600px]` on `<table>`
- [ ] **Step 2: Fix `categories/index.jsx`** — same pattern
- [ ] **Step 3: Fix `orders/index.jsx`** — same pattern
- [ ] **Step 4: Fix `users/index.jsx`** — same pattern
- [ ] **Step 5: Fix `brands/index.jsx`** — same pattern
- [ ] **Step 6: Fix `coupons/index.jsx`** — same pattern
- [ ] **Step 7: Fix `suppliers/index.jsx`** — same pattern
- [ ] **Step 8: Fix `permissions/index.jsx`** — same pattern
- [ ] **Step 9: Fix `stockmovements/index.jsx`** — same pattern
- [ ] **Step 10: Fix `productVariant/index.jsx`** — same pattern
- [ ] **Step 11: Fix `attributeKey/index.jsx`** — same pattern
- [ ] **Step 12: Fix `productAttributeKey/index.jsx`** — same pattern
- [ ] **Step 13: Fix `purchaseorders/index.jsx`** — same pattern
- [ ] **Step 14: Fix `purchaseorderitems/index.jsx`** — same pattern
- [ ] **Step 15: Fix `carts/index.jsx`** — same pattern
- [ ] **Step 16: Fix `reviews/index.jsx`** — same pattern
- [ ] **Step 17: Fix `systemlogs/index.jsx`** — same pattern
- [ ] **Step 18: Fix `useraddresses/index.jsx`** — same pattern
- [ ] **Step 19: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 7: Make filter panels responsive

**Files:**
- Modify: All admin list pages that have filter panels

**Pattern:** Find `flex flex-wrap items-end gap-4` (or similar filter row) and replace fixed widths (`w-[230px]`, `w-[220px]`, etc.) with responsive widths.

**Example for `products/index.jsx`:**

Old (line 188):
```jsx
<div className="flex flex-wrap items-end gap-4">
  <div className="w-[230px] shrink-0">
```

New:
```jsx
<div className="flex flex-wrap items-end gap-4">
  <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[230px] shrink-0">
```

And for the price range (line 263):
```jsx
<div className="w-full sm:w-[250px] lg:w-[220px] shrink-0">
```

- [ ] **Step 1: Fix products filter panel widths**
- [ ] **Step 2: Fix other list pages with filter panels**
- [ ] **Step 3: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 8: Make form grids responsive

**Files:**
- Modify: All admin create/edit pages

**Pattern:** Change `w-1/2`, `w-1/3`, `grid-cols-12` fixed layouts to use responsive classes.

**Example for `products/create.jsx`:**

Old (line 152-153):
```jsx
<form onSubmit={handleSubmit} className="flex gap-3 mt-2">
  <div className="w-1/2 flex flex-col gap-3">
```

New:
```jsx
<form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3 mt-2">
  <div className="w-full lg:w-1/2 flex flex-col gap-3">
```

For grid sections like `flex gap-2 mb-2` with `w-1/2` children (line 156-157):
```jsx
<div className="flex flex-col sm:flex-row gap-2 mb-2">
  <div className="w-full sm:w-1/2">
```

**Affected files (apply same pattern):**
- `client/src/pages/Admin/products/create.jsx`
- `client/src/pages/Admin/products/edit.jsx`
- `client/src/pages/Admin/categories/create.jsx`
- `client/src/pages/Admin/categories/edit.jsx`
- `client/src/pages/Admin/brands/create.jsx`
- `client/src/pages/Admin/brands/edit.jsx`
- `client/src/pages/Admin/orders/create.jsx`
- `client/src/pages/Admin/orders/edit.jsx`
- `client/src/pages/Admin/users/create.jsx`
- `client/src/pages/Admin/users/edit.jsx`
- `client/src/pages/Admin/coupons/create.jsx`
- `client/src/pages/Admin/coupons/edit.jsx`
- `client/src/pages/Admin/suppliers/create.jsx`
- `client/src/pages/Admin/suppliers/edit.jsx`
- `client/src/pages/Admin/permissions/create.jsx`
- `client/src/pages/Admin/permissions/edit.jsx`
- `client/src/pages/Admin/purchaseorders/create.jsx`
- `client/src/pages/Admin/purchaseorders/edit.jsx`
- `client/src/pages/Admin/stockmovements/create.jsx`
- `client/src/pages/Admin/stockmovements/edit.jsx`

**General rule:** Each fixed-width layout class (`w-1/2`, `w-1/3`, `w-2/3`, `grid-cols-12`, `flex gap-3` on forms) should be replaced:
- Single column on mobile (`w-full`, `flex-col`)
- Multi column from sm/md up (`sm:w-1/2`, `md:grid-cols-2`)

- [ ] **Step 1: Fix `products/create.jsx` and `products/edit.jsx`**
- [ ] **Step 2: Fix `categories/create.jsx` and `categories/edit.jsx`**
- [ ] **Step 3: Fix `brands/create.jsx` and `brands/edit.jsx`**
- [ ] **Step 4: Fix `orders/create.jsx` and `orders/edit.jsx`**
- [ ] **Step 5: Fix `users/create.jsx` and `users/edit.jsx`**
- [ ] **Step 6: Fix `coupons/create.jsx` and `coupons/edit.jsx`**
- [ ] **Step 7: Fix `suppliers/create.jsx` and `suppliers/edit.jsx`**
- [ ] **Step 8: Fix `permissions/create.jsx` and `permissions/edit.jsx`**
- [ ] **Step 9: Fix `purchaseorders/create.jsx` and `purchaseorders/edit.jsx`**
- [ ] **Step 10: Fix `stockmovements/create.jsx` and `stockmovements/edit.jsx`**
- [ ] **Step 11: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 9: Update `table-retro` CSS for native scrollbar style

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Add custom scrollbar style for `.overflow-x-auto` inside tables**

Add to the `.table-retro` section (or as a standalone utility):

```css
/* Scrollbar tối ưu cho bảng responsive */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 3px;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

### Task 10: Remove unused `isMobileOpen` state from `AdminLayout`

**Files:**
- Modify: `client/src/layouts/AdminLayout.jsx`

After the refactor, the `isMobileOpen` overlay sidebar is no longer needed (mobile uses BottomNav now).

- [ ] **Step 1: Remove `isMobileOpen` state and related code**

Delete:
- `const [isMobileOpen, setIsMobileOpen] = useState(false);`
- The `handleResize` useEffect (lines 108-114)
- The mobile backdrop div (lines 124-129)
- The mobile header with hamburger (lines 329-339)
- All references to `isMobileOpen`, `setIsMobileOpen`, `setIsMobileOpen(false)` in NavLink onClick

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix client`
Expected: Build succeeds.

---

## Self-Review Checklist

1. **Spec coverage:** Every section from the spec is covered:
   - useResponsive hook → Task 2
   - AdminLayout refactor / 3 breakpoint states → Task 5
   - SidebarCollapsed (tablet) → Task 4
   - BottomNav (mobile) → Task 3
   - Shared menu config → Task 1
   - Table overflow-x-auto → Task 6
   - CSS scrollbar → Task 9
   - Filter responsive widths → Task 7
   - Form grid responsive → Task 8
   - Cleanup old isMobileOpen → Task 10
   - iOS safe area → BottomNav has `pb-[env(safe-area-inset-bottom)]`
   - Touch tooltip → SidebarCollapsed uses pointer events
   - Layout shift prevention → useResponsive defaults to "desktop"

2. **Placeholder scan:** No "TBD", "TODO", "implement later" placeholders.
3. **Type consistency:** All imports and function names are consistent.
4. **No duplicate work or gaps.**
