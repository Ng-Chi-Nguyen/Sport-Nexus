import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { SummaryCards } from "./SummaryCards";
import { TrendChart } from "./TrendChart";
import { SellingOverview, RevenueOverview, ReviewOverview } from "./TopTables";
import { Distribution } from "./Distribution";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ProductOverview = () => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const [searchParams] = useSearchParams();
  const params = {
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    group_by: searchParams.get("group_by") || "day",
  };

  const { data: res, isLoading } = useQuery({
    queryKey: [
      "management-dashboard-product-overview",
      params.from,
      params.to,
      params.group_by,
    ],
    queryFn: () => dashboardApi.getProductOverview(params),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        {t("loading_products")}
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 space-y-4 min-w-0 w-full">
          <TrendChart newProductTrend={data.newProductTrend || []} />
          <SellingOverview
            top={data.topSelling || []}
            worst={data.worstSelling || []}
          />
        </div>
        <div className="flex-1 space-y-4 min-w-0 w-full">
          <ReviewOverview
            most={data.mostReviewed || []}
            least={data.leastReviewed || []}
          />
          <RevenueOverview
            top={data.topRevenue || []}
            lowest={data.lowestRevenue || []}
          />
        </div>
      </div>
      <Distribution distribution={data.distribution || {}} />
    </div>
  );
};
