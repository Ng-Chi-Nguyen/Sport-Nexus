import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const variants = {
  dark: {
    wrapper: "justify-end",
    nav: "w-9 h-9 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-25 disabled:hover:bg-slate-900 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm",
    page: (active) =>
      active
        ? "w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-200 shadow-sm bg-gradient-to-b from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.25)]"
        : "w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-200 shadow-sm bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-100",
    dots: "w-9 h-9 flex items-center justify-center text-slate-600 font-bold",
    gapClass: "gap-1.5",
  },
  light: {
    wrapper: "justify-center",
    nav: "flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors",
    page: (active) =>
      active
        ? "w-8 h-8 text-sm rounded border bg-blue-600 text-white border-blue-600"
        : "w-8 h-8 text-sm rounded border hover:bg-slate-50 transition-colors",
    dots: "w-8 h-8 flex items-center justify-center text-slate-400 text-sm",
    gapClass: "gap-1",
  },
};

const Pagination = ({ totalPages, currentPage, onPageChange, variant = "dark" }) => {
  const v = variants[variant] || variants.dark;

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
    return [...new Set(pages)];
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center ${v.wrapper} gap-2 font-medium select-none`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={v.nav}
      >
        <ChevronLeft size={variant === "light" ? 14 : 16} strokeWidth={variant === "light" ? 2 : 2.5} />
        {variant === "light" && "Trước"}
      </button>

      <div className={`flex ${v.gapClass}`}>
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className={v.dots}>...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={v.page(currentPage === page)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={v.nav}
      >
        {variant === "light" && "Sau"}
        <ChevronRight size={variant === "light" ? 14 : 16} strokeWidth={variant === "light" ? 2 : 2.5} />
      </button>
    </div>
  );
};

export default Pagination;