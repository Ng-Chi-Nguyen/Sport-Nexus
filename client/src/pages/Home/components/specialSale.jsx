import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SpecialSale = ({ products = [] }) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 font-sans">
      <h2 className="mb-6 text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-blue-600" strokeWidth={3} />
        {t("best_seller")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>

      <SeeMore to="/san-pham?sort=best-selling" label={t("see_more")} />
    </div>
  );
};
