import { OverviewCards } from "./OverviewCards";
import { RevenueChart } from "./RevenueChart";
import { StatusBreakdown } from "./StatusBreakdown";
import { PaymentBreakdown } from "./PaymentBreakdown";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { CalendarRange } from "lucide-react";
import { formatDate } from "@/utils/formatters";

export const BusinessOverview = ({ data = {} }) => {
  const {
    summary = {},
    ordersByStatus = {},
    revenueTrend = [],
    revenueByPaymentMethod = {},
    meta = {},
  } = data;

  const currentGroupBy = meta.group_by || "day";

  return (
    <div className="space-y-4">
      <OverviewCards summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart revenueTrend={revenueTrend} />
        <StatusBreakdown
          ordersByStatus={ordersByStatus}
          totalOrders={summary.totalOrders || 0}
        />
        <PaymentBreakdown revenueByPaymentMethod={revenueByPaymentMethod} />
        <Card title="Bộ lọc áp dụng" icon={<CalendarRange size={16} />}>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800/80 bg-[#08101E] p-3">
              <span className="text-[10px] uppercase text-slate-500 font-medium">
                Khoảng thời gian
              </span>
              <p className="mt-1 font-semibold text-slate-200">
                {meta.from ? formatDate(meta.from) : "-"} →{" "}
                {meta.to ? formatDate(meta.to) : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#08101E] p-3">
              <span className="text-[10px] uppercase text-slate-500 font-medium">
                Nhóm theo
              </span>
              <p className="mt-1 font-semibold text-slate-200 capitalize">
                {currentGroupBy === "day"
                  ? "Ngày"
                  : currentGroupBy === "week"
                    ? "Tuần"
                    : "Tháng"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
