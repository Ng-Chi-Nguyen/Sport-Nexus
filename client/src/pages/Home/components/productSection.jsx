import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-yellow-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-green-500",
];

const iconLetter = (name) => name.charAt(0).toUpperCase();

export const ProductSection = ({ title, products = [] }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADIENTS[0]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
            >
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
              <div
                key={p.id}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-square rounded-t-xl overflow-hidden bg-slate-50">
                  <img
                    src={p.thumbnail || `https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80&sig=${p.id}`}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!p.thumbnail && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} flex items-center justify-center`}>
                      <span className="text-white/30 font-black text-6xl select-none">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <h4 className="text-[13px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-base font-black text-blue-600">
                    {formatCurrency(p.min_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
