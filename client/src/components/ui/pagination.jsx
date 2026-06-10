import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  // Hàm tạo mảng các số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)]; // Loại bỏ trùng lặp nếu có
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 mt-4 mb-2 font-medium">
      {/* NÚT QUAY LẠI - THEME TỐI */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-800/80 
                   bg-[#111827] text-slate-400 hover:bg-[#161F32] hover:text-slate-200
                   disabled:opacity-20 disabled:hover:bg-[#111827] disabled:hover:text-slate-400 
                   disabled:cursor-not-allowed transition-all duration-150"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {/* DANH SÁCH CÁC SỐ TRANG */}
      <div className="flex gap-1.5">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="w-9 h-9 flex items-center justify-center text-slate-600 font-mono">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`
                  w-9 h-9 rounded-lg text-xs font-semibold tracking-wide border transition-all duration-150
                  ${
                    currentPage === page
                      ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-bold"
                      : "bg-[#111827] text-slate-400 border-slate-800/80 hover:bg-[#161F32] hover:text-slate-200"
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* NÚT TIẾP THEO - THEME TỐI */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-800/80 
                   bg-[#111827] text-slate-400 hover:bg-[#161F32] hover:text-slate-200
                   disabled:opacity-20 disabled:hover:bg-[#111827] disabled:hover:text-slate-400 
                   disabled:cursor-not-allowed transition-all duration-150"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export default Pagination;
