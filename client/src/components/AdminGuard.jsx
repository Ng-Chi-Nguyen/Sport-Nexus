// components/AdminGuard.jsx
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const localUserData = localStorage.getItem("user");

  // 1. Nếu chưa đăng nhập -> Che giấu bằng cách đá về 404
  if (!localUserData) {
    return <Navigate to="/404-not-found" replace />;
  }

  try {
    const user = JSON.parse(localUserData);

    // 2. Nếu là khách hàng thường (customer) -> Đá về 404 để giả vờ trang này không tồn tại
    if (!user.role || user.role.slug === "customer") {
      return <Navigate to="/404-not-found" replace />;
    }

    // 3. Nếu là Admin hợp lệ -> Cho phép truy cập
    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/404-not-found" replace />;
  }
};

export default AdminGuard;
