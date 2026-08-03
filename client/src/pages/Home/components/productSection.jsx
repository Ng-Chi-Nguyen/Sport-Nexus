import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductCard } from "@/components/ui/card";
import { CarouselPagination } from "@/components/ui/pagination";

export const ProductSection = ({ title, products = [] }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6;

  const categoryId = products[0]?.category?.id || "";

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Ép an toàn vị trí trang không bị lệch
  const safeIndex = Math.min(currentIndex, Math.max(0, totalPages - 1));

  const displayedProducts = products.slice(
    safeIndex * itemsPerPage,
    (safeIndex + 1) * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 text-slate-800 dark:text-slate-100 transition-colors duration-200 border-t border-blue-600">
      <div className="bg-transparent rounded-2xl overflow-hidden">
        {/* Tiêu đề và nút Xem tất cả */}
        <div className="flex items-center justify-between gap-4 px-2 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black text-sky-600 dark:text-sky-400 flex items-center gap-2 tracking-tight">
              <span className="border-b-2 border-sky-600 dark:border-sky-400 pb-0.5">
                {title}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/san-pham?category_ids=${categoryId}`)}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-0.5 transition-colors shrink-0 cursor-pointer"
          >
            {t("view_all")} <ChevronRight size={14} />
          </button>
        </div>

        {/* Lưới sản phẩm */}
        <div className="px-2 pb-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {displayedProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>

          {/* Thanh tiến trình và cặp nút điều hướng */}
          <CarouselPagination
            className="mt-6 pt-2"
            totalPages={totalPages}
            current={safeIndex}
            onChange={setCurrentIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
