import { useState } from "react";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Building2, Tag, Truck, ArrowUpDown, ShoppingCart } from "lucide-react";

const LIMITS = [5, 10, 999];

const DistCard = ({ title, icon, items: rawItems, color }) => {
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(10);

  const sorted = [...rawItems].sort((a, b) => (asc ? a.soldCount - b.soldCount : b.soldCount - a.soldCount));
  const visible = limit >= 999 ? sorted : sorted.slice(0, limit);
  const maxSold = Math.max(...sorted.map((i) => i.soldCount), 1);

  return (
    <Card
      title={title}
      icon={icon}
      action={
        <div className="flex items-center gap-1.5">
          {LIMITS.map((l) => (
            <button
              key={l}
              onClick={() => setLimit(l)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                limit === l ? "bg-sky-600/20 text-sky-400 border border-sky-700/50" : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {l >= 999 ? "Tất cả" : l}
            </button>
          ))}
          <span className="text-slate-700 mx-0.5">|</span>
          <button onClick={() => setAsc(!asc)} className="text-slate-500 hover:text-sky-300 transition-colors p-0.5">
            <ArrowUpDown size={13} />
          </button>
        </div>
      }
    >
      {visible.length ? (
        <div className="space-y-2.5">
          {visible.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="font-semibold text-slate-200">{item.count} SP</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <ShoppingCart size={10} />
                <span>Đã bán: <strong className="text-slate-300">{item.soldCount ?? 0}</strong></span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300 shadow-[0_0_6px_rgba(56,189,248,0.15)]`}
                  style={{ width: `${(item.soldCount / maxSold) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[80px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
      )}
    </Card>
  );
};

export const Distribution = ({ distribution = {} }) => {
  const { categories = [], brands = [], suppliers = [] } = distribution;
  return (
    <div className="grid gap-4 sm:grid-cols-3 items-start">
      <DistCard title="Danh mục" icon={<Tag size={16} />} items={categories} color="from-sky-500 to-blue-400" />
      <DistCard title="Thương hiệu" icon={<Building2 size={16} />} items={brands} color="from-violet-500 to-purple-400" />
      <DistCard title="Nhà cung cấp" icon={<Truck size={16} />} items={suppliers} color="from-emerald-500 to-teal-400" />
    </div>
  );
};
