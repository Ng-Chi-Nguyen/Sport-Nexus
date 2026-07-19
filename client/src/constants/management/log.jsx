import { PlusCircle, Pencil, Trash2, Package } from "lucide-react";

export const actionConfig = {
  CREATE: { icon: PlusCircle, label: "đã thêm", color: "text-emerald-400" },
  UPDATE: { icon: Pencil, label: "đã cập nhật", color: "text-sky-400" },
  DELETE: { icon: Trash2, label: "đã xoá", color: "text-rose-400" },
  STOCK_ADJUSTMENT: { icon: Package, label: "đã điều chỉnh tồn kho", color: "text-amber-400" },
};

export const actionTypes = [
  { slug: "", name: "Tất cả hành động" },
  { slug: "CREATE", name: "Thêm mới" },
  { slug: "UPDATE", name: "Cập nhật" },
  { slug: "DELETE", name: "Xoá" },
  { slug: "STOCK_ADJUSTMENT", name: "Điều chỉnh tồn kho" },
];

export const entityTypes = [
  { slug: "", name: "Tất cả đối tượng" },
  { slug: "Orders", name: "Đơn hàng" },
  { slug: "Products", name: "Sản phẩm" },
  { slug: "Users", name: "Người dùng" },
  { slug: "ProductVariants", name: "Biến thể" },
  { slug: "Coupons", name: "Khuyến mãi" },
  { slug: "Brands", name: "Thương hiệu" },
  { slug: "Categories", name: "Danh mục" },
  { slug: "Suppliers", name: "Nhà cung cấp" },
];

export const entityNames = {
  Orders: "đơn hàng",
  Products: "sản phẩm",
  Users: "người dùng",
  ProductVariants: "biến thể",
  Coupons: "khuyến mãi",
  Brands: "thương hiệu",
  Categories: "danh mục",
  Suppliers: "nhà cung cấp",
  StockMovements: "phiếu kho",
  PurchaseOrders: "đơn nhập hàng",
};

export const statusOptions = [
  { slug: "", name: "Tất cả trạng thái" },
  { slug: "SUCCESS", name: "Thành công" },
  { slug: "FAILED", name: "Thất bại" },
];
