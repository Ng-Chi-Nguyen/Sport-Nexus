import { ShoppingCart, Sparkles } from "lucide-react";

const GradPlaceholder = ({ gradient, initial }) => (
  <div
    className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
  >
    <span className="text-white/30 font-black text-6xl select-none">
      {initial}
    </span>
  </div>
);

export const SpecialSale = ({ products }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-100/60 overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-200">
            <Sparkles className="text-white" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              Bán chạy nhất
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Best Sellers
            </h3>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-square rounded-t-xl overflow-hidden bg-slate-50">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-full absolute inset-0">
                    <GradPlaceholder
                      gradient={product.gradient}
                      initial={product.initial}
                    />
                  </div>
                  {product.tag && (
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-lg shadow-rose-200/50">
                      {product.tag}
                    </div>
                  )}
                  {product.discount && (
                    <div className="absolute bottom-2 right-2 bg-white text-rose-600 font-black text-[11px] w-8 h-8 rounded-full flex items-center justify-center border-2 border-rose-100 shadow-md">
                      {product.discount}
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-[13px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="pt-1.5 border-t border-slate-50">
                    {product.oldPrice && (
                      <p className="text-slate-300 line-through text-[11px] font-medium">
                        {product.oldPrice}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm font-black text-rose-600">
                        {product.price}
                      </p>
                      <button className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1">
                        <ShoppingCart size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
