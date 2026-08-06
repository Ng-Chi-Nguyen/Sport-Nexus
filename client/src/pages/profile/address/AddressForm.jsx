import { useState } from "react";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ProvinceSelect from "@/components/ui/ProvinceSelect";
import TypeSelect from "@/components/ui/TypeSelect";
import addressData from "@/assets/data/addressVN_afterUpdate.json";
import ShowToast from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

const emptyForm = {
  recipient_name: "",
  recipient_phone: "",
  province: "",
  ward: "",
  detail_address: "",
  type: "home",
  is_default: false,
};

const AddressForm = ({ initialData, onSubmit, onCancel, saving }) => {
  const { t } = useTranslation("translation", { keyPrefix: "address" });
  const [form, setForm] = useState(initialData || emptyForm);

  const selectedProvince = addressData.find((p) => p.Code === form.province);
  const wards = selectedProvince ? selectedProvince.Wards : [];

  const set = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.recipient_name.trim()) {
      ShowToast("error", t("error_name_required"));
      return;
    }
    if (!/^\d{10}$/.test(form.recipient_phone)) {
      ShowToast("error", t("error_phone_invalid"));
      return;
    }
    if (!form.province) {
      ShowToast("error", t("error_province_required"));
      return;
    }
    if (!form.ward) {
      ShowToast("error", t("error_ward_required"));
      return;
    }
    if (!form.detail_address.trim()) {
      ShowToast("error", t("error_detail_required"));
      return;
    }

    const province = addressData.find((p) => p.Code === form.province);
    const ward = wards.find((w) => w.Code === form.ward);

    onSubmit({
      recipient_name: form.recipient_name.trim(),
      recipient_phone: form.recipient_phone,
      location_data: {
        province: {
          name: province?.FullName || "",
          code: parseInt(form.province, 10) || 0,
        },
        ward: {
          name: ward?.FullName || "",
          code: parseInt(form.ward, 10) || 0,
        },
      },
      detail_address: form.detail_address.trim(),
      type: form.type,
      is_default: form.is_default,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LabelInput
          label={t("recipient_name_label")}
          required
          value={form.recipient_name}
          onChange={(e) => set("recipient_name")(e.target.value)}
          placeholder={t("recipient_name_placeholder")}
        />

        <LabelInput
          label={t("recipient_phone_label")}
          required
          type="tel"
          value={form.recipient_phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) set("recipient_phone")(val);
          }}
          placeholder={t("recipient_phone_placeholder")}
        />

        <div className="sm:col-span-2">
          <ProvinceSelect
            provinces={addressData}
            provinceValue={form.province}
            onProvinceChange={set("province")}
            wards={wards}
            wardValue={form.ward}
            onWardChange={set("ward")}
            square
          />
        </div>

        <div className="sm:col-span-2">
          <LabelInput
            label={t("detail_address_label")}
            required
            value={form.detail_address}
            onChange={(e) => set("detail_address")(e.target.value)}
            placeholder={t("detail_address_placeholder")}
          />
        </div>
      </div>

      <div className="flex items-end gap-4 flex-wrap">
        <TypeSelect value={form.type} onChange={set("type")} />
        <label className="flex items-center gap-2 cursor-pointer w-full">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => set("is_default")(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
            {t("set_default")}
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <BtnSave loading={saving}>{t("save_btn")}</BtnSave>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t("cancel_btn")}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
