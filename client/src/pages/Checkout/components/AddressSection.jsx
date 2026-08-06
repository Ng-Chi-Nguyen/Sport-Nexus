import { MapPin, Home } from "lucide-react";
import ProvinceSelect from "@/components/ui/ProvinceSelect";
import { LabelInput } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const AddressSection = ({
  provinces,
  provinceCode,
  onProvinceChange,
  wards,
  wardCode,
  onWardChange,
  detailAddress,
  onDetailAddressChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative z-30 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4 transition-colors duration-200">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
        <MapPin size={16} />
        {t("shipping_address")}
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
        label={t("detail_address_label")}
        value={detailAddress}
        onChange={onDetailAddressChange}
        placeholder={t("detail_address_placeholder")}
        rightElement={<Home size={16} />}
        square
      />
    </div>
  );
};

export default AddressSection;
