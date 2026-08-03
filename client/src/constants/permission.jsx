export const PERMISSION_TRANSLATIONS = {
  modules: {
    users: "permission.module.users",
    roles: "permission.module.roles",
    permissions: "permission.module.permissions",
    products: "permission.module.products",
    categories: "permission.module.categories",
    brands: "permission.module.brands",
    coupons: "permission.module.coupons",
    orders: "permission.module.orders",
    purchaseorders: "permission.module.purchaseorders",
    reviews: "permission.module.reviews",
    stockmovements: "permission.module.stockmovements",
    suppliers: "permission.module.suppliers",
    systemlogs: "permission.module.systemlogs",
  },
  // Actions (Hành động)
  actions: {
    create: "permission.action.create",
    read: "permission.action.read",
    update: "permission.action.update",
    delete: "permission.action.delete",
    gift: "permission.action.gift",
  },
};

export const MODULE_LABELS = {
  // Hệ thống & Tài khoản
  users: "permission.module_label.users",
  roles: "permission.module_label.roles",
  permissions: "permission.module_label.permissions",
  useraddresses: "permission.module_label.useraddresses",
  systemlogs: "permission.module_label.systemlogs",

  // Hàng hóa & Thuộc tính
  products: "permission.module_label.products",
  categories: "permission.module_label.categories",
  brands: "permission.module_label.brands",
  attributekeys: "permission.module_label.attributekeys",
  productimages: "permission.module_label.productimages",
  productvariants: "permission.module_label.productvariants",
  invoices: "permission.module_label.invoices",
  payments: "permission.module_label.payments",

  // Kinh doanh & Vận hành
  orders: "permission.module_label.orders",
  coupons: "permission.module_label.coupons",
  reviews: "permission.module_label.reviews",
  carts: "permission.module_label.carts",

  // Kho hàng & Nhập kho
  suppliers: "permission.module_label.suppliers",
  purchaseorders: "permission.module_label.purchaseorders",
  stockmovements: "permission.module_label.stockmovements",
};

export const ACTION_OPTIONS = [
  { slug: "create", name: "permission.action_option.create" },
  { slug: "read", name: "permission.action_option.read" },
  { slug: "update", name: "permission.action_option.update" },
  { slug: "delete", name: "permission.action_option.delete" },
  { slug: "gift", name: "permission.action_option.gift" },
];
