import { useId } from "react";

const CustomCheckbox = ({ label, checked, value, onChange, id }) => {
  const generatedId = useId();
  const finalId = id || generatedId;

  return (
    <label
      htmlFor={finalId}
      className="group relative flex items-center gap-3 cursor-pointer select-none"
    >
      <input
        id={finalId}
        type="checkbox"
        className="peer hidden"
        checked={checked}
        value={value}
        onChange={onChange}
      />

      <div
        className="relative w-7 h-7 bg-white border-[3px] border-[#323232] rounded-sm shadow-[4px_4px_0px_0px_#323232] 
                    peer-checked:bg-[#4facf3] peer-checked:shadow-none peer-checked:translate-x-[2px] peer-checked:translate-y-[2px] 
                    transition-all duration-200 flex items-center justify-center overflow-hidden"
      >
        <svg
          viewBox="0 0 69 89"
          className="w-5 h-5 duration-500 ease-out fill-none [stroke-dasharray:100] [stroke-dashoffset:100] peer-checked:[stroke-dashoffset:0]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M.93 63.984c3.436.556 7.168.347 10.147 2.45 4.521 3.19 10.198 8.458 13.647 12.596 1.374 1.65 4.181 5.922 5.598 8.048.267.4-1.31.823-1.4.35-5.744-30.636 9.258-59.906 29.743-81.18C62.29 2.486 63.104 1 68.113 1"
            strokeWidth="10px"
            stroke={checked ? "white" : "#323232"}
            pathLength="100"
          ></path>
        </svg>
      </div>

      {/* Text nhãn (nếu có) */}
      {label && (
        <span className="text-[14px] group-hover:text-[#4facf3] transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};

const AnimatedCheckbox = ({ id, label, checked, onChange }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Input ẩn để quản lý logic - Dùng peer để điều khiển label phía sau */}
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
        />

        {/* Label kiêm khung hình cho SVG */}
        <label
          htmlFor={id}
          className="cursor-pointer relative z-10 w-full h-full transition-all duration-200"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 18 18"
            className="fill-none stroke-round stroke-join transition-all duration-300
                       stroke-[#323232] stroke-[2]
                       peer-checked:stroke-[#4facf3]"
          >
            {/* Đường viền khung hình vuông */}
            <path
              d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: checked ? 60 : 0,
                transition: "all 0.3s linear",
              }}
            />
            {/* Dấu tích v */}
            <polyline
              points="1 9 7 14 15 4"
              style={{
                strokeDasharray: 22,
                strokeDashoffset: checked ? 42 : 66,
                transition: "all 0.2s linear",
                transitionDelay: checked ? "0.15s" : "0s",
              }}
            />
          </svg>
        </label>

        {/* Hiệu ứng vòng tròn lan tỏa khi hover (giống bản styled-components) */}
        <div className="absolute -inset-2 rounded-full bg-[#4facf3]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {label && (
        <label
          htmlFor={id}
          className="ml-3 text-sm font-black text-[#323232] uppercase cursor-pointer select-none tracking-tight"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export { CustomCheckbox, AnimatedCheckbox };
