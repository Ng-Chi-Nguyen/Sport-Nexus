import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
  maxPages = 20,
}) => {
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });

  // Giới hạn số trang có thể truy cập để tránh query deep-offset quá nặng.
  // Khi dùng offset pagination, nhảy tới trang rất xa sẽ làm server phải skip
  // nhiều bản ghi. `maxPages` giới hạn trang truy cập sâu nhất (mặc định 20),
  // có thể truyền giá trị khác (hoặc null để bỏ giới hạn) ở từng trang dùng.
  const effectiveTotalPages =
    maxPages == null ? totalPages : Math.min(totalPages, maxPages);
  const current = Math.min(currentPage, effectiveTotalPages);

  const getPageNumbers = () => {
    const pages = [];

    // Luôn hiển thị trang đầu tiên
    pages.push(1);

    // Nếu khoảng cách giữa trang hiện tại và đầu trang lớn hơn 2, thêm dấu ...
    if (current > 3) {
      pages.push("...");
    }

    // Các trang xung quanh trang hiện tại (lùi 1 và tiến 1)
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(effectiveTotalPages - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    // Nếu khoảng cách giữa trang hiện tại và trang cuối lớn hơn 2, thêm dấu ...
    if (current < effectiveTotalPages - 2) {
      pages.push("...");
    }

    // Luôn hiển thị trang cuối cùng (nếu tổng số trang lớn hơn 1)
    if (effectiveTotalPages > 1) {
      pages.push(effectiveTotalPages);
    }

    return [...new Set(pages)];
  };

  if (effectiveTotalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 font-medium select-none">
      {/* Nút Trang Trước */}
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
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
                  current === page
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
        onClick={() => onPageChange(current + 1)}
        disabled={current === effectiveTotalPages}
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

export const CarouselPagination = ({
  totalPages,
  current,
  onChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const progressPercentage = ((current + 1) / totalPages) * 100;
  const buttonClass =
    "p-2 rounded-xl bg-primary text-white transition-all cursor-pointer shadow-sm hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {/* Thanh tiến trình */}
      <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Cặp nút cùng màu, khoá ở biên */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(current - 1, 0))}
          disabled={current === 0}
          className={buttonClass}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(current + 1, totalPages - 1))}
          disabled={current === totalPages - 1}
          className={buttonClass}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
