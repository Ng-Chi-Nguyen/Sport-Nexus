import { useState } from "react";
import { Eye, EyeOff, Facebook } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";

import authApi from "@/api/auth/auth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", user.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        ShowToast("success", "Chào mừng " + user.full_name);
        navigate("/");
      }
    } catch (error) {
      ShowToast("error", error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <LabelInput
        id="email"
        label="Email / Số điện thoại"
        type="email"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <LabelInput
        id="password"
        label="Mật khẩu"
        type={showPass ? "text" : "password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <div className="text-right -mt-3">
        <Link
          to="/auth/quen-mat-khau"
          className="text-xs text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <BtnSave
        loading={loading}
        className="!w-full !py-3 !rounded-xl !text-sm"
      >
        Đăng nhập ngay
      </BtnSave>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-300 font-bold tracking-[0.2em]">
            Hoặc
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider
                     bg-[#1877F2] text-white hover:bg-[#166fe5]
                     shadow-sm hover:shadow-md
                     transition-all duration-200"
        >
          <Facebook size={16} />
          Facebook
        </button>
        <button
          type="button"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider
                     bg-white text-gray-600 border border-gray-200
                     hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800
                     shadow-sm hover:shadow-md
                     transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
      </div>

      <p className="text-center text-gray-400 text-xs">
        Chưa có tài khoản?{" "}
        <Link to="/auth/register" className="text-blue-500 hover:text-blue-600 font-bold hover:underline transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
