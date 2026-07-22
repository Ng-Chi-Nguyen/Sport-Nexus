import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AddressForm from "@/pages/profile/address/AddressForm";
import ShowToast from "@/components/ui/toast";
import addressApi from "@/api/customer/addressApi";

const AddAddress = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await addressApi.create({ ...payload, user_id: user.id });
      ShowToast("success", "Thêm địa chỉ thành công");
      navigate("/tai-khoan/dia-chi");
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Thêm địa chỉ thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate("/tai-khoan/dia-chi")}
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Thêm địa chỉ mới
          </h2>
          <p className="text-xs text-slate-500">
            Thêm địa chỉ giao hàng cho tài khoản của bạn
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <AddressForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/tai-khoan/dia-chi")}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default AddAddress;
