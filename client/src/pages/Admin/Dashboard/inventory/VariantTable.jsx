import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Layers } from "lucide-react";

export const VariantTable = ({ data = [] }) => (
  <Card title="Số biến thể theo sản phẩm" icon={<Layers size={16} />}>
    {data.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="pb-2 pr-2 font-medium">Sản phẩm</th>
              <th className="pb-2 pr-2 font-medium text-right">Số biến thể</th>
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
        Chưa có dữ liệu
      </div>
    )}
  </Card>
);
