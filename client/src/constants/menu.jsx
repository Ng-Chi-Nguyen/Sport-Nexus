// @/constants/menu.js

export const SIDEBAR_MENU_STRUCTURE = (prefix) => [
  {
    title: "system",
    items: [
      {
        path: `${prefix}/dashboard`,
        label: "overview",
        iconName: "LayoutDashboard",
        roles: ["admin"],
      },
      {
        path: `${prefix}/logs`,
        label: "activity",
        iconName: "ClipboardClock",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "business",
    items: [
      {
        path: `${prefix}/orders`,
        label: "orders",
        iconName: "ClipboardList",
      },
      {
        path: `${prefix}/shipping`,
        label: "shipping",
        iconName: "Truck",
      },
      {
        path: `${prefix}/carts`,
        label: "carts",
        iconName: "ShoppingCart",
      },
      { path: `${prefix}/coupons`, label: "coupons", iconName: "Barcode" },
      {
        path: `${prefix}/reviews`,
        label: "reviews",
        iconName: "Star",
      },
    ],
  },
  {
    title: "products_warehouse",
    items: [
      {
        path: `${prefix}/categories`,
        label: "categories",
        iconName: "ListTree",
      },
      {
        path: `${prefix}/products`,
        label: "products",
        iconName: "Package",
      },
      {
        path: `${prefix}/product-variants`,
        label: "product_variants",
        iconName: "ChartColumnStacked",
      },
      {
        path: `${prefix}/attribute-key`,
        label: "attribute_key",
        iconName: "Tag",
      },
      {
        path: `${prefix}/product-attribute-key`,
        label: "product_attribute_key",
        iconName: "Tags",
      },
      { path: `${prefix}/brands`, label: "brands", iconName: "Award" },
      { path: `${prefix}/stocks`, label: "stocks", iconName: "Warehouse" },
    ],
  },
  {
    title: "supply_chain",
    items: [
      {
        path: `${prefix}/suppliers`,
        label: "suppliers",
        iconName: "ArchiveRestore",
      },
      {
        path: `${prefix}/purchase`,
        label: "purchase",
        iconName: "Import",
      },
    ],
  },
  {
    title: "users_acl",
    items: [
      {
        path: `${prefix}/users`,
        label: "users",
        iconName: "IdCard",
        roles: ["admin"],
      },
      {
        path: `${prefix}/permissions`,
        label: "permissions",
        iconName: "KeySquare",
        roles: ["admin"],
      },
      {
        path: `${prefix}/addresses`,
        label: "addresses",
        iconName: "LocateFixed",
        roles: ["admin"],
      },
    ],
  },
];

export const USER_SETTINGS_POPOVER = [
  {
    label: "activity",
    iconName: "Activity",
    type: "link",
    targetPath: "/logs",
  },
  {
    label: "personal_ai",
    iconName: "User",
    type: "button",
    targetPath: "/personal-ai",
  },
  {
    label: "billing",
    iconName: "ShieldCheck",
    type: "button",
    targetPath: "/billing",
  },
  {
    label: "logout",
    iconName: "LogOut",
    type: "logout",
  },
];
