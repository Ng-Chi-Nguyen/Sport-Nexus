import { useState } from "react";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";
import { useTranslation } from "react-i18next";
import { TitleWithIcon } from "@/components/ui/title";
import { Clock } from "lucide-react";
import { CarouselPagination } from "@/components/ui/pagination";

export const NewArrivals = ({ products }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6;

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 border-t border-blue-600">
      <TitleWithIcon icon={Clock} title={t("new_arrivals")} />
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {displayedProducts.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>

        <CarouselPagination
          className="mt-6"
          totalPages={totalPages}
          current={currentIndex}
          onChange={setCurrentIndex}
        />

        <SeeMore to="/san-pham?sort=newest" label={t("see_more")} />
      </div>
    </div>
  );
};
