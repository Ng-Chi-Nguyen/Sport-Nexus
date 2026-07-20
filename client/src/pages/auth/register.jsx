import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FloatingInput, FloatingInputPassword } from "@/components/ui/input";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.create({
        full_name: name,
        email,
        password,
        phone_number: phone,
        slug: "customer",
      });
      if (response.data.success) {
        ShowToast("success", response.data.message);
        navigate("/auth/login");
      }
    } catch (error) {
      ShowToast("error", error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput
        id="full_name"
        name="full_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Họ và tên"
        required
        light
      />

      <FloatingInput
        id="email"
        name="email"
        label="Địa chỉ Email"
        type="email"
        required
        light
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <FloatingInputPassword
        id="password"
        name="password"
        label="Mật khẩu"
        required
        light
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <FloatingInput
        id="phone_number"
        name="phone_number"
        label="Số điện thoại"
        type="tel"
        required
        light
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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
        <span>Đăng ký ngay</span>
      </button>

      <p className="text-center text-gray-400 text-xs pt-2">
        Đã có tài khoản?{" "}
        <Link to="/auth/login" className="text-blue-500 hover:text-blue-600 font-bold hover:underline transition-colors">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
