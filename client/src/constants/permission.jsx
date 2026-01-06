export const PERMISSION_TRANSLATIONS = {
  modules: {
    users: "Người dùng",
    roles: "Vai trò",
    permissions: "Quyền hạn",
    products: "Sản phẩm",
    categories: "Danh mục",
    brands: "Thương hiệu",
    coupons: "Mã giảm giá",
    orders: "Đơn hàng",
    purchaseorders: "Nhập hàng",
    reviews: "Đánh giá",
    stockmovements: "Kho vận",
    suppliers: "Nhà cung cấp",
    systemlogs: "Nhật ký",
  },
  // Actions (Hành động)
  actions: {
    create: "Thêm mới",
    read: "Xem danh sách",
    update: "Cập nhật",
    delete: "Xóa dữ liệu",
  },
};

export const MODULE_LABELS = {
  users: "👤 Quản lý Người dùng",
  roles: "🔑 Vai trò & Phân quyền",
  permissions: "🛡️ Danh mục Quyền hạn",
  products: "📦 Sản phẩm",
  categories: "📂 Danh mục Sản phẩm",
  brands: "🏷️ Thương hiệu",
  orders: "🛒 Đơn hàng",
  coupons: "🎟️ Mã giảm giá",
  suppliers: "🏭 Nhà cung cấp",
  purchaseorders: "📝 Đơn nhập hàng",
  stockmovements: "📉 Biến động kho",
  reviews: "⭐ Đánh giá khách hàng",
  systemlogs: "📋 Nhật ký hệ thống",
};

export const ACTION_OPTIONS = [
  { slug: "create", name: "✨ Thêm mới (Create)" },
  { slug: "read", name: "👁️ Xem dữ liệu (Read)" },
  { slug: "update", name: "📝 Chỉnh sửa (Update)" },
  { slug: "delete", name: "🗑️ Xóa dữ liệu (Delete)" },
];
