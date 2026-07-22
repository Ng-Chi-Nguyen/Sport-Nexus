import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";
import axiosClient from "@/lib/axiosClient";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      ShowToast("error", "Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosClient.post("auth/change-password", {
        current_password: form.current_password,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });

      if (res?.success) {
        ShowToast("success", "Đổi mật khẩu thành công!");
        navigate("/tai-khoan");
      } else {
        ShowToast("error", res?.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Lỗi khi đổi mật khẩu!",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPass = (field, label, minLength) => (
    <LabelInput
      id={field}
      label={label}
      type={show[field] ? "text" : "password"}
      required
      minLength={minLength}
      value={form[field]}
      onChange={handleChange(field)}
      rightElement={
        <button type="button" onClick={() => toggleShow(field)} tabIndex={-1}>
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );

  return (
    <div className="max-w-2xl font-sans select-none">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Đổi mật khẩu
          </h2>
          <p className="text-xs text-slate-500">
            Cập nhật mật khẩu đăng nhập tài khoản của bạn
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {renderPass("current_password", "Mật khẩu hiện tại")}
        {renderPass("new_password", "Mật khẩu mới", 6)}
        {renderPass("confirm_password", "Xác nhận mật khẩu mới", 6)}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <BtnSave loading={loading} className="flex-1">
            Đổi mật khẩu
          </BtnSave>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
