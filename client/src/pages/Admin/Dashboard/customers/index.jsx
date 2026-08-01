import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { SummaryCards } from "./SummaryCards";
import { NewUserChart } from "./NewUserChart";
import { TopCustomersTable } from "./TopCustomersTable";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

export const CustomerOverview = () => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const [searchParams] = useSearchParams();
  const params = {
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    group_by: searchParams.get("group_by") || "day",
  };

  const { data: res, isLoading } = useQuery({
    queryKey: [
      "management-dashboard-customer-overview",
      params.from,
      params.to,
      params.group_by,
    ],
    queryFn: () => dashboardApi.getCustomerOverview(params),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        {t("loading_customers")}
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <NewUserChart newUserTrend={data.newUserTrend || []} />
        <TopCustomersTable topCustomers={data.topCustomers || []} />
      </div>
    </div>
  );
};
