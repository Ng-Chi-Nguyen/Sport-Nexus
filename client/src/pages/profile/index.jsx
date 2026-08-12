import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Confirm } from "@/components/ui/confirm";
import authApi from "@/api/auth/auth";
import ShowToast from "@/components/ui/toast";
import { breadcrumbNameMap } from "@/constants/web/profile";
import { clearAuth } from "@/lib/authStorage";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t: tProfile } = useTranslation("translation", {
    keyPrefix: "profile",
  });
  const { t: tAddress } = useTranslation("translation", {
    keyPrefix: "address",
  });
  const { t: tOrder } = useTranslation("translation", { keyPrefix: "order" });
  const { t: tPassword } = useTranslation("translation", {
    keyPrefix: "change_password",
  });

  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const base = [{ title: tProfile("home", "Trang chủ"), route: "/" }];
  const currentPath = location.pathname;

  let breadcrumbsData = [...base];
  if (currentPath === "/tai-khoan") {
    breadcrumbsData.push({
      title: tProfile("account", "Tài khoản"),
      route: "",
    });
  } else if (breadcrumbNameMap[currentPath]) {
    breadcrumbsData.push(
      { title: tProfile("account", "Tài khoản"), route: "/tai-khoan" },
      { title: breadcrumbNameMap[currentPath], route: "" },
    );
  }

  const handleLogoutClick = () => setIsLogoutModalOpen(true);

  const confirmLogout = async () => {
    try {
      ShowToast("dismiss");
      if (user?.id) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      console.error("Lỗi API logout:", error);
    } finally {
      clearAuth();
      setIsLogoutModalOpen(false);
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="mb-6 mt-10">
          <Breadcrumbs data={breadcrumbsData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Bên Trái */}
          <div className="md:col-span-3 pr-0 md:pr-4">
            <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md sticky top-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100 mb-1">
                  {tProfile("account_page", "Trang tài khoản")}
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {tProfile("hello", "Xin chào, {{name}}", {
                    name: user?.full_name || tProfile("guest", "khách hàng"),
                  })}{" "}
                  !
                </p>
              </div>

              <nav className="space-y-2 text-sm font-medium">
                <div>
                  <NavLink
                    to="/tai-khoan"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
                        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
                    }
                  >
                    {tProfile("account_info", "Thông tin tài khoản")}
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    to="/tai-khoan/dia-chi"
                    className={({ isActive }) =>
                      isActive
                        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
                        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
                    }
                  >
                    {tAddress("address_book", "Sổ địa chỉ")}
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    to="/tai-khoan/thanh-vien"
                    className={({ isActive }) =>
                      isActive
                        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
                        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
                    }
                  >
                    {tProfile("membership")}
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    to="/tai-khoan/don-hang"
                    className={({ isActive }) =>
                      isActive
                        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
                        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
                    }
                  >
                    {tOrder("orders", "Đơn hàng")}
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    to="/tai-khoan/dat-lai-mat-khau"
                    className={({ isActive }) =>
                      isActive
                        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
                        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
                    }
                  >
                    {tPassword("change_password", "Đổi mật khẩu")}
                  </NavLink>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full text-left text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium text-sm px-3 py-2 rounded-xl cursor-pointer"
                  >
                    {tProfile("logout", "Đăng xuất")}
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="md:col-span-9">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Đăng Xuất */}
      <Confirm
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        message={tProfile(
          "logout_confirm_message",
          "Bạn có chắc chắn muốn rời khỏi hệ thống không?",
        )}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
