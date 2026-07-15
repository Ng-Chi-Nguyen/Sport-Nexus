import React, { useState } from "react";
import { Search, X } from "lucide-react";

const SearchTable = (props) => {
  const { placeholder, value, onChange, onClear } = props;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");

  const displayValue = isControlled ? value : internalValue;

  const handleChange = (e) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    onChange?.("");
    onClear?.();
  };

  return (
    <div className="relative w-full flex items-center">
      {/* Icon kính lúp trang trí ở bên trái */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <Search className="w-4 h-4 text-slate-500" />
      </div>

      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        // Đã tăng pr-24 (padding-right) để chữ không đè lên các nút góc phải
        className="w-full pl-11 pr-24 py-2.5 rounded-xl text-sm 
                   bg-[#111827]/80 text-slate-200 placeholder-slate-500
                   border border-slate-800/80
                   focus:outline-none focus:border-sky-500 focus:bg-[#111827]
                   focus:ring-1 focus:ring-sky-500/30
                   transition-all duration-200"
      />

      {/* Khu vực chứa nhóm nút chức năng góc phải */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1">
        {/* Nút Xóa (Clear) - Chỉ xuất hiện khi có text */}
        {displayValue && (
          <button
            onClick={handleClear}
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Nút Tìm kiếm (Submit) nằm gọn trong ô Input */}
        <button
          type="submit"
          className="bg-[#4facf3]/10 text-[#4facf3] border border-[#4facf3]/20 hover:bg-[#4facf3]/20 h-[34px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
          Tìm
        </button>
      </div>
    </div>
  );
};

export { SearchTable };
