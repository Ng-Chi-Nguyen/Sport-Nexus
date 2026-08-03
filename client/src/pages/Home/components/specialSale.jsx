import { useState } from "react";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TitleWithIcon } from "@/components/ui/title";
import { CarouselPagination } from "@/components/ui/pagination";

export const SpecialSale = ({ products = [], titleKey = "best_seller" }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6; // Đặt mỗi trang đúng 6 sản phẩm

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 font-sans my-3">
      <TitleWithIcon icon={Trophy} title={t(titleKey)} />
      {/* Lưới sản phẩm (hiển thị 6 sản phẩm trên mỗi trang) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {displayedProducts.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>

      {/* Thanh tiến trình và nút điều hướng ngang hàng ở dưới */}
      <CarouselPagination
        className="mt-8"
        totalPages={totalPages}
        current={currentIndex}
        onChange={setCurrentIndex}
      />
    </div>
  );
};
