import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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
      <LabelInput
        id="full_name"
        name="full_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Họ và tên"
        required
      />

      <LabelInput
        id="email"
        name="email"
        label="Địa chỉ Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <LabelInput
        id="password"
        name="password"
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

      <LabelInput
        id="phone_number"
        name="phone_number"
        label="Số điện thoại"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <BtnSave
        loading={loading}
        className="!w-full !py-3 !rounded-xl !text-sm"
      >
        Đăng ký ngay
      </BtnSave>

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
