import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export const VariantPrices = ({ data = [] }) => {
  const profitItems = data.filter((v) => v.costPrice > 0);
  const display =
    profitItems.length > 0 ? profitItems.slice(0, 20) : data.slice(0, 20);

  return (
    <Card
      title="Giá vốn và giá bán theo biến thể"
      icon={<DollarSign size={16} />}
    >
      {display.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-2 pr-2 font-medium">Sản phẩm</th>
                <th className="pb-2 pr-2 font-medium text-right">Tồn</th>
                <th className="pb-2 pr-2 font-medium text-right">Giá vốn</th>
                <th className="pb-2 pr-2 font-medium text-right">Giá bán</th>
                <th className="pb-2 pr-2 font-medium text-right">Lãi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {display.map((v) => {
                // Tinh chỉnh màu hiển thị biên lợi nhuận (Profit Margin Color)
                const marginColor =
                  v.profitMargin >= 20
                    ? "text-emerald-600 dark:text-emerald-400"
                    : v.profitMargin > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-red-400";

                return (
                  <tr
                    key={v.variantId}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                  >
                    <td className="py-2 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {v.productName}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-700 dark:text-slate-300">
                      {v.stock}
                    </td>
                    <td className="py-2 pr-2 text-right text-slate-500 dark:text-slate-400">
                      {v.costPrice ? formatCurrency(v.costPrice) : "—"}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(v.sellingPrice)}
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <span className={`font-bold ${marginColor}`}>
                        {v.profitMargin > 0 ? "+" : ""}
                        {v.profitMargin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};
