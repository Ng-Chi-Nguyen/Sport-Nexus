import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export const VariantTable = ({ data = [] }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  return (
    <Card title={t("variants_per_product")} icon={<Layers size={16} />}>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">{t("name_col")}</th>
                <th className="pb-2 pr-2 font-medium text-right">
                  {t("variant_count_col")}
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {data.map((item) => (
              <tr
                key={item.productId}
                className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
              >
                <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                  {item.name}
                </td>
                <td className="py-2 pr-2 text-right font-bold text-sky-600 dark:text-sky-400">
                  {item.variantCount}
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
