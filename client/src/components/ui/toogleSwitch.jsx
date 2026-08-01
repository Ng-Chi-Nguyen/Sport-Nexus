import React from "react";

const ToogleSwitchBlue3D = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      {/* Input Checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />

      {/* Thanh Slider (Track) */}
      <div
        className="
          w-10 h-5 
          bg-slate-200 border-2 border-slate-800 rounded-[5px] 
          shadow-[3px_3px_0px_0px_#1e293b] 
          dark:bg-slate-900 dark:border-slate-700 dark:shadow-[3px_3px_0px_0px_#000]
          transition-all duration-300
          peer-checked:bg-sky-500 dark:peer-checked:bg-[#4facf3]
          peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
        "
      ></div>

      {/* Nút vuông 3D (Thumb) */}
      <div
        className="
          absolute left-[2px] top-[-2px] 
          w-5 h-5
          bg-white border-2 border-slate-800 rounded-[5px] 
          shadow-[0_2px_0_0_#1e293b] 
          dark:bg-slate-100 dark:border-slate-700 dark:shadow-[0_2px_0_0_#000]
          transition-all duration-300
          peer-checked:translate-x-4
          peer-checked:shadow-none 
          peer-checked:translate-y-[2px]
        "
      ></div>
    </label>
  );
};

export { ToogleSwitchBlue3D };
