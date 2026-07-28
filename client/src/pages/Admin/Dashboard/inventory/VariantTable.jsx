import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { Layers } from "lucide-react";

export const VariantTable = ({ data = [] }) => (
  <Card title="Số biến thể theo sản phẩm" icon={<Layers size={16} />}>
    {data.length ? (
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <th className="pb-2 pr-2 font-medium">Sản phẩm</th>
            <th className="pb-2 pr-2 font-medium text-right">Số biến thể</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.productId} className="border-b border-slate-900 last:border-0">
              <td className="py-1.5 pr-2 font-medium text-slate-200 truncate max-w-[240px]">{item.name}</td>
              <td className="py-1.5 pr-2 text-right font-semibold text-sky-400">{item.variantCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">Chưa có dữ liệu</div>
    )}
  </Card>
);
