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
        <div className="flex-1 relative group">
          <SearchTable
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
            hasActiveFilters
              ? "bg-[#4facf3]/10 text-[#4facf3] border-[#4facf3]/20"
              : "bg-[#111827]/40 text-slate-400 border-slate-800 hover:bg-[#161F32] hover:text-slate-200"
          }`}
        >
          <Filter size={14} />
          Bộ lọc
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#4facf3]" />}
          <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
        </button>
        {addButton}
      </div>

      <div className={`transition-all duration-300 ease-in-out ${
        showFilters ? "max-h-[500px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="p-4 bg-[#0D121F]/80 border border-slate-800 rounded-xl shadow-lg">
          <div className="flex items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-end">
              {children}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="h-10 shrink-0 px-3 text-xs font-bold rounded-lg border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
