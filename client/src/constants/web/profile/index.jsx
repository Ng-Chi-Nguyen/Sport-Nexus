import {
  FileUser,
  MapPinHouse,
  ListOrdered,
  RotateCcwKey,
} from "lucide-react";

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

export { breadcrumbNameMap, menuProfile, menuIcons };
