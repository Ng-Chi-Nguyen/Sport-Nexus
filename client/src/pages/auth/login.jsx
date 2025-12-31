import { Link } from "react-router-dom";
import { FloatingInput } from "@/components/ui/input";
import Breadcrumbs from "@/components/ui/breadcrumbs";

const breadcrumbsData = [
  {
    title: "Trang chủ",
    route: "/",
  },
  {
    title: "Đăng nhập",
    route: "",
  },
];

const LoginForm = () => {
  return (
    <div className="bg-gray-100 pb-[52px] relative">
      <Breadcrumbs data={breadcrumbsData} />
      {/* Container chính với phong cách Sport Nexus */}
      <div className="relative w-full max-w-[400px] bg-white p-8 shadow-[0px_0px_40px_rgba(0,0,0,0.06)] overflow-hidden rounded-lg">
        {/* Khối hình học trang trí ở nền */}
        <div className="absolute w-[300px] h-[300px] bg-[#e6f4fe] rotate-[45deg] -left-[150px] -bottom-[50px] z-0 rounded-[30px] shadow-[5px_5px_10px_rgba(0,0,0,0.08)]"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-[#323232] mb-2 uppercase tracking-tight text-center">
            ĐĂNG NHẬP
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center font-medium">
            Đăng nhập Sport Nexus
          </p>
          <form className="space-y-6">
            {/* Sử dụng component FloatingInput của bạn */}
            <FloatingInput id="fullname" label="Họ và tên" required />

            <FloatingInput
              id="email"
              label="Địa chỉ Email"
              type="email"
              required
            />

            <FloatingInput
              id="password"
              label="Mật khẩu"
              type="password"
              required
            />

            <FloatingInput
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              required
            />

            {/* Nút bấm 3D đồng bộ màu xanh #4facf3 */}
            <button
              type="submit"
              className="w-full bg-[#4facf3] hover:bg-[#3d9bdb] text-white font-black py-4 rounded-lg 
                         uppercase tracking-[2px] shadow-[0px_4px_0px_0px_#323232] 
                         active:translate-y-1 active:shadow-none transition-all duration-75"
            >
              Đăng nhập ngay
            </button>

            <div className="text-center mt-6">
              <span className="text-gray-500 text-sm">Chưa có tài khoản? </span>
              <Link
                to="/auth/register"
                className="text-[#4facf3] font-bold text-sm hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
