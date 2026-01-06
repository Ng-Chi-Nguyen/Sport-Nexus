import { useState } from "react";
import { FacebookIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// components
import { FloatingInput } from "@/components/ui/input";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ShowToast from "@/components/ui/toast";
import { FloatingInputPassword } from "@/components/ui/input";
// api
import authApi from "@/api/auth/auth";

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
  const navigate = useNavigate();
  // state login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      username: username,
      password: password,
    };
    // console.log(formData);
    try {
      const response = await authApi.login(formData);
      // console.log(response);
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", user.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        ShowToast("success", "Chào mừng " + user.full_name);
        navigate("/");
      }
    } catch (error) {
      // console.log(error);
      ShowToast("error", error.response.data.message);
    }
  };

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
            Sport Nexus
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              id="email"
              label="Địa chỉ Email / Số điện thoại"
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FloatingInputPassword
              id="password"
              label="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <p className="text-gray-500 text-sm my-2 text-center font-medium">
            Hoặc
          </p>
          <div className="flex justify-center mt-3 gap-2">
            <Link
              to=""
              className="p-2 bg-[#4facf3] border-2 border-[#323232] shadow-[3px_3px_0px_0px_#323232] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <FacebookIcon size={20} className="text-white" />
            </Link>
            <Link
              to=""
              className="p-2 bg-[#4facf3] border-2 border-[#323232] shadow-[3px_3px_0px_0px_#323232] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Đường nét vẽ biểu tượng chữ G đơn giản */}
                <path d="M12 12h8.5" />
                <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
