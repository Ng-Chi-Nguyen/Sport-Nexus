import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Confirm } from "@/components/ui/confirm";
import authApi from "@/api/auth/auth";
import { toast } from "sonner";
import { breadcrumbNameMap } from "@/constants/web/profile";

const ProfilePage = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const base = [{ title: "Trang chủ", route: "/" }];
  const currentPath = location.pathname;

  let breadcrumbsData = [...base];
  if (currentPath === "/tai-khoan") {
    breadcrumbsData.push({ title: "Tài khoản", route: "" });
  } else if (breadcrumbNameMap[currentPath]) {
    breadcrumbsData.push(
      { title: "Tài khoản", route: "/tai-khoan" },
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
    <div className="min-h-screen bg-white text-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumbs data={breadcrumbsData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Sidebar Bên Trái */}
          <div className="md:col-span-3 pr-0 md:pr-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 mb-2">
              Trang tài khoản
            </h2>

            <p className="text-sm font-medium text-slate-700 mb-6">
              Xin chào,{" "}
              <span className="text-blue-600 font-bold">
                {user?.full_name || "khách hàng"} !
              </span>
            </p>

            <nav className="space-y-3 text-sm font-medium">
              <div>
                <NavLink
                  to="/tai-khoan"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-bold block"
                      : "text-slate-700 hover:text-blue-600 transition-colors block"
                  }
                >
                  Thông tin tài khoản
                </NavLink>
              </div>

              <div>
                <NavLink
                  to="/tai-khoan/dia-chi"
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-bold block"
                      : "text-slate-700 hover:text-blue-600 transition-colors block"
                  }
                >
                  Sổ địa chỉ (1)
                </NavLink>
              </div>

              <div>
                <NavLink
                  to="/tai-khoan/don-hang"
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-bold block"
                      : "text-slate-700 hover:text-blue-600 transition-colors block"
                  }
                >
                  Đơn hàng
                </NavLink>
              </div>

              <div>
                <NavLink
                  to="/tai-khoan/dat-lai-mat-khau"
                  className={({ isActive }) =>
                    isActive
                      ? "text-blue-600 font-bold block"
                      : "text-slate-700 hover:text-blue-600 transition-colors block"
                  }
                >
                  Đổi mật khẩu
                </NavLink>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogoutClick}
                  className="text-red-600 hover:text-red-700 transition-colors font-medium text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            </nav>
          </div>

          {/* Nội dung bên phải */}
          <div className="md:col-span-9 md:border-l md:border-slate-200 md:pl-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Đăng Xuất */}
      <Confirm
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        message="Bạn có chắc chắn muốn rời khỏi hệ thống không?"
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
