import { useMemo, useCallback } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FilterPanel from "@/components/ui/FilterPanel";
import Pagination from "@/components/ui/pagination";
import { SimpleSelect } from "@/components/ui/select";
import useTableFilters from "@/hooks/useTableFilters";
import {
  actionTypes,
  entityTypes,
  statusOptions,
} from "@/constants/management/log";
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

  const queryClient = useQueryClient();
  const revalidator = useRevalidator();

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["system-logs"] });
    setTimeout(() => revalidator.revalidate(), 0);
  }, [queryClient, revalidator]);

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
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* Panel bộ lọc */}
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

        {/* Ô chọn ngày Từ (from) */}
        <div>
          <input
            type="date"
            value={searchParams.get("from") || ""}
            onChange={(e) => setFilter("from", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg transition-colors duration-150 outline-none
                       bg-white border border-slate-300 text-slate-800 focus:border-sky-500
                       dark:bg-[#111827]/60 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-400"
          />
        </div>

        {/* Ô chọn ngày Đến (to) */}
        <div>
          <input
            type="date"
            value={searchParams.get("to") || ""}
            onChange={(e) => setFilter("to", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg transition-colors duration-150 outline-none
                       bg-white border border-slate-300 text-slate-800 focus:border-sky-500
                       dark:bg-[#111827]/60 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-400"
          />
        </div>
      </FilterPanel>

      {/* Khung danh sách Log */}
      <div
        className="rounded-2xl p-6 shadow-xl backdrop-blur-md border transition-colors duration-200
                      bg-white border-slate-200/80
                      dark:bg-[#0D121F]/40 dark:border-slate-900"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Lịch sử hoạt động
          </h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg transition-colors
                       text-slate-500 hover:text-slate-900 hover:bg-slate-100
                       dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải lại"
          >
            <RefreshCw
              size={18}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />
          </button>
        </div>

        {allLogs.length > 0 ? (
          <div className="space-y-2 mb-6">
            {allLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm">
            Không có hoạt động nào.
          </div>
        )}

        <div className="mt-6 border-t pt-4 border-slate-200 dark:border-slate-800/60">
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
