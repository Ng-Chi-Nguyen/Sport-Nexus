import { Clock } from "lucide-react";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";

export const NewArrivals = ({ products }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-100">
            <Clock className="text-white" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              New Arrivals
            </span>
            <h3 className="text-lg font-black text-slate-900">Hàng mới về</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>

          <SeeMore />
        </div>
      </div>
    </div>
  );
};
