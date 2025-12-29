// components/ui/select.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Select = ({ options, value, onChange, placeholder = "Chọn một mục" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Chuyển đổi Object thành Array nếu cần thiết
  const safeOptions = React.useMemo(() => {
    if (Array.isArray(options)) return options;
    if (options && typeof options === "object") {
      // Chuyển { users: "Quản lý..." } thành [{ slug: "users", name: "Quản lý..." }]
      return Object.entries(options).map(([key, val]) => ({
        slug: key,
        name: val,
      }));
    }
    return [];
  }, [options]);

  // 2. Tìm option dựa trên safeOptions
  const selectedOption = safeOptions.find((opt) => opt.slug === value);

  return (
    <div
      className="relative w-fit min-w-[200px] cursor-pointer text-[#323232] group font-medium"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className={`bg-white p-[10px] mb-[5px] rounded-[5px] relative z-[100] text-[15px] flex items-center justify-between border-2 transition-all duration-300 shadow-[4px_4px_0px_0px_#323232] ${
          isOpen ? "border-[#4facf3]" : "border-[#323232]"
        }`}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-0 text-[#4facf3]" : "-rotate-90 text-[#323232]"
          }`}
        />
      </div>

      <div
        className={`flex flex-col rounded-[5px] p-[5px] bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#4facf3] absolute w-full transition-all duration-300 z-50 ${
          isOpen
            ? "opacity-100 top-full visible"
            : "opacity-0 top-[calc(100%-20px)] invisible"
        }`}
      >
        {/* DÙNG safeOptions Ở ĐÂY THAY VÌ options */}
        {safeOptions.map((option) => (
          <div
            key={option.slug}
            onClick={() => {
              onChange(option.slug);
              setIsOpen(false);
            }}
            className={`rounded-[5px] p-[8px] text-[14px] transition-colors duration-200 w-full cursor-pointer hover:bg-[#4facf3] hover:text-white ${
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

export default Select;
