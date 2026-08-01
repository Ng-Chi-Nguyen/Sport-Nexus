import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
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
    <div className="flex items-center justify-end gap-2 font-medium select-none">
      {/* Nút Trang Trước */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 shadow-sm outline-none focus:outline-none focus:ring-0 focus-visible:ring-0
                   bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900
                   dark:bg-[#0D121F] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#0D121F]"
        title={t("prev_page")}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {/* Danh Sách Các Số Trang */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-200 shadow-sm flex items-center justify-center outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${
                  currentPage === page
                    ? "bg-sky-50 text-sky-600 border-sky-300 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/40 dark:shadow-none"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#0D121F] dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Nút Trang Sau */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 shadow-sm outline-none focus:outline-none focus:ring-0 focus-visible:ring-0
                   bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900
                   dark:bg-[#0D121F] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#0D121F]"
        title={t("next_page")}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Pagination;
