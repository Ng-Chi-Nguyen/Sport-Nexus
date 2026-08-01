import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Building2, ShoppingCart, DollarSign, Loader } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const SITEMS = [
    {
      key: "totalSuppliers",
      label: t("total_suppliers"),
      icon: <Building2 size={16} />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "totalPurchaseOrders",
      label: t("purchase_orders_count"),
      icon: <ShoppingCart size={16} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      key: "totalPurchaseCost",
      label: t("total_purchase_cost"),
      icon: <DollarSign size={16} />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      fmt: (v) => formatCurrency(v || 0),
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3 items-start">
      {SITEMS.map((item) => {
        const val = summary[item.key];
        const display = item.fmt ? item.fmt(val) : (val ?? 0).toLocaleString();
        return (
          <Card key={item.key}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className={`text-lg font-bold truncate ${item.color}`}>
                  {display}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const SupplierTable = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("supplier_list")} icon={<Building2 size={16} />}>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">{t("supplier_name_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("contact_person_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("product_count_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("purchase_orders_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("total_cost_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {data.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                >
                  <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {s.name}
                  </td>
                  <td className="py-2 pr-2 text-slate-600 dark:text-slate-400">
                    {s.contact_person || "—"}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                    {s.productCount ?? 0}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-700 dark:text-slate-300 font-medium">
                    {s.orderCount ?? 0}
                  </td>
                  <td className="py-2 pr-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.totalOrderCost || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          {t("no_data")}
        </div>
      )}
    </Card>
  );
};

export const SupplierOverview = () => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-supplier-overview"],
    queryFn: () => dashboardApi.getSupplierOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        {t("loading_suppliers")}
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <SupplierTable data={data.suppliers || []} />
    </div>
  );
};
