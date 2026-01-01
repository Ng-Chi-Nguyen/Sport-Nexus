import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// components
import { FloatingInput, FloatingInputPassword } from "@/components/ui/input";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ShowToast from "@/components/ui/toast";
// api
import authApi from "@/api/auth/auth";
import { toast } from "sonner";

const breadcrumbsData = [
  {
    title: "Trang chủ",
    route: "/",
  },
  {
    title: "Đăng ký",
    route: "",
  },
];

const RegisterForm = () => {
  const navigate = useNavigate();
  // state value register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      full_name: name,
      email: email,
      password: password,
      phone_number: phone,
    };
    try {
      const response = await authApi.create(formData);
      // console.log(response);
      if (response.success) {
        ShowToast("success", response.message);
        navigate("/auth/login");
      }
    } catch (error) {
      ShowToast("error", error.response.data.message);
    }
  };

  return (
    <div className="bg-gray-100">
      <Breadcrumbs data={breadcrumbsData} />
      {/* Container chính với phong cách Sport Nexus */}
      <div className="relative w-full max-w-[400px] bg-white p-8 shadow-[0px_0px_40px_rgba(0,0,0,0.06)] overflow-hidden rounded-lg">
        {/* Khối hình học trang trí ở nền */}
        <div className="absolute w-[300px] h-[300px] bg-[#e6f4fe] rotate-[45deg] -left-[150px] -bottom-[50px] z-0 rounded-[30px] shadow-[5px_5px_10px_rgba(0,0,0,0.08)]"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-[#323232] mb-2 uppercase tracking-tight text-center">
            ĐĂNG KÝ
          </h2>
          <p className="text-gray-500 text-sm mb-8 text-center font-medium">
            Tạo tài khoản mới cho Sport Nexus
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sử dụng component FloatingInput của bạn */}
            <FloatingInput
              id="full_name" // Bổ sung ID
              name="full_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Họ và tên"
              required
            />

            <FloatingInput
              id="email"
              name="email"
              label="Địa chỉ Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FloatingInputPassword
              id="password"
              name="password"
              label="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FloatingInput
              id="phone_number"
              name="phone_number"
              label="Số điện thoại"
              type="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-[#4facf3] hover:bg-[#3d9bdb] text-white font-black py-4 rounded-lg 
                         uppercase tracking-[2px] shadow-[0px_4px_0px_0px_#323232] 
                         active:translate-y-1 active:shadow-none transition-all duration-75"
            >
              Đăng ký ngay
            </button>

            <div className="text-center mt-6">
              <span className="text-gray-500 text-sm">Đã có tài khoản? </span>
              <Link
                to="/auth/login"
                className="text-[#4facf3] font-bold text-sm hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
