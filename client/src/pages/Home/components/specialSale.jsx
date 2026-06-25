import { useState } from "react";
import { ShoppingCart } from "lucide-react";

export const SpecialSale = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Đổi dải màu gradient từ rose sang blue */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-3xl p-1 pt-0 shadow-2xl overflow-hidden">
        <div className="flex justify-center">
          <div className="bg-blue-800 text-white text-sm md:text-base font-black px-12 py-3 rounded-b-2xl uppercase tracking-widest shadow-md italic border-x border-b border-blue-900/40">
            💥 Special Sale !
          </div>
        </div>
        {/* Đổi nền khối chứa sản phẩm sang mã blue-600 (#2563EB) */}
        <div className="p-4 md:p-6 bg-[#2563EB] rounded-b-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all duration-200 group relative"
              >
                <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">
                  {product.tag}
                </div>
                <div className="aspect-square w-full rounded-lg bg-slate-50/50 overflow-hidden mb-3 relative flex items-center justify-center">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge giảm giá đổi sang xanh */}
                  <div className="absolute bottom-2 right-2 bg-blue-600 text-white font-black text-[10px] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    {product.discount}
                  </div>
                </div>
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="pt-1 border-t border-slate-50">
                    <p className="text-slate-400 line-through text-[11px] font-medium">
                      {product.oldPrice}
                    </p>
                    <p className="text-sm font-black text-blue-600 mt-0.5">
                      {product.price}
                    </p>
                  </div>
                  <button className="w-full mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5">
                    <ShoppingCart size={12} /> Đặt hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-1.5 mt-6">
            {[0, 1, 2, 3, 4, 5].map((dot) => (
              <button
                key={dot}
                onClick={() => setCurrentSlide(dot)}
                className={`h-1.5 rounded-full transition-all duration-200 ${currentSlide === dot ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
