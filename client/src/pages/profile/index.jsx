import Breadcrumbs from "@/components/ui/breadcrumbs";
import logoDefault from "@/assets/images/logodefault.jpg";
import {
  CircleCheck,
  FileUser,
  ListOrdered,
  LogOut,
  MapPinHouse,
  RotateCcwKey,
  ShieldOff,
  ChevronRight,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Confirm } from "@/components/ui/confirm";
import authApi from "@/api/auth/auth";
import { toast } from "sonner";

const breadcrumbNameMap = {
  "/profile": "Tài khoản",
  "/profile/address": "Địa chỉ",
  "/profile/order": "Đơn hàng",
  "/profile/reset-password": "Đổi mật khẩu",
  "/profile/edit": "Chỉnh sửa thông tin",
};

const menuProfile = [
  { name: "Hồ sơ", path: "/profile", exact: true, icon: FileUser },
  {
    name: "Địa chỉ",
    path: "/profile/address",
    exact: false,
    icon: MapPinHouse,
  },
  { name: "Đơn hàng", path: "/profile/order", exact: false, icon: ListOrdered },
  {
    name: "Đổi mật khẩu",
    path: "/profile/reset-password",
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

const ProfilePage = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const base = [{ title: "Trang chủ", route: "/" }];
  const currentPath = location.pathname;

  let breadcrumbsData = [...base];
  if (currentPath === "/profile") {
    breadcrumbsData.push({ title: "Tài khoản", route: "" });
  } else if (breadcrumbNameMap[currentPath]) {
    breadcrumbsData.push(
      { title: "Tài khoản", route: "/profile" },
      { title: breadcrumbNameMap[currentPath], route: "" },
    );
  }

  const handleLogoutClick = () => setIsLogoutModalOpen(true);

  const confirmLogout = async () => {
    try {
      toast.dismiss();
      if (user?.id) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      console.error("Lỗi API logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsLogoutModalOpen(false);
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs data={breadcrumbsData} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-[3px] mb-3">
                  <div className="w-full h-full rounded-2xl bg-white overflow-hidden">
                    <img
                      src={user?.avatar || logoDefault}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-gray-900 font-bold text-base tracking-tight">
                      {user?.full_name}
                    </h3>
                    <span
                      title={
                        user?.is_verified ? "Đã xác thực" : "Chưa xác thực"
                      }
                    >
                      {user?.is_verified ? (
                        <CircleCheck size={15} className="text-emerald-400" />
                      ) : (
                        <ShieldOff size={15} className="text-rose-400" />
                      )}
                    </span>
                  </div>
                  <span className="inline-block mt-1.5 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {user?.role?.name || "Customer"}
                  </span>
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 mb-4" />

              {/* Nav Menu */}
              <nav className="space-y-1">
                {menuProfile.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${menuIcons[item.name]} p-[1px] shrink-0`}
                        >
                          <div
                            className={`w-full h-full rounded-lg flex items-center justify-center ${isActive ? "bg-blue-50" : "bg-white"}`}
                          >
                            <item.icon
                              size={14}
                              className={
                                isActive ? "text-blue-600" : "text-gray-400"
                              }
                            />
                          </div>
                        </div>
                        <span className="flex-1">{item.name}</span>
                        <ChevronRight
                          size={14}
                          className={`transition-all duration-200 ${
                            isActive
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-2"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="h-[1px] bg-gray-100 my-4" />

              {/* Logout */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                           text-rose-500 hover:text-rose-600 hover:bg-rose-50
                           border border-transparent hover:border-rose-100 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <LogOut size={14} className="text-rose-400" />
                </div>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <Confirm
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        message="Bạn có chắc chắn muốn rời khỏi hệ thống Sport Nexus không? Chúng tôi sẽ đợi bạn quay lại!"
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
