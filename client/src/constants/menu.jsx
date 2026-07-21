// @/constants/menu.js

export const SIDEBAR_MENU_STRUCTURE = (prefix) => [
  {
    title: "HỆ THỐNG",
    items: [
      {
        path: `${prefix}/dashboard`,
        label: "Tổng quan",
        iconName: "LayoutDashboard",
      },
      {
        path: `${prefix}/logs`,
        label: "Hoạt động",
        iconName: "ClipboardClock",
      },
    ],
  },
  {
    title: "KINH DOANH",
    items: [
      {
        path: `${prefix}/orders`,
        label: "Đơn hàng",
        iconName: "ClipboardList",
      },
      { path: `${prefix}/carts`, label: "Giỏ hàng", iconName: "ShoppingCart" },
      { path: `${prefix}/coupons`, label: "Khuyến mãi", iconName: "Barcode" },
      {
        path: `${prefix}/reviews`,
        label: "Đánh giá & Phản hồi",
        iconName: "Star",
      },
    ],
  },
  {
    title: "SẢN PHẨM & KHO",
    items: [
      { path: `${prefix}/categories`, label: "Danh mục", iconName: "ListTree" },
      { path: `${prefix}/products`, label: "Sản phẩm", iconName: "Package" },
      {
        path: `${prefix}/product-variants`,
        label: "Sản phẩm chi tiết",
        iconName: "ChartColumnStacked",
      },
      {
        path: `${prefix}/attribute-key`,
        label: "Thuộc tính SP",
        iconName: "Tag",
      },
      {
        path: `${prefix}/product-attribute-key`,
        label: "Gán thuộc tính SP",
        iconName: "Tags",
      },
      { path: `${prefix}/brands`, label: "Thương hiệu", iconName: "Award" },
      { path: `${prefix}/stocks`, label: "Tồn kho", iconName: "Warehouse" },
    ],
  },
  {
    title: "CHUỖI CUNG ỨNG",
    items: [
      {
        path: `${prefix}/suppliers`,
        label: "Nhà cung cấp",
        iconName: "ArchiveRestore",
      },
      { path: `${prefix}/purchase`, label: "Nhập hàng", iconName: "Import" },
    ],
  },
  {
    title: "NGƯỜI DÙNG & ACL",
    items: [
      { path: `${prefix}/users`, label: "Khách hàng", iconName: "IdCard" },
      {
        path: `${prefix}/permissions`,
        label: "Phân quyền",
        iconName: "KeySquare",
      },
      {
        path: `${prefix}/addresses`,
        label: "Địa chỉ",
        iconName: "LocateFixed",
      },
    ],
  },
];

export const USER_SETTINGS_POPOVER = [
  {
    label: "Hoạt động",
    iconName: "Activity",
    type: "link",
    targetPath: "/logs", // Sẽ chuyển hướng thành /management/logs
  },
  {
    label: "Trí thông minh cá nhân",
    iconName: "User",
    type: "button",
    targetPath: "/personal-ai", // Sau này đổi route chỉ cần sửa ở đây
  },
  {
    label: "Quản lý gói thuê bao",
    iconName: "ShieldCheck",
    type: "button",
    targetPath: "/billing", // Sau này đổi route chỉ cần sửa ở đây
  },
  {
    label: "Đăng xuất hệ thống",
    iconName: "LogOut",
    type: "logout",
  },
];
