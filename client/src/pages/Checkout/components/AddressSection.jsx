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
  <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
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
    />

    <LabelInput
      label="Địa chỉ chi tiết"
      value={detailAddress}
      onChange={onDetailAddressChange}
      placeholder="Số nhà, tên đường"
      rightElement={<Home size={16} />}
    />
  </div>
);

export default AddressSection;
