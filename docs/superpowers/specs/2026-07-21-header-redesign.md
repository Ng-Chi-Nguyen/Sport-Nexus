# Header Redesign — Clean Commerce

## Overview
Redesign the public-facing header component (`client/src/components/header.jsx`) to a clean, minimal, modern layout suitable for a sports e-commerce platform. Removes clutter, consolidates secondary actions into a user dropdown, and adopts a glassmorphism fixed header.

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] [Danh mục ▼]    [⌕ Search sản phẩm...]    [♡] [👤] [🛒] │
│ ──────────────────────────────────────────────────────────────── │
└──────────────────────────────────────────────────────────────────┘
```

Single-row layout inside a fixed header. Max width `1440px`, centered.

## Components

### 1. Logo
- Reuse existing `Logo` component from `@/components/logo`
- No changes needed

### 2. Category Nav
- Dropdown trigger labeled "Danh mục" with chevron-down icon
- Hover opens dropdown (CSS-based, no JS needed for v1)
- Links populated from a static array (API integration deferred)
- Visible on desktop only (`hidden lg:flex`)

### 3. Search Bar
- Input field with `⌕` magnifier icon on left, "Tìm kiếm" label on right
- Placeholder: "Tìm kiếm sản phẩm..."
- Focus state: border glow `#4facf3` (ring-2 ring-primary/30)
- Max-width on desktop, full-width on mobile
- Search icon becomes expandable on mobile (`< lg`)

### 4. Wishlist Icon (♡)
- `Heart` icon from lucide-react
- Red badge count (hardcoded 0 for now)
- Links to `/wishlist` (placeholder route)

### 5. User Dropdown (👤)
- **Not logged in**: "Đăng nhập" link → `/auth/login`
- **Logged in**: User avatar (first letter of name) + full name
- Click opens dropdown menu with:
  - "Thông tin cá nhân" → `/profile`
  - "Đơn hàng của tôi" → `/profile/order`
  - "Quản trị" → `/management/dashboard` (only if `user.role.slug !== "customer"`)
  - "Cài đặt" → `/profile/edit`
  - "Đăng xuất"
- Dashboard icon + Settings icon removed from main bar; merged here

### 6. Cart
- `ShoppingCart` icon from lucide-react
- Red dot badge (hardcoded for now)
- Links to `/cart` (placeholder route)

### 7. Search Overlay / Mobile Menu (v1 deferred)
- Not implemented in v1. On mobile the search collapses to an icon that expands on click.

## Data Flow

### Auth state
- Currently reads from `localStorage.getItem("user")` — kept as-is
- Should migrate to React Context or TanStack Query when auth system is refactored
- Until then, `useState` + `useEffect` with localStorage is acceptable

### Cart/Wishlist counts
- Hardcoded to 0 / hidden for now
- Ready for API integration later

## Visual Design

| Token | Value |
|-------|-------|
| Header bg | `bg-white/80 backdrop-blur-md` |
| Border | `border-b border-gray-200/70` |
| Height | `h-16` (64px) |
| Shadow | `shadow-sm` |
| Font | Inter (body), Montserrat (brand) |
| Primary | `#4facf3` |
| Radius | `rounded-full` on search, `rounded-lg` on dropdown |
| Transition | `transition-all duration-200` on interactive elements |

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `≥ lg` | Full layout — all items visible |
| `< lg` | Category nav hides, search becomes icon-expandable |
| `< md` | User shows as icon-only (no name text) |

## Removed Elements
- "Tư vấn mua hàng" phone badge (0812312831)
- Dashboard icon (LayoutDashboard) — moved to user dropdown
- Settings icon — moved to user dropdown
- Vertical separators (`border-r` pipes between icon groups)

## Files to Modify
- `client/src/components/header.jsx` — complete rewrite
- `client/src/App.jsx` — verify no breaking changes (Header usage is unchanged)

## Files to Create
- None. All changes within existing files.

## Out of Scope (v1)
- Mobile hamburger menu
- Cart/wishlist API integration
- Search autocomplete/suggestions
- Auth context/migration from localStorage
