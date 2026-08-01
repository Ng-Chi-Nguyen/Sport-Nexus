import { SearchTable } from "@/components/ui/search";
import { Filter, ChevronDown } from "lucide-react";

const FilterPanel = ({
  searchValue,
  onSearchChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  searchPlaceholder = "Tìm kiếm...",
  addButton,
  children,
}) => {
  return (
    <>
      <div className="flex items-center gap-4">
        {/* Ô Tìm Kiếm */}
        <div className="flex-1 relative group">
          <SearchTable
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>

        {/* Nút Bật/Tắt Bộ Lọc */}
        <button
          type="button"
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
            hasActiveFilters
              ? "bg-sky-50 text-sky-600 border-sky-300 dark:bg-[#4facf3]/10 dark:text-[#4facf3] dark:border-[#4facf3]/20"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#111827]/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-[#161F32] dark:hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          <span>Bộ lọc</span>
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

        {addButton}
      </div>

      {/* Khung Chứa Các Lựa Chọn Lọc */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-[500px] opacity-100 overflow-visible mt-3"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4 bg-white border-slate-200 shadow-sm dark:bg-[#0D121F]/90 border dark:border-slate-800 dark:shadow-lg rounded-xl transition-colors duration-300">
          <div className="flex items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-end">
              {children}
            </div>

            {/* Nút Xóa Bộ Lọc */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
