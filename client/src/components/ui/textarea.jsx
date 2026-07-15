import React from "react";

const FloatingTextarea = ({
  id,
  label,
  value,
  onChange,
  required,
  rows = 5,
  isLocked = false,
  ...props
}) => {
  return (
    <div className="relative w-full group">
      <textarea
        id={id}
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        readOnly={isLocked}
        placeholder=" " // 💡 BẮT BUỘC phải giữ khoảng trắng này
        className="block px-4 pb-3 pt-5 w-full text-sm min-h-[140px] max-h-[350px] text-slate-200 
                   bg-[#111827]/40 border border-slate-800 rounded-xl appearance-none outline-none 
                   transition-colors duration-200 tracking-wide custom-scrollbar
                   focus:border-sky-500/50 focus:bg-[#161F32]/60 focus:ring-1 focus:ring-sky-500/10
                   disabled:opacity-40 disabled:cursor-not-allowed peer"
        {...props}
      />

      {/* LABEL: Đã sửa lại bộ chọn peer-not-placeholder-shown để fix lỗi không bay */}
      <label
        htmlFor={id}
        className="absolute left-[15px] top-4 text-sm text-slate-500 pointer-events-none 
                   transition-all duration-200 tracking-wide origin-[0] z-10
                   
                   /* 1. Trạng thái khi đang click vào điền (Focus) */
                   peer-focus:-translate-y-[24px] peer-focus:-translate-x-1.5 
                   peer-focus:scale-[0.82] peer-focus:bg-[#0D121F] peer-focus:px-1.5 
                   peer-focus:text-sky-400 peer-focus:font-semibold
                   
                   /* 2. TRẠNG THÁI ĐÃ SỬA: Khi có chữ bên trong (Placeholder ẩn đi) */
                   peer-not-placeholder-shown:-translate-y-[24px] 
                   peer-not-placeholder-shown:-translate-x-1.5 
                   peer-not-placeholder-shown:scale-[0.82] 
                   peer-not-placeholder-shown:bg-[#0D121F] 
                   peer-not-placeholder-shown:px-1.5 peer-not-placeholder-shown:text-slate-400"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    </div>
  );
};

export default FloatingTextarea;
