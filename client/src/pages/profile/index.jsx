import Breadcrumbs from "@/components/ui/breadcrumbs";
// image
import logoDefault from "@/assets/images/logodefault.jpg";
import {
  CircleCheck,
  FileUser,
  ListOrdered,
  LogOut,
  MapPinHouse,
  RotateCcwKey,
  ShieldOff,
} from "lucide-react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { Confirm } from "@/components/ui/confirm";
import authApi from "@/api/auth/auth";
import { toast } from "sonner";

const breadcrumbNameMap = {
  "/profile": "Tài khoản",
  "/profile/address": "Địa chỉ",
  "/profile/order": "Đơn hàng",
  "/profile/reset-password": "Đổi mật khẩu",
  "/profile/edit": "Chỉnh sữa thông tin tài khoản",
};

const menuProfile = [
  {
    name: "Hồ sơ",
    path: "/profile",
    exact: true,
    icon: <FileUser color="#112aee" size={15} />,
  },
  {
    name: "Địa chỉ",
    path: "/profile/address",
    exact: false,
    icon: <MapPinHouse color="#112aee" size={15} />,
  },
  {
    name: "Đơn hàng",
    path: "/profile/order",
    exact: false,
    icon: <ListOrdered color="#112aee" size={15} />,
  },
  {
    name: "Đổi mật khẩu",
    path: "/profile/reset-password",
    exact: false,
    icon: <RotateCcwKey color="#112aee" size={15} />,
  },
];

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const base = [{ title: "Trang chủ", route: "/" }];
  const currentPath = location.pathname;

  let breadcrumbsData = [...base];

  if (currentPath === "/profile") {
    breadcrumbsData.push({ title: "Tài khoản", route: "" });
  } else if (breadcrumbNameMap[currentPath]) {
    // Nếu là trang con, thêm cả "Hồ sơ cá nhân" và trang hiện tại
    breadcrumbsData.push(
      { title: "Tài khoản", route: "/profile" },
      { title: breadcrumbNameMap[currentPath], route: "" }
    );
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    await authApi.logout(user.id);
    setIsLogoutModalOpen(false);
    toast.success("Đăng xuất thành công. Hẹn gặp lại bạn!");
    navigate("/auth/login");
  };

  return (
    <div className="">
      <Breadcrumbs data={breadcrumbsData} />
      <div className="flex">
        <div className="relative z-1 overflow-hidden w-[30%] p-3 bg-white border border-[#ddd] mr-5">
          <div className="absolute w-[300px] h-[300px] bg-primary rotate-[45deg] -right-[100px] -top-[50px] z-0 rounded-[30px] shadow-[5px_5px_10px_rgba(0,0,0,0.08)]"></div>
          <div className="relative z-10">
            <div className="border-b border-solid border-gray-400 pb-3 z-10">
              <div className="border-4 border-primary w-[150px] overflow-hidden h-auto rounded-[50%] mx-auto">
                <img
                  src={user.avatar ? user.avatar : logoDefault}
                  alt="avatar"
                />
              </div>
              <p className="text-center mt-1 text-[22px] uppercase font-black">
                {user.full_name}
              </p>
              <div className="bg-[#4facf3] text-center border-2 border-[#323232] text-[#FFF] uppercase w-[60%] font-black italic mx-auto py-[2px] px-2 mt-3 text-[14px]">
                {user.role.name}
              </div>
            </div>
            <div className="bg-blue-100 border-2 border-b-[#4facf3]">
              <div className="flex ml-7 mr-3">
                <p className="font-bold">Trạng thái: </p>
                <span className="ml-2 text-blue-600 font-bold">
                  {user.status ? (
                    <div className="flex items-center">
                      <p className="mr-1">Hoạt động</p>
                      <span>
                        <CircleCheck color="#2b3beeff" size={17} />
                      </span>
                    </div>
                  ) : (
                    "Đã khóa"
                  )}
                </span>
              </div>
              <div className="flex ml-7 mr-3">
                <p className="font-bold">Xác thực: </p>
                <span className="ml-2 text-red-400 font-bold  mt-0">
                  {user.is_verified ? (
                    <div className="flex items-center">
                      <p className="mr-1 text-[#2bee38]">Đã xác thực</p>
                      <span>
                        <CircleCheck color="#2bee38" size={17} />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="mr-1">Chưa xác thực </p>
                      <span>
                        <ShieldOff color="#ee2b2b" size={17} />
                      </span>
                    </div>
                  )}
                </span>
              </div>
            </div>
            <div className="">
              <ul className="px-[30px] pt-[10px]">
                {menuProfile.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact} // Áp dụng end cho trang chủ Profile
                      className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-1 transition-all border-2 border-transparent
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-[#4facf3] font-bold"
                        : "text-gray-500 hover:bg-gray-100 hover:text-blue-500"
                    }
                  `}
                    >
                      {item.icon}
                      <span className="text-[14px]">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-1 transition-all border-l-2 border-transparent text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-l-red-500"
                  >
                    <LogOut size={15} color="#ee1111" />
                    <span className="text-[14px] text-[#ee1111]">
                      Đăng xuất
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="relative z-1 w-[70%] border border-[#ddd] overflow-hidden">
          <div className="absolute w-[300px] h-[300px] bg-primary rotate-[45deg] -left-[215px] -top-[50px] z-0 rounded-[30px] shadow-[5px_5px_10px_rgba(0,0,0,0.08)]"></div>
          <div className="absolute w-[300px] h-[300px] bg-primary rotate-[45deg] -right-[100px] bottom-[40px] z-0 rounded-[30px] shadow-[5px_5px_10px_rgba(0,0,0,0.08)]"></div>
          <div className="z-10 p-4">
            <Outlet />
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
