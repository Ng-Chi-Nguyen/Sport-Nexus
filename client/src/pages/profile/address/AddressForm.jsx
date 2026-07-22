import { useState } from "react";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ProvinceSelect from "@/components/ui/ProvinceSelect";
import TypeSelect from "@/components/ui/TypeSelect";
import addressData from "@/assets/data/addressVN_afterUpdate.json";

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
  const [form, setForm] = useState(initialData || emptyForm);

  const selectedProvince = addressData.find((p) => p.Code === form.province);
  const wards = selectedProvince ? selectedProvince.Wards : [];

  const set = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.recipient_name.trim()) {
      alert("Vui lòng nhập tên người nhận");
      return;
    }
    if (!/^\d{10}$/.test(form.recipient_phone)) {
      alert("Số điện thoại phải gồm 10 chữ số");
      return;
    }
    if (!form.province) {
      alert("Vui lòng chọn Tỉnh/Thành phố");
      return;
    }
    if (!form.ward) {
      alert("Vui lòng chọn Phường/Xã");
      return;
    }
    if (!form.detail_address.trim()) {
      alert("Vui lòng nhập địa chỉ chi tiết");
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
          label="Họ tên người nhận"
          required
          value={form.recipient_name}
          onChange={(e) => set("recipient_name")(e.target.value)}
          placeholder="Nguyễn Văn A"
        />

        <LabelInput
          label="Số điện thoại"
          required
          type="tel"
          value={form.recipient_phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) set("recipient_phone")(val);
          }}
          placeholder="0912345678"
        />

        <div className="sm:col-span-2">
          <ProvinceSelect
            provinces={addressData}
            provinceValue={form.province}
            onProvinceChange={set("province")}
            wards={wards}
            wardValue={form.ward}
            onWardChange={set("ward")}
          />
        </div>

        <div className="sm:col-span-2">
          <LabelInput
            label="Địa chỉ chi tiết"
            required
            value={form.detail_address}
            onChange={(e) => set("detail_address")(e.target.value)}
            placeholder="Số nhà, tên đường, khu vực..."
          />
        </div>
      </div>

      <div className="flex items-end gap-4 flex-wrap">
        <TypeSelect value={form.type} onChange={set("type")} />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => set("is_default")(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-bold text-slate-700 uppercase">
            Đặt làm mặc định
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <BtnSave loading={saving}>
          Lưu
        </BtnSave>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
