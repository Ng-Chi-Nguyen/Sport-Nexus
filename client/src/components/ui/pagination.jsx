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
    <div className="flex items-center justify-end gap-2 mt-6 mb-2 font-medium select-none">
      {/* NÚT QUAY LẠI - THEME TỐI */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-800
                   bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100
                   disabled:opacity-25 disabled:hover:bg-slate-900 disabled:hover:text-slate-400 
                   disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {/* DANH SÁCH CÁC SỐ TRANG */}
      <div className="flex gap-1.5">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`
                  w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-200 shadow-sm
                  ${
                    currentPage === page
                      ? "bg-gradient-to-b from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.25)]"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-100"
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
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-800
                   bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100
                   disabled:opacity-25 disabled:hover:bg-slate-900 disabled:hover:text-slate-400 
                   disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Pagination;
