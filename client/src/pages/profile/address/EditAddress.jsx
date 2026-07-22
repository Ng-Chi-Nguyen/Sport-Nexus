import { useState } from "react";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AddressForm from "@/pages/profile/address/AddressForm";
import ShowToast from "@/components/ui/toast";
import addressApi from "@/api/customer/addressApi";

const EditAddress = () => {
  const { initialData, user } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      await addressApi.update(id, { ...payload, user_id: user.id });
      ShowToast("success", "Cập nhật địa chỉ thành công");
      navigate("/tai-khoan/dia-chi");
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Cập nhật thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!initialData || !user) {
    navigate("/tai-khoan/dia-chi");
    return null;
  }

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
            Chỉnh sửa địa chỉ
          </h2>
          <p className="text-xs text-slate-500">
            Cập nhật thông tin địa chỉ giao hàng
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <AddressForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/tai-khoan/dia-chi")}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default EditAddress;
