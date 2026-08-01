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
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>

      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-24 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none
                   bg-white border-slate-300 text-slate-800 placeholder-slate-400
                   focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20
                   dark:bg-[#111827]/80 dark:border-slate-800/80 dark:text-slate-200 dark:placeholder-slate-500
                   dark:focus:bg-[#111827] dark:focus:border-sky-500 dark:focus:ring-sky-500/30"
      />

      {/* Khu vực chứa nhóm nút chức năng góc phải */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1">
        {/* Nút Xóa (Clear) - Chỉ xuất hiện khi có text */}
        {displayValue && (
          <button
            onClick={handleClear}
            type="button"
            className="p-1.5 rounded-lg transition-colors cursor-pointer
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100
                       dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
            title="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Nút Tìm kiếm (Submit) nằm gọn trong ô Input */}
        <button
          type="submit"
          className="h-[34px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1
                     bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100
                     dark:bg-[#4facf3]/10 dark:text-[#4facf3] dark:border-[#4facf3]/20 dark:hover:bg-[#4facf3]/20"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Tìm</span>
        </button>
      </div>
    </div>
  );
};

export { SearchTable };
