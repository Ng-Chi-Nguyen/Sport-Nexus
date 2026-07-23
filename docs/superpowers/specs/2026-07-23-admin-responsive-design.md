# Admin Responsive Design

## Overview

Làm responsive toàn bộ admin interface cho cả mobile, tablet, và desktop.

## Breakpoint Strategy

| Device | Range | Navigation | Sidebar |
|--------|-------|------------|---------|
| Desktop | >= 1024px (lg) | Full sidebar trái | `Sidebar.jsx` — 260px, full text + icon |
| Tablet | 768px - 1023px (md-lg) | Icon-only sidebar | `SidebarCollapsed.jsx` — 64px, icon + tooltip |
| Mobile | < 768px (dưới md) | Bottom navigation | `BottomNav.jsx` — fixed h-16, 5-6 tabs |

## Components

### `useResponsive` hook (`client/src/hooks/useResponsive.js`)
- Sử dụng `window.matchMedia` để detect breakpoint
- Cập nhật real-time khi resize
- Export: `{ breakpoint, isMobile, isTablet, isDesktop }`
- Ngưỡng: mobile < 768px, tablet < 1024px
- **Chống layout shift:** Giá trị khởi tạo mặc định là `desktop`, kết hợp `useIsomorphicLayoutEffect` (hoặc `useEffect`) để sync ngay paint đầu tiên; hoặc ẩn layout tạm (`opacity-0`) cho đến khi breakpoint xác định

### `AdminLayout.jsx` (refactor)
- Dùng `useResponsive` để chọn layout
- Desktop: flex `Sidebar + Content` (giữ nguyên)
- Tablet: flex `SidebarCollapsed + Content`
- Mobile: `Content + BottomNav` fixed bottom
- Content padding-bottom 64px trên mobile

### `SidebarCollapsed.jsx` (mới)
- 64px width
- Chỉ icon, ẩn text label
- Tooltip trên hover (dùng `onPointerEnter`/`onPointerLeave` thay vì CSS `:hover` thuần để tránh sticky hover trên touch device)
- Giữ nguyên active state highlight
- Lấy menu items từ cùng nguồn dữ liệu với Sidebar

### `BottomNav.jsx` (mới)
- Fixed bottom, h-16, z-50
- 5-6 mục chính: Dashboard, Orders, Products, Users, Coupons, Settings
- Icon + label nhỏ bên dưới
- Active tab highlight
- Dùng `useLocation()` để active matching route
- **iOS Safe Area:** Thêm `pb-[env(safe-area-inset-bottom)]` để tránh bị home indicator che
- Content padding-bottom tăng tương ứng trên mobile

## Tables (tất cả list pages)
- Bọc `<div className="overflow-x-auto">` quanh mỗi `<table>`
- Thêm `min-w-[600px]` (hoặc tùy chỉnh) trên table
- Action column giữ nguyên

## Filters
- Desktop: giữ nguyên layout ngang
- Tablet: `flex-wrap` + `w-full md:w-auto`
- Mobile: ẩn mặc định + nút toggle "Bộ lọc"

## Form Grids
- `grid-cols-12` cố định → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Field label + input xuống hàng dọc trên mobile

## Files Affected

| File | Change |
|------|--------|
| `client/src/hooks/useResponsive.js` | **Tạo mới** |
| `client/src/layouts/AdminLayout.jsx` | Refactor — responsive layout engine |
| `client/src/components/admin/Sidebar.jsx` | Tách menu items ra shared config |
| `client/src/components/admin/SidebarCollapsed.jsx` | **Tạo mới** |
| `client/src/components/admin/BottomNav.jsx` | **Tạo mới** |
| `client/src/pages/Admin/**/index.jsx` | Thêm overflow-x-auto + responsive grid |
| `client/src/pages/Admin/**/create.jsx` | Responsive form grid |
| `client/src/pages/Admin/**/edit.jsx` | Responsive form grid |

## Non-Goals
- Không thay đổi cấu trúc dữ liệu hay API
- Không thay đổi logic nghiệp vụ
- Không thêm dependencies mới
- Không thay đổi giao diện desktop hiện tại
