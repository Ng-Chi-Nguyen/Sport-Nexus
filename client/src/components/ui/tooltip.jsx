import { Info } from "lucide-react";
import React from "react";

const Tooltip = ({ content }) => {
  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="text-[#4facf3] p-1 hover:scale-110 transition-transform"
      >
        <Info size={14} />
      </button>

      {/* Box nội dung Tooltip - Được mở rộng chiều rộng để chứa danh sách */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 
                      invisible opacity-0 group-hover:visible group-hover:opacity-100
                      transition-all duration-300
                      w-[380px] p-3 text-[10px] font-mono
                      bg-[#1a1a1a] border-2 border-[#323232] rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        {content}
        {/* Mũi tên chỉ lên icon */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-l-2 border-t-2 border-[#323232] rotate-45"></div>
      </div>
    </div>
  );
};

export default Tooltip;
