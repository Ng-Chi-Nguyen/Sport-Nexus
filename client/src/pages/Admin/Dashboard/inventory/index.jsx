import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { SummaryCards } from "./SummaryCards";
import { MovementTable } from "./MovementTable";
import { MovementStats } from "./MovementStats";
import { Loader } from "lucide-react";

export const InventoryOverview = () => {
  const [searchParams] = useSearchParams();
  const params = {
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    group_by: searchParams.get("group_by") || "day",
  };

  const { data: res, isLoading } = useQuery({
    queryKey: [
      "management-dashboard-inventory-overview",
      params.from,
      params.to,
      params.group_by,
    ],
    queryFn: () => dashboardApi.getInventoryOverview(params),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        Đang tải dữ liệu kho hàng...
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <MovementStats
        movementCountByType={data.movementCountByType || {}}
        movementTrend={data.movementTrend || []}
      />
      <MovementTable data={data.recentMovements || []} />
    </div>
  );
};
