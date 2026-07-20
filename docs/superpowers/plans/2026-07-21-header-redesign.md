# Header Redesign Implementation Plan

> **For agentic workers:** This is a single-component rewrite — implement directly.

**Goal:** Rewrite `client/src/components/header.jsx` to a clean, minimal layout: Logo | Search | Dashboard | User | Cart | Settings.

**Architecture:** Single component rewrite. No new files. Auth reads from localStorage (unchanged). All icons from lucide-react.

**Tech Stack:** React 19, Tailwind CSS, lucide-react, react-router-dom

---

### Task 1: Rewrite Header Component

**Files:**
- Rewrite: `client/src/components/header.jsx`

- [ ] **Step 1: Replace header.jsx content**

```jsx
import {
  LayoutDashboard,
  Search,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "./logo";

const Header = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/70 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dashboard — only for non-customer roles */}
          {user && user.role.slug !== "customer" && (
            <Link
              to="/management/dashboard"
              className="p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <LayoutDashboard size={20} strokeWidth={1.5} />
            </Link>
          )}

          {/* User */}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-700 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                {user.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                {user.full_name}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          {/* Cart */}
          <button className="relative p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200">
            <ShoppingCart size={20} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200">
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

- [ ] **Step 2: Update App.jsx height reference if needed**

Check `client/src/App.jsx` — the old header had `h-[65px]` passed as className. The new header is `h-16` (64px) and fixed position, so the layout may need a padding-top on the main content.

Current App.jsx:
```jsx
{!isManagementView && <Header className="h-[65px] shrink-0" />}
```

The fixed header no longer takes flow space, so add `pt-16` to the main content wrapper:

```jsx
<main className="flex-1 pt-16">
```

- [ ] **Step 3: Build & lint check**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
