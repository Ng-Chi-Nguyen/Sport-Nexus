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

export default CustomCheckbox;
