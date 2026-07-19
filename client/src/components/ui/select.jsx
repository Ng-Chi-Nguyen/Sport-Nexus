import { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import countryData from "@/assets/data/countries.json";
import addressData from "@/assets/data/addressVN_afterUpdate.json";

// 1. COMPONENT SELECT TIÊU CHUẨN (Hỗ trợ cấu trúc Object & Array)
// Đã được tối ưu bỏ min-width để co giãn tự nhiên trong ô lọc hàng ngang
const Select = ({
  options,
  value,
  onChange,
  placeholder = "Chọn một mục",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const safeOptions = useMemo(() => {
    if (Array.isArray(options)) return options;
    if (options && typeof options === "object") {
      return Object.entries(options).map(([key, val]) => ({
        slug: key,
        name: val,
      }));
    }
    return [];
  }, [options]);

  const selectedOption = safeOptions.find((opt) => opt.slug === value);

  return (
    <div
      className={`relative w-full cursor-pointer text-slate-200 font-medium transition-all ${
        isOpen ? "z-[9999] overflow-visible" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* NHÃN (LABEL) */}
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-[#0D121F] px-1.5 font-semibold text-[11px] transition-all duration-200 z-[120] tracking-wide ${
            isOpen ? "text-sky-400" : "text-slate-500"
          }`}
        >
          {label} <span className="text-rose-500">*</span>
        </label>
      )}

      {/* TRIGGER KHUNG BẤM (Cố định chiều cao h-10 để đồng bộ hàng ngang) */}
      <div
        className={`bg-[#111827]/40 h-10 px-3 rounded-lg relative z-[100] text-sm flex items-center justify-between border transition-all duration-200 ${
          isOpen
            ? "border-sky-500/50 bg-[#161F32]/60 shadow-[0_0_15px_rgba(14,165,233,0.08)]"
            : "border-slate-800"
        }`}
      >
        <span
          className={`truncate mr-2 ${selectedOption ? "text-slate-200" : "text-slate-500"}`}
        >
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-sky-400" : "rotate-0 text-slate-500"
          }`}
        />
      </div>

      {/* DROPDOWN MENU CON TRONG SUỐT GLASS (z-[9999] bảo đảm nổi trên table) */}
      <div
        className={`flex flex-col rounded-xl p-1 bg-[#111827]/95 border border-slate-800 shadow-2xl absolute left-0 w-full transition-all duration-200 max-h-[260px] overflow-y-auto custom-scrollbar backdrop-blur-xl ${
          isOpen
            ? "opacity-100 top-[calc(100%+4px)] visible translate-y-0 z-[9999]"
            : "opacity-0 top-[calc(100%-8px)] invisible pointer-events-none -translate-y-1 z-[-1]"
        }`}
      >
        {safeOptions.map((option) => (
          <div
            key={option.slug}
            onClick={() => {
              onChange(option.slug);
              setIsOpen(false);
            }}
            className={`rounded-lg p-[8px_12px] text-xs transition-colors duration-150 w-full cursor-pointer whitespace-nowrap ${
              value === option.slug
                ? "text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20"
                : "text-slate-400 hover:bg-[#161F32] hover:text-slate-100"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. COMPONENT SELECTPRO CHUYÊN DỤNG (Hỗ trợ cấu trúc object { id, name })
const SelectPro = ({ options = [], label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options?.find((opt) => opt.id === value);

  return (
    <div
      className={`relative w-full h-[42px] cursor-pointer text-slate-200 font-medium transition-all ${
        isOpen ? "z-[9999] overflow-visible" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-[#0D121F] px-1.5 font-semibold text-[11px] transition-all duration-200 z-[120] tracking-wide ${
            isOpen ? "text-sky-400" : "text-slate-500"
          }`}
        >
          {label} <span className="text-rose-500">*</span>
        </label>
      )}

      <div
        className={`bg-[#111827]/40 p-[11px_15px] h-full rounded-xl relative z-[100] text-sm flex items-center justify-between border transition-all duration-200 ${
          isOpen
            ? "border-sky-500/50 bg-[#161F32]/60 shadow-[0_0_15px_rgba(14,165,233,0.08)]"
            : "border-slate-800"
        }`}
      >
        <span
          className={`truncate mr-4 ${selectedOption ? "text-slate-200" : "text-slate-600"}`}
        >
          {selectedOption ? selectedOption.name : "Chọn..."}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-sky-400" : "rotate-0 text-slate-500"
          }`}
        />
      </div>

      <div
        className={`flex flex-col rounded-xl p-1 bg-[#111827]/95 border border-slate-800 shadow-2xl absolute left-0 w-full transition-all duration-200 max-h-[260px] overflow-y-auto custom-scrollbar backdrop-blur-xl ${
          isOpen
            ? "opacity-100 top-[calc(100%+4px)] visible translate-y-0 z-[9999]"
            : "opacity-0 top-[calc(100%-8px)] invisible pointer-events-none -translate-y-1"
        }`}
      >
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => {
              if (onChange) onChange(option.id);
              setIsOpen(false);
            }}
            className={`rounded-lg p-[8px_12px] text-xs transition-colors duration-150 w-full cursor-pointer whitespace-nowrap ${
              value === option.id
                ? "text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20"
                : "text-slate-400 hover:bg-[#161F32] hover:text-slate-100"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. COMPONENT CHỌN QUỐC GIA (XUẤT XỨ)
const CountrySelect = ({ value, onChange, label = "Xuất xứ" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedName = useMemo(() => {
    const found = countryData.find((c) => c.name === value);
    return found ? found.name : "Chọn quốc gia...";
  }, [value]);

  return (
    <div
      className={`relative w-full min-w-[240px] cursor-pointer text-slate-200 font-medium transition-all ${
        isOpen ? "z-[9999] overflow-visible" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-[#0D121F] px-1.5 font-semibold text-[11px] transition-all duration-200 z-[120] tracking-wide ${
            isOpen ? "text-sky-400" : "text-slate-500"
          }`}
        >
          {label} <span className="text-rose-500">*</span>
        </label>
      )}

      <div
        className={`bg-[#111827]/40 p-[11px_15px] rounded-xl relative z-[100] text-sm flex items-center justify-between border transition-all duration-200 ${
          isOpen
            ? "border-sky-500/50 bg-[#161F32]/60 shadow-[0_0_15px_rgba(14,165,233,0.08)]"
            : "border-slate-800"
        }`}
      >
        <span
          className={`truncate mr-2 ${value ? "text-slate-200" : "text-slate-600"}`}
        >
          {selectedName}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-sky-400" : "rotate-0 text-slate-500"
          }`}
        />
      </div>

      <div
        className={`flex flex-col rounded-xl p-1 bg-[#111827]/95 border border-slate-800 shadow-2xl absolute left-0 w-full transition-all duration-200 max-h-[260px] overflow-y-auto custom-scrollbar backdrop-blur-xl ${
          isOpen
            ? "opacity-100 top-[calc(100%+4px)] visible translate-y-0 z-[9999]"
            : "opacity-0 top-[calc(100%-8px)] invisible pointer-events-none -translate-y-1"
        }`}
      >
        {countryData.map((country, index) => (
          <div
            key={index}
            onClick={() => {
              onChange(country.name);
              setIsOpen(false);
            }}
            className={`rounded-lg p-[8px_12px] text-xs transition-colors duration-150 w-full cursor-pointer whitespace-nowrap ${
              value === country.name
                ? "text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20"
                : "text-slate-400 hover:bg-[#161F32] hover:text-slate-100"
            }`}
          >
            {country.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. COMPONENT ĐỊA CHỈ VIỆT NAM LIÊN KẾT (TỈNH/THÀNH - PHƯỜNG/XÃ)
const AddressSelector = ({ onAddressChange, initialProvince, initialWard }) => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    if (initialProvince) {
      const cleanInitialProvince = initialProvince
        .toLowerCase()
        .replace("tp.", "")
        .replace("thành phố", "")
        .replace("tỉnh", "")
        .trim();

      const foundProvince = addressData.find((p) => {
        const pName = p.FullName.toLowerCase();
        return (
          pName.includes(cleanInitialProvince) ||
          cleanInitialProvince.includes(pName)
        );
      });

      if (foundProvince) {
        setSelectedProvince(foundProvince.Code);

        if (initialWard) {
          const lowerWard = initialWard.toLowerCase().trim();
          const searchVariants = [lowerWard];

          const stripped = lowerWard
            .replace(/^(quận|huyện|phường|xã|thị trấn)\s+/i, "")
            .trim();
          if (stripped && stripped !== lowerWard) searchVariants.push(stripped);

          const matchInList = (list) =>
            list?.find((item) =>
              searchVariants.some((v) => {
                const name = item.FullName.toLowerCase();
                return name.includes(v) || v.includes(name);
              }),
            );

          const foundItem =
            matchInList(foundProvince.Districts) ||
            matchInList(
              foundProvince.Districts
                ? foundProvince.Districts.flatMap((d) => d.Wards || [])
                : foundProvince.Wards,
            );

          if (foundItem) setSelectedWard(foundItem.Code);
        }
      }
    }
  }, [initialProvince, initialWard]);

  const provinceOptions = useMemo(() => {
    return addressData.map((p) => ({
      slug: p.Code,
      name: p.FullName,
    }));
  }, []);

  const wardOptions = useMemo(() => {
    const province = addressData.find((p) => p.Code === selectedProvince);
    if (!province) return [];

    const listItems =
      province.Districts && province.Districts.length > 0
        ? province.Districts
        : province.Wards || [];

    return listItems.map((item) => ({
      slug: item.Code,
      name: item.FullName,
    }));
  }, [selectedProvince]);

  useEffect(() => {
    const provinceObj = addressData.find((p) => p.Code === selectedProvince);
    if (!provinceObj) return;

    let allItems =
      provinceObj.Districts && provinceObj.Districts.length > 0
        ? provinceObj.Districts
        : provinceObj.Wards || [];

    if (provinceObj.Districts) {
      allItems = [
        ...allItems,
        ...provinceObj.Districts.flatMap((d) => d.Wards || []),
      ];
    }

    const wardObj = allItems.find((w) => w.Code === selectedWard);

    if (onAddressChange && selectedProvince) {
      onAddressChange({
        province: provinceObj?.FullName || "",
        ward: wardObj?.FullName || "",
        provinceCode: selectedProvince,
        wardCode: selectedWard,
      });
    }
  }, [selectedProvince, selectedWard, onAddressChange]);

  return (
    <div className="flex gap-4 w-full">
      <div className="flex-1">
        <Select
          label="Tỉnh / Thành phố"
          options={provinceOptions}
          value={selectedProvince}
          onChange={(val) => {
            setSelectedProvince(val);
            setSelectedWard("");
          }}
        />
      </div>

      <div className="flex-1">
        <Select
          label="Phường / Xã"
          options={wardOptions}
          value={selectedWard}
          placeholder={
            selectedProvince ? "Chọn Phường / Xã" : "Vui lòng chọn Tỉnh"
          }
          onChange={(val) => setSelectedWard(val)}
        />
      </div>
    </div>
  );
};

const SimpleSelect = ({
  options,
  value,
  onChange,
  placeholder = "Chọn một mục",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Chuẩn hóa dữ liệu đầu vào (hỗ trợ cả Array và Object)
  const safeOptions = useMemo(() => {
    if (Array.isArray(options)) return options;
    if (options && typeof options === "object") {
      return Object.entries(options).map(([key, val]) => ({
        slug: key,
        name: val,
      }));
    }
    return [];
  }, [options]);

  const selectedOption = safeOptions.find((opt) => opt.slug === value);

  return (
    <div
      className={`relative w-full cursor-pointer text-slate-200 font-medium transition-all ${
        isOpen ? "z-[9999] overflow-visible" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* NHÃN BÊN TRÊN */}
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-[#0D121F] px-1.5 font-semibold text-[11px] transition-all duration-200 z-[120] tracking-wide ${
            isOpen ? "text-sky-400" : "text-slate-500"
          }`}
        >
          {label}
        </label>
      )}

      {/* KHUNG BẤM CHÍNH (Chiều cao h-10 đồng bộ các ô lọc khác) */}
      <div
        className={`bg-[#111827]/40 h-10 px-3 rounded-lg relative z-[100] text-sm flex items-center justify-between border transition-all duration-200 ${
          isOpen
            ? "border-sky-500/50 bg-[#161F32]/60 shadow-[0_0_15px_rgba(14,165,233,0.08)]"
            : "border-slate-800"
        }`}
      >
        <span
          className={`truncate mr-2 ${selectedOption ? "text-slate-200" : "text-slate-500"}`}
        >
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-sky-400" : "rotate-0 text-slate-500"
          }`}
        />
      </div>

      {/* DANH SÁCH DROPDOWN MENU (Hiển thị đè lên bảng bên dưới nhờ z-[9999]) */}
      <div
        className={`flex flex-col rounded-lg p-1 bg-[#111827]/98 border border-slate-800/80 shadow-2xl absolute left-0 w-full transition-all duration-200 max-h-[260px] overflow-y-auto custom-scrollbar backdrop-blur-xl ${
          isOpen
            ? "opacity-100 top-[calc(100%+4px)] visible translate-y-0 z-[9999]"
            : "opacity-0 top-[calc(100%-8px)] invisible pointer-events-none -translate-y-1 z-[-1]"
        }`}
      >
        {safeOptions.map((option) => (
          <div
            key={option.slug}
            onClick={() => {
              onChange(option.slug);
              setIsOpen(false);
            }}
            className={`rounded px-3 py-2 text-xs transition-colors duration-150 w-full cursor-pointer whitespace-nowrap ${
              value === option.slug
                ? "text-slate-100 font-semibold bg-slate-800/80"
                : "text-slate-400 hover:bg-[#161F32] hover:text-slate-200"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Select, CountrySelect, AddressSelector, SelectPro, SimpleSelect };
