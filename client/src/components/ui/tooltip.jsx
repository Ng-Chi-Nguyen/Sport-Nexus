import { Info } from "lucide-react";
import React from "react";

// Thêm prop position, mặc định nếu không truyền gì sẽ là "bottom" (xổ xuống)
const Tooltip = ({ content, position = "bottom" }) => {
  const isUp = position === "top";

  return (
    <div className="relative group inline-block">
      {/* Nút kích hoạt chứa Icon Info */}
      <button
        type="button"
        className="text-sky-500 dark:text-sky-400 p-1 hover:scale-110 active:scale-95 transition-transform duration-150"
      >
        <Info
          size={14}
          className="text-slate-400 hover:text-sky-500 dark:text-slate-300 dark:group-hover:text-sky-400 transition-colors"
        />
      </button>

      {/* BOX NỘI DUNG TOOLTIP: Hỗ trợ Light & Dark Mode */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-50 
                   invisible opacity-0 group-hover:visible group-hover:opacity-100
                   scale-95 group-hover:scale-100 transition-all duration-200 ease-out
                   w-[380px] p-4 text-[11px] font-mono tracking-wide leading-relaxed
                   bg-white border-slate-200 text-slate-700 shadow-xl
                   dark:bg-[#0D121F]/95 dark:border-slate-800/80 dark:text-slate-300
                   dark:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(14,165,233,0.05)]
                   border rounded-xl backdrop-blur-xl text-start
                   ${isUp ? "bottom-full mb-2.5" : "top-full mt-2.5"}`}
      >
        {content}

        {/* MŨI TÊN CHỈ TOOLTIP */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 
                     bg-white border-slate-200 
                     dark:bg-[#0D121F] dark:border-slate-800/80
                     ${
                       isUp
                         ? "-bottom-1 border-r border-b"
                         : "-top-1 border-l border-t"
                     }`}
        ></div>
      </div>
    </div>
  );
};

export default Tooltip;
