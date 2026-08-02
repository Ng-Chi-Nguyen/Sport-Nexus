import { MapPin, Home } from "lucide-react";
import ProvinceSelect from "@/components/ui/ProvinceSelect";
import { LabelInput } from "@/components/ui/input";

const AddressSection = ({
  provinces,
  provinceCode,
  onProvinceChange,
  wards,
  wardCode,
  onWardChange,
  detailAddress,
  onDetailAddressChange,
}) => (
  <div className="relative z-30 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
      <MapPin size={16} />
      Địa chỉ giao hàng
    </h2>

    <ProvinceSelect
      provinces={provinces}
      provinceValue={provinceCode}
      onProvinceChange={onProvinceChange}
      wards={wards}
      wardValue={wardCode}
      onWardChange={onWardChange}
      square
    />

    <LabelInput
      label="Địa chỉ chi tiết"
      value={detailAddress}
      onChange={onDetailAddressChange}
      placeholder="Số nhà, tên đường"
      rightElement={<Home size={16} />}
      square
    />
  </div>
);

export default AddressSection;
