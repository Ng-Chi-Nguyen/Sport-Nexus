import { useQuery } from "@tanstack/react-query";
import dashboardApi from "@/api/management/dashboardApi";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Activity, Users, Terminal } from "lucide-react";
import { Loader } from "lucide-react";

const SITEMS = [
  { key: "totalLogs", label: "Tổng logs", icon: <Activity size={16} />, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "uniqueUsers", label: "Người dùng", icon: <Users size={16} />, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const SummaryCards = ({ summary = {} }) => (
  <div className="grid gap-3 sm:grid-cols-2 items-start">
    {SITEMS.map((item) => (
      <Card key={item.key}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{summary[item.key] ?? 0}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const LogTable = ({ data = [] }) => (
  <Card title="Hoạt động gần đây" icon={<Terminal size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-2 font-medium">Người dùng</th>
              <th className="pb-2 pr-2 font-medium">Hành động</th>
              <th className="pb-2 pr-2 font-medium">Đối tượng</th>
              <th className="pb-2 pr-2 font-medium">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id} className="border-b border-slate-900 last:border-0">
                <td className="py-1.5 pr-2 text-slate-200 truncate max-w-[140px]">{l.userName}</td>
                <td className="py-1.5 pr-2">
                  <span className="rounded-full bg-sky-500/10 text-sky-400 px-2 py-0.5 text-[10px] font-medium">{l.action_type}</span>
                </td>
                <td className="py-1.5 pr-2 text-slate-400 truncate max-w-[160px]">
                  {l.entity_type} #{l.entity_id}
                </td>
                <td className="py-1.5 pr-2 text-right text-slate-500">{new Date(l.created_at).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
    )}
  </Card>
);

export const SystemOverview = () => {
  const { data: res, isLoading } = useQuery({
    queryKey: ["management-dashboard-system-overview"],
    queryFn: () => dashboardApi.getSystemOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader size={20} className="animate-spin mr-2" />
        Đang tải dữ liệu...
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
