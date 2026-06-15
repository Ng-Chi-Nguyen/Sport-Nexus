import React, { useId } from "react";

// 1. CUSTOM CHECKBOX STYLE GLASSOS (Hỗ trợ hoạt ảnh vẽ nét path SVG mượt mà)
const CustomCheckbox = ({ label, checked, value, onChange, id }) => {
  const generatedId = useId();
  const finalId = id || generatedId;

  return (
    <label
      htmlFor={finalId}
      className="group relative inline-flex items-center gap-3 cursor-pointer select-none"
    >
      <input
        id={finalId}
        type="checkbox"
        className="peer hidden"
        checked={checked}
        value={value}
        onChange={onChange}
      />

      {/* KHUNG Ô CHECKBOX TỐI MỜ CÔNG NGHỆ */}
      <div
        className="relative w-5 h-5 bg-[#111827]/40 border border-slate-800 rounded-lg
                   peer-checked:bg-sky-500/10 peer-checked:border-sky-500/50 
                   peer-checked:shadow-[0_0_12px_rgba(14,165,233,0.2)]
                   group-hover:border-slate-700 group-hover:bg-[#161F32]/50
                   transition-all duration-200 flex items-center justify-center overflow-hidden"
      >
        <svg
          viewBox="0 0 69 89"
          className="w-3.5 h-3.5 duration-300 ease-out fill-none [stroke-dasharray:100] [stroke-dashoffset:100] peer-checked:[stroke-dashoffset:0]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M.93 63.984c3.436.556 7.168.347 10.147 2.45 4.521 3.19 10.198 8.458 13.647 12.596 1.374 1.65 4.181 5.922 5.598 8.048.267.4-1.31.823-1.4.35-5.744-30.636 9.258-59.906 29.743-81.18C62.29 2.486 63.104 1 68.113 1"
            strokeWidth="12px"
            /* ĐÃ SỬA: Chuyển dấu tích sang màu xanh Neon Cyan */
            stroke={checked ? "#0ea5e9" : "transparent"}
            pathLength="100"
          ></path>
        </svg>
      </div>

      {/* TEXT NHÃN - text-[#323232] -> text-slate-300 */}
      {label && (
        <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors duration-200 tracking-wide">
          {label}
        </span>
      )}
    </label>
  );
};

// 2. ANIMATED CHECKBOX BIẾN ĐỔI ĐƯỜNG VIỀN KHUNG THÀNH DẤU TÍCH
const AnimatedCheckbox = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      <div className="relative w-5 h-5 flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
        />

        {/* Khung hình SVG nét mảnh chuẩn Neon */}
        <label
          htmlFor={id}
          className="cursor-pointer relative z-10 w-full h-full transition-all duration-200"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 18 18"
            className={`fill-none stroke-round stroke-join transition-all duration-300 stroke-[2]
                       ${checked ? "stroke-sky-400" : "stroke-slate-800 group-hover:stroke-slate-600"}`}
          >
            {/* Đường viền khung hình vuông bo tròn góc mềm mại */}
            <path
              d="M1,9 L1,4.5 C1,2.5 2.5,1 4.5,1 L13.5,1 C15.5,1 17,2.5 17,4.5 L17,13.5 C17,15.5 15.5,17 13.5,17 L4.5,17 C2.5,17 1,15.5 1,13.5 L1,9 Z"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: checked ? 60 : 0,
                transition: "all 0.25s linear",
              }}
            />
            {/* Dấu tích v phát sáng mờ */}
            <polyline
              points="2 9 6.5 13.5 15.5 4.5"
              style={{
                strokeDasharray: 22,
                strokeDashoffset: checked ? 42 : 66,
                transition: "all 0.2s linear",
                transitionDelay: checked ? "0.12s" : "0s",
              }}
            />
          </svg>
        </label>

        {/* Hiệu ứng vòng tròn lan tỏa Neon khi hover */}
        <div className="absolute -inset-1.5 rounded-full bg-sky-500/5 opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all duration-200" />
      </div>

      {/* NHÃN TEXT: Bỏ font-black thô cứng, chuyển về font-medium tracking rộng rãi */}
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-400 uppercase cursor-pointer tracking-wider group-hover:text-slate-200 transition-colors duration-200"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export { CustomCheckbox, AnimatedCheckbox };
