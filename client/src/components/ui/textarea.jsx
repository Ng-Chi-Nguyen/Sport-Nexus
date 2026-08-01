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
        className="block px-4 pb-3 pt-5 w-full text-sm min-h-[140px] max-h-[350px] appearance-none outline-none 
                   transition-colors duration-200 tracking-wide custom-scrollbar rounded-xl border
                   bg-slate-50 border-slate-300 text-slate-800 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500/20
                   dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 
                   dark:focus:border-sky-500/50 dark:focus:bg-[#161F32]/60 dark:focus:ring-sky-500/10
                   disabled:opacity-40 disabled:cursor-not-allowed peer"
        {...props}
      />

      {/* LABEL FLOATING */}
      <label
        htmlFor={id}
        className="absolute left-[15px] top-4 text-sm text-slate-400 dark:text-slate-500 pointer-events-none 
                   transition-all duration-200 tracking-wide origin-[0] z-10
                   
                   /* 1. Trạng thái khi Focus */
                   peer-focus:-translate-y-[24px] peer-focus:-translate-x-1.5 
                   peer-focus:scale-[0.82] peer-focus:bg-slate-50 peer-focus:px-1.5 
                   peer-focus:text-sky-600 peer-focus:font-semibold
                   dark:peer-focus:bg-[#0D121F] dark:peer-focus:text-sky-400
                   
                   /* 2. Trạng thái khi có chữ bên trong */
                   peer-[:not(:placeholder-shown)]:-translate-y-[24px] 
                   peer-[:not(:placeholder-shown)]:-translate-x-1.5 
                   peer-[:not(:placeholder-shown)]:scale-[0.82] 
                   peer-[:not(:placeholder-shown)]:bg-slate-50 
                   peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-slate-500
                   dark:peer-[:not(:placeholder-shown)]:bg-[#0D121F] dark:peer-[:not(:placeholder-shown)]:text-slate-400"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    </div>
  );
};

export default FloatingTextarea;
