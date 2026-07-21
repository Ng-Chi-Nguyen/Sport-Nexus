import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";

const iconLetter = (name) => name.charAt(0).toUpperCase();

export const ProductSection = ({ title, products = [] }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {iconLetter(title)}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Danh mục
              </span>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
            </div>
          </div>
          <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors shrink-0">
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
