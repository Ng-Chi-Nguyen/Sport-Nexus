import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Activity, Users, Terminal, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const SITEMS = [
    {
      key: "totalLogs",
      label: t("total_logs"),
      icon: <Activity size={16} />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "uniqueUsers",
      label: t("system_users"),
      icon: <Users size={16} />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 items-start">
      {SITEMS.map((item) => {
        const val = summary[item.key] ?? 0;
        return (
          <Card key={item.key}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}${item.color}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className={`text-lg font-bold truncate ${item.color}`}>
                  {val.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const LogTable = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("recent_activity")} icon={<Terminal size={16} />}>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">{t("user_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("action_col")}</th>
                <th className="pb-2 pr-2 font-medium">{t("entity_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">{t("time_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {data.map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                >
                  <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                    {l.userName}
                  </td>
                  <td className="py-2 pr-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 dark:border-transparent px-2 py-0.5 text-[10px] font-semibold">
                      {l.action_type}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate max-w-[160px]">
                    {l.entity_type} #{l.entity_id}
                  </td>
                  <td className="py-2 pr-2 text-right text-slate-500 dark:text-slate-400">
                    {new Date(l.created_at).toLocaleDateString("vi-VN")}
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

export const SystemOverview = () => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-system-overview"],
    queryFn: () => dashboardApi.getSystemOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 font-medium text-sm transition-colors duration-200">
        <Loader size={20} className="animate-spin mr-2 text-sky-500" />
        {t("loading_system_logs")}
      </div>
    );
  }

  const raw = res?.data || {};
  const data = raw.data || raw;

  return (
    <div className="space-y-4">
      <SummaryCards summary={data.summary || {}} />
      <LogTable data={data.recentLogs || []} />
    </div>
  );
};
