import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";

export const SpecialSale = ({ products = [] }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 font-sans select-none">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
        Bán chạy nhất
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>

      <SeeMore />
    </div>
  );
};
