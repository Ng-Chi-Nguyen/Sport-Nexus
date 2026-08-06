import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/ui/card";
import { TitleWithIcon } from "@/components/ui/title";
import { CarouselPagination } from "@/components/ui/pagination";
import { useTranslation } from "react-i18next";

const FavoritesPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "favorite" });
  const { ids } = useWishlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist-products", ids.join(",")],
    queryFn: () => searchApi.getProductsByIds(ids),
    enabled: ids.length > 0,
  });

  const products = data?.success ? data.data.products : [];

  // Tính toán phân trang
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage,
  );

  if (ids.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
          <Breadcrumbs
            data={[
              { title: t("home"), route: "/" },
              { title: t("liked_products"), route: "" },
            ]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {t("no_favorite_products", "Chưa có sản phẩm yêu thích")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                "favorite_hint",
                "Bấm trái tim trên sản phẩm để lưu vào danh sách này.",
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: t("home"), route: "/" },
            { title: t("liked_products"), route: "" },
          ]}
        />

        <TitleWithIcon
          icon={Heart}
          title={`${t("liked_products")} (${ids.length})`}
        />

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400 mt-2">
            {t("product_not_found", "Không tìm thấy sản phẩm")}
          </div>
        ) : (
          <>
            {/* Lưới sản phẩm (hiển thị tối đa 12 sản phẩm mỗi trang) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mt-2">
              {displayedProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>

            {/* Thanh phân trang ngang hàng ở dưới */}
            {totalPages > 1 && (
              <CarouselPagination
                className="mt-8"
                totalPages={totalPages}
                current={currentIndex}
                onChange={setCurrentIndex}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
