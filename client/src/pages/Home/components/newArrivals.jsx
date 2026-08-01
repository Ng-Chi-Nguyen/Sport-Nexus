import { Clock } from "lucide-react";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";
import { useTranslation } from "react-i18next";

export const NewArrivals = ({ products }) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="mb-6 text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
        <Clock className="tw-5 h-5 text-blue-600" strokeWidth={3} />
        {t("new_arrivals")}
      </h2>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {products.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>

        <SeeMore to="/san-pham?sort=newest" label={t("see_more")} />
      </div>
    </div>
  );
};
