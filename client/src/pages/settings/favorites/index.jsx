import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import { useWishlist } from "@/contexts/WishlistContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/ui/card";
import { TitleWithIcon } from "@/components/ui/title";

const FavoritesPage = () => {
  const { ids } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist-products", ids.join(",")],
    queryFn: () => searchApi.getProductsByIds(ids),
    enabled: ids.length > 0,
  });

  const products = data?.success ? data.data.products : [];

  if (ids.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="mx-auto max-w-[1400px] mt-6 md:mt-8 px-4 sm:px-6">
          <Breadcrumbs
            data={[
              { title: "Trang chủ", route: "/" },
              { title: "Sản phẩm đã thích", route: "" },
            ]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bấm trái tim trên sản phẩm để lưu vào danh sách này.
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
            { title: "Trang chủ", route: "/" },
            { title: "Sản phẩm đã thích", route: "" },
          ]}
        />

        <TitleWithIcon
          icon={Heart}
          title={`Sản phẩm đã thích (${ids.length})`}
        />

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400 mt-2">
            Không tìm thấy sản phẩm
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mt-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
