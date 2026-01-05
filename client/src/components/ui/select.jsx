import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import countryData from "@/assets/data/countries.json";

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
      className={`relative w-full min-w-[320px] cursor-pointer text-[#323232] font-medium transition-all ${
        /* Khi mở, cả cụm bao gồm cả nhãn sẽ nhảy lên z-9999 */
        isOpen ? "z-[9999]" : "z-10"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* NHÃN (LABEL) - Đưa vào trong để không bao giờ bị mất */}
      {label && (
        <label
          className={`absolute -top-2 left-3 bg-white px-1 font-bold text-[12px] transition-all duration-300 z-[120] ${
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

export { Select, CountrySelect };
