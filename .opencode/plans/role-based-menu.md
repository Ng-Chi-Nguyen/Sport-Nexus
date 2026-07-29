# Role-Based Menu Filtering

## 1. `constants/menu.jsx`
Thêm `roles: ["admin"]` vào 3 items của section "NGƯỜI DÙNG & ACL".

## 2. `constants/adminMenuConfig.jsx`
- `getSidebarSections(userRole)` — nhận tham số, filter items: nếu item có `roles` thì chỉ giữ nếu `roles.includes(userRole)`, xoá section rỗng.
- `mainNavItems(userRole)` — truyền userRole xuống.

## 3. `layouts/AdminLayout.jsx`
- `const userRole = localUser.role?.slug || null;`
- Truyền `userRole` vào `getSidebarSections(userRole)`
- Truyền `userRole` prop xuống `<SidebarCollapsed userRole={userRole} />` và `<BottomNav userRole={userRole} />`

## 4. `components/admin/SidebarCollapsed.jsx`
- Nhận prop `userRole`
- `const sections = getSidebarSections(userRole);`

## 5. `components/admin/BottomNav.jsx`
- Nhận prop `userRole`
- `const allItems = mainNavItems(userRole);`
