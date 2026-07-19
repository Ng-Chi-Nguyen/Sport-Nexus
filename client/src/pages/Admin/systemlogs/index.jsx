import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FilterPanel from "@/components/ui/FilterPanel";
import Pagination from "@/components/ui/pagination";
import { SimpleSelect } from "@/components/ui/select";
import useTableFilters from "@/hooks/useTableFilters";
import { actionTypes, entityTypes, statusOptions } from "@/constants/management/log";
import LogEntry from "./LogEntry";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Hệ thống", route: "" },
  { title: "Lịch sử hoạt động", route: "" },
];

const LogPage = () => {
  const responses = useLoaderData();
  const { data: logs, pagination } = responses?.data || {};
  const {
    searchParams,
    setSearchParams,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const paginationInfo = pagination || { totalPages: 1, currentPage: 1 };
  const allLogs = useMemo(() => {
    if (!logs) return [];
    return Array.isArray(logs) ? logs : Object.values(logs).flat();
  }, [logs]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchParams.get("search") || ""}
        onSearchChange={(val) => setFilter("search", val)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder="Tìm kiếm theo IP, user..."
      >
        <SimpleSelect
          value={searchParams.get("action_type") || ""}
          onChange={(val) => setFilter("action_type", val)}
          options={actionTypes}
          placeholder="Hành động"
        />
        <SimpleSelect
          value={searchParams.get("entity_type") || ""}
          onChange={(val) => setFilter("entity_type", val)}
          options={entityTypes}
          placeholder="Đối tượng"
        />
        <SimpleSelect
          value={searchParams.get("status") || ""}
          onChange={(val) => setFilter("status", val)}
          options={statusOptions}
          placeholder="Trạng thái"
        />
        <div>
          <input
            type="date"
            value={searchParams.get("from") || ""}
            onChange={(e) => setFilter("from", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-slate-800 rounded-lg text-slate-300"
          />
        </div>
        <div>
          <input
            type="date"
            value={searchParams.get("to") || ""}
            onChange={(e) => setFilter("to", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-slate-800 rounded-lg text-slate-300"
          />
        </div>
      </FilterPanel>

      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="section-title">Lịch sử hoạt động</h2>

        {allLogs.length > 0 ? (
          <div className="space-y-2 mb-6">
            {allLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 italic text-sm">
            Không có hoạt động nào.
          </div>
        )}

        <div className="mt-6 border-t border-white/5 pt-4">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LogPage;
