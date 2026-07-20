import { useState } from "react";
import { Facebook, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FloatingInput, FloatingInputPassword } from "@/components/ui/input";
import ShowToast from "@/components/ui/toast";

import authApi from "@/api/auth/auth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <FloatingInput
        id="email"
        label="Email / Số điện thoại"
        type="email"
        required
        light
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <FloatingInputPassword
        id="password"
        label="Mật khẩu"
        required
        light
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="relative w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-[0.15em]
                   bg-gradient-to-r from-orange-500 via-rose-500 to-red-600
                   text-white shadow-[0_4px_20px_rgba(255,107,53,0.3)]
                   hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)]
                   hover:scale-[1.01] active:scale-[0.98]
                   transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        <span>Đăng nhập ngay</span>
      </button>

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
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-gray-200
                     bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300
                     transition-all duration-200 text-xs font-bold uppercase tracking-wider"
        >
          <Facebook size={16} />
          Facebook
        </button>
        <button
          type="button"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-gray-200
                     bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300
                     transition-all duration-200 text-xs font-bold uppercase tracking-wider"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12h8.5" />
            <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
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
