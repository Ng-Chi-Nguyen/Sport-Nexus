import { FileUser, MapPinHouse, ListOrdered, RotateCcwKey, Home, Building2, Briefcase } from "lucide-react";

const breadcrumbNameMap = {
  "/tai-khoan": "Tài khoản",
  "/tai-khoan/dia-chi": "Địa chỉ",
  "/tai-khoan/don-hang": "Đơn hàng",
  "/tai-khoan/dat-lai-mat-khau": "Đổi mật khẩu",
  "/tai-khoan/chinh-sua-thong-tin-ca-nhan": "Chỉnh sửa thông tin",
};

const menuProfile = [
  { name: "Hồ sơ", path: "/tai-khoan", exact: true, icon: FileUser },
  {
    name: "Địa chỉ",
    path: "/tai-khoan/dia-chi",
    exact: false,
    icon: MapPinHouse,
  },
  {
    name: "Đơn hàng",
    path: "/tai-khoan/don-hang",
    exact: false,
    icon: ListOrdered,
  },
  {
    name: "Đổi mật khẩu",
    path: "/tai-khoan/dat-lai-mat-khau",
    exact: false,
    icon: RotateCcwKey,
  },
];

const menuIcons = {
  "Hồ sơ": "from-blue-500 to-cyan-400",
  "Địa chỉ": "from-orange-400 to-rose-400",
  "Đơn hàng": "from-purple-500 to-pink-400",
  "Đổi mật khẩu": "from-emerald-500 to-teal-400",
};

// Class CSS badge cho trạng thái vận chuyển
export const STATUS_BADGE = {
  Processing: "bg-amber-50 text-amber-600 border-amber-200",
  Shipping: "bg-purple-50 text-purple-600 border-purple-200",
  Delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
  Refunded: "bg-orange-50 text-orange-600 border-orange-200",
};

// Class CSS badge cho trạng thái thanh toán
export const PAYMENT_BADGE = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Failed: "bg-rose-50 text-rose-600 border-rose-200",
  Refunded: "bg-blue-50 text-blue-600 border-blue-200",
};

// Nhãn Tiếng Việt cho phương thức thanh toán
export const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  VNPAY: "Cổng VNPay",
  CREDIT_CARD: "Thẻ tín dụng",
};

// Nhãn Tiếng Việt cho loại địa chỉ
export const TYPE_LABEL = {
  home: "Nhà riêng",
  office: "Văn phòng",
  company: "Công ty",
};

// Icon cho loại địa chỉ
export const TYPE_ICON = {
  home: Home,
  office: Building2,
  company: Briefcase,
};

export { breadcrumbNameMap, menuProfile, menuIcons };
