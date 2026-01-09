import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import countryData from "@/assets/data/countries.json";
import addressData from "@/assets/data/addressVN_afterUpdate.json";

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
      className={`relative w-fit min-w-[320px] cursor-pointer text-[#323232] font-medium transition-all ${
        /* Khi mở, cả cụm bao gồm cả nhãn sẽ nhảy lên z-9999 */
        isOpen ? "z-[9999]" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* NHÃN (LABEL) - Đưa vào trong để không bao giờ bị mất */}
      {label && (
        <label
          className={`absolute -top-2 left- bg-white px-1 font-bold text-[12px] transition-all duration-300 z-[120] ${
            isOpen ? "text-[#4facf3]" : "text-[#323232]"
          }`}
        >
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      {/* TRIGGER */}
      <div
        className={`bg-white p-[10px] rounded-[5px] relative z-[100] text-[15px] flex items-center justify-between border-2 transition-all duration-300 shadow-[4px_4px_0px_0px_#323232] ${
          isOpen ? "border-[#4facf3]" : "border-[#323232]"
        }`}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#4facf3]" : "rotate-0 text-[#323232]"
          }`}
        />
      </div>

      {/* DROPDOWN MENU */}
      <div
        className={`flex flex-col rounded-[5px] p-[5px] bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#4facf3] absolute left-0 w-full transition-all duration-300 z-[110] max-h-[300px] overflow-y-auto custom-scrollbar ${
          isOpen
            ? "opacity-100 top-[calc(100%+2px)] visible"
            : "opacity-0 top-[calc(100%-10px)] invisible pointer-events-none"
        }`}
      >
        {safeOptions.map((option) => (
          <div
            key={option.slug}
            onClick={() => {
              onChange(option.slug);
              setIsOpen(false);
            }}
            className={`rounded-[4px] p-[10px] text-[14px] transition-colors duration-200 w-full cursor-pointer whitespace-nowrap hover:bg-[#4facf3] hover:text-white ${
              value === option.slug
                ? "text-white font-bold bg-[#4facf3]"
                : "text-[#323232]"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const SelectPro = ({ options = [], label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Tìm option đang được chọn để hiển thị tên ra ngoài
  const selectedOption = options?.find((opt) => opt.id === value);

  return (
    <div
      className="relative border border-gray-500 h-[40px] rounded-[5px]"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <label
        className={`absolute -top-2 left-3 bg-white px-1 font-bold text-[12px] transition-all duration-300 z-[101] ${
          isOpen ? "text-[#4facf3]" : "text-[#323232]"
        }`}
      >
        {label} <span className="text-red-500">*</span>
      </label>

      <div
        className={`relative bg-white p-[10px] rounded-[5px] z-[100] text-[15px] flex items-center justify-between h-full transition-all duration-300 cursor-pointer ${
          isOpen ? "border-[#4facf3]" : "border-[#323232]"
        }`}
      >
        {/* HIỂN THỊ GIÁ TRỊ ĐÃ CHỌN Ở ĐÂY */}
        <span
          className={
            selectedOption ? "text-[#323232] pt-2" : "text-gray-400 py-2"
          }
        >
          {selectedOption ? selectedOption.name : "Chọn..."}
        </span>

        <ChevronDown
          size={15}
          className={`absolute right-2 top-3 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#4facf3]" : "rotate-0 text-[#323232]"
          }`}
        />
      </div>

      {/* Danh sách options */}
      <div
        className={`flex flex-col border border-gray-300 rounded-[5px] p-[5px] bg-white absolute left-0 w-full transition-all duration-300 z-[110] max-h-[300px] custom-scrollbar ${
          isOpen
            ? "opacity-100 top-[calc(100%+2px)] visible"
            : "opacity-0 top-[calc(100%-10px)] invisible pointer-events-none"
        }`}
      >
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => {
              if (onChange) onChange(option.id);
              setIsOpen(false);
            }}
            className={`rounded-[4px] p-[10px] text-[14px] transition-colors duration-200 w-full cursor-pointer whitespace-nowrap hover:bg-[#4facf3] hover:text-white ${
              value === option.id
                ? "text-white font-bold bg-[#4facf3]"
                : "text-[#323232]"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const CountrySelect = ({ value, onChange, label = "Xuất xứ" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Tìm quốc gia đang được chọn để hiển thị tên
  const selectedName = useMemo(() => {
    // value bây giờ là tên nước (ví dụ: "Việt Nam")
    const found = countryData.find((c) => c.name === value);
    return found ? found.name : "Chọn quốc gia...";
  }, [value]);

  return (
    <div
      className={`relative w-full min-w-[320px] cursor-pointer text-[#323232] font-medium transition-all ${
        isOpen ? "z-[9999]" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* NHÃN (LABEL) */}
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-white px-1 font-bold text-[12px] transition-all duration-300 z-[120] ${
            isOpen ? "text-[#4facf3]" : "text-[#323232]"
          }`}
        >
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      {/* KHUNG HIỂN THỊ CHÍNH */}
      <div
        className={`bg-white p-[10px] rounded-[5px] relative z-[100] text-[15px] flex items-center justify-between border-2 transition-all duration-300 shadow-[4px_4px_0px_0px_#323232] ${
          isOpen ? "border-[#4facf3]" : "border-[#323232]"
        }`}
      >
        <span className="truncate mr-2">{selectedName}</span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#4facf3]" : "rotate-0 text-[#323232]"
          }`}
        />
      </div>

      {/* DANH SÁCH DROPDOWN */}
      <div
        className={`flex flex-col rounded-[5px] p-[5px] bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#4facf3] absolute left-0 w-full transition-all duration-300 z-[110] max-h-[300px] overflow-y-auto custom-scrollbar ${
          isOpen
            ? "opacity-100 top-[calc(100%+2px)] visible"
            : "opacity-0 top-[calc(100%-10px)] invisible pointer-events-none"
        }`}
      >
        {countryData.map((country, index) => (
          <div
            key={index}
            onClick={() => {
              onChange(country.name);

              // console.log("Đã chọn:", country.name);

              setIsOpen(false);
            }}
            className={`rounded-[4px] p-[10px] text-[14px] transition-colors duration-200 w-full cursor-pointer whitespace-nowrap hover:bg-[#4facf3] hover:text-white ${
              value === country.code
                ? "text-white font-bold bg-[#4facf3]"
                : "text-[#323232]"
            }`}
          >
            {country.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const AddressSelector = ({ onAddressChange, initialProvince, initialWard }) => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // 1. Dò tìm và tự động gán Mã (Code) từ Tên (Name)
  useEffect(() => {
    if (initialProvince) {
      const foundProvince = addressData.find(
        (p) => p.FullName === initialProvince
      );
      if (foundProvince) {
        setSelectedProvince(foundProvince.Code);

        // Nếu có mã tỉnh, tiếp tục tìm mã xã
        if (initialWard) {
          let allWards = foundProvince.Districts
            ? foundProvince.Districts.flatMap((d) => d.Wards || [])
            : foundProvince.Wards || [];

          const foundWard = allWards.find((w) => w.FullName === initialWard);
          if (foundWard) {
            setSelectedWard(foundWard.Code);
          }
        }
      }
    }
  }, [initialProvince, initialWard]); // Chạy lại khi props từ trang Edit truyền vào

  // 2. Lấy danh sách Tỉnh/Thành cho Select
  const provinceOptions = useMemo(() => {
    return addressData.map((p) => ({
      slug: p.Code,
      name: p.FullName,
    }));
  }, []);

  // 3. Lấy danh sách Phường/Xã dựa trên Tỉnh đã chọn
  const wardOptions = useMemo(() => {
    const province = addressData.find((p) => p.Code === selectedProvince);
    if (!province) return [];

    const allWards = province.Districts
      ? province.Districts.flatMap((d) => d.Wards || [])
      : province.Wards || [];

    return allWards.map((w) => ({
      slug: w.Code,
      name: w.FullName,
    }));
  }, [selectedProvince]);

  // 4. Gửi dữ liệu ngược lại cho cha
  useEffect(() => {
    const provinceObj = addressData.find((p) => p.Code === selectedProvince);
    let allWards = provinceObj?.Districts
      ? provinceObj.Districts.flatMap((d) => d.Wards || [])
      : provinceObj?.Wards || [];
    const wardObj = allWards.find((w) => w.Code === selectedWard);

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
    <div className="flex gap-4">
      <Select
        label="Tỉnh / Thành phố"
        options={provinceOptions}
        value={selectedProvince} // Select sẽ khớp 'slug' (Code) để hiện 'name'
        onChange={(val) => {
          setSelectedProvince(val);
          setSelectedWard("");
        }}
      />

      {selectedProvince && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <Select
            label="Phường / Xã"
            options={wardOptions}
            value={selectedWard}
            onChange={(val) => setSelectedWard(val)}
          />
        </div>
      )}
    </div>
  );
};

export { Select, CountrySelect, AddressSelector, SelectPro };
