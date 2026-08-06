import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AddressForm from "@/pages/profile/address/AddressForm";
import ShowToast from "@/components/ui/toast";
import addressApi from "@/api/customer/addressApi";
import { useTranslation } from "react-i18next";

const AddAddress = () => {
  const { t } = useTranslation("translation", { keyPrefix: "address" });
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
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate("/tai-khoan/dia-chi")}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t("back")}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            {t("add_new_address_title", "Thêm địa chỉ mới")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("add_new_address_desc")}
          </p>
        </div>
      </div>

      <div className="max-w-xl bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
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
