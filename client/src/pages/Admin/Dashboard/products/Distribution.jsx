import { useState } from "react";
import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Building2, Tag, Truck, ArrowUpDown, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

const LIMITS = [5, 10, 999];

const DistCard = ({ title, icon, items: rawItems = [], color }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const [asc, setAsc] = useState(false);
  const [limit, setLimit] = useState(10);

  const sorted = [...rawItems].sort((a, b) =>
    asc
      ? (a.soldCount || 0) - (b.soldCount || 0)
      : (b.soldCount || 0) - (a.soldCount || 0),
  );
  const visible = limit >= 999 ? sorted : sorted.slice(0, limit);
  const maxSold = Math.max(...sorted.map((i) => i.soldCount || 0), 1);

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
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                limit === l
                  ? "bg-sky-50 text-sky-600 border border-sky-300 font-semibold dark:bg-sky-600/20 dark:text-sky-400 dark:border-sky-700/50"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border border-transparent"
              }`}
            >
              {l >= 999 ? t("all_label") : l}
            </button>
          ))}
          <span className="text-slate-300 dark:text-slate-700 mx-0.5">|</span>
          <button
            onClick={() => setAsc(!asc)}
            className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors p-0.5 cursor-pointer"
            title={t("sort_toggle_title")}
          >
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
                <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                  {item.name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {item.count} {t("unit_product")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <ShoppingCart size={10} />
                <span>
                  {t("sold_label")}{" "}
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                    {item.soldCount ?? 0}
                  </strong>
                </span>
              </div>

              {/* Rãnh chứa và Thanh Tiến Trình */}
              <div
                className="h-2.5 rounded-full border overflow-hidden p-[1px] transition-colors duration-200
                              bg-slate-100 border-slate-200 
                              dark:bg-slate-900/80 dark:border-slate-800"
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300 shadow-[0_0_6px_rgba(56,189,248,0.15)]`}
                  style={{
                    width: `${((item.soldCount || 0) / maxSold) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[80px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          {t("no_data")}
        </div>
      )}
    </Card>
  );
};

export const Distribution = ({ distribution = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const { categories = [], brands = [], suppliers = [] } = distribution;
  return (
    <div className="grid gap-4 sm:grid-cols-3 items-start">
      <DistCard
        title={t("categories_title")}
        icon={<Tag size={16} />}
        items={categories}
        color="from-sky-500 to-blue-400"
      />
      <DistCard
        title={t("brands_title")}
        icon={<Building2 size={16} />}
        items={brands}
        color="from-violet-500 to-purple-400"
      />
      <DistCard
        title={t("suppliers_title")}
        icon={<Truck size={16} />}
        items={suppliers}
        color="from-emerald-500 to-teal-400"
      />
    </div>
  );
};
