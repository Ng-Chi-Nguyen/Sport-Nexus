import { SearchTable } from "@/components/ui/search";
import { Filter, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const FilterPanel = ({
  searchValue,
  onSearchChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  searchPlaceholder,
  addButton,
  children,
}) => {
  const { t } = useTranslation("translation", {
    keyPrefix: "component.common",
  });

  return (
    <div className="space-y-3">
      {/* TỐI ƯU MOBILE: Dùng flex-col trên đt, flex-row trên PC */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Hàng chứa Ô tìm kiếm và Nút Lọc trên Mobile */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 relative group">
            <SearchTable
              placeholder={searchPlaceholder ?? t("search_placeholder")}
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>

          <button
            type="button"
            onClick={onToggleFilters}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-lg border cursor-pointer transition-colors shrink-0 ${
              hasActiveFilters
                ? "bg-sky-50 text-sky-600 border-sky-300 dark:bg-[#4facf3]/10 dark:text-[#4facf3] dark:border-[#4facf3]/20"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#111827]/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-[#161F32] dark:hover:text-slate-200"
            }`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">{t("filter")}</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[#4facf3]" />
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Nhóm các nút Thêm / Xuất Excel: Tự động dàn ngang hoặc gói gọn trên mobile */}
        {addButton && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {addButton}
          </div>
        )}
      </div>

      {/* Khung Chứa Các Lựa Chọn Lọc */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-[500px] opacity-100 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 bg-white border-slate-200 shadow-sm dark:bg-[#0D121F]/90 border dark:border-slate-800 dark:shadow-lg rounded-xl transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-end">
              {children}
            </div>

            {/* Nút Xóa Bộ Lọc */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer w-full sm:w-auto"
              >
                {t("clear_filter")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
