import { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { Rocket } from "lucide-react";
import { SpecialSale } from "./components/specialSale";
import { CategoryBanners } from "./components/categoryBanners";
import { NewArrivals } from "./components/newArrivals";
import { ProductSection } from "./components/productSection";
import { MiddleBanner } from "./components/middleBanner";
import { CouponsSection } from "./components/couponsSection";

const HomePage = () => {
  const apiData = useLoaderData();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Theo dõi vị trí cuộn trang để hiện/ẩn nút
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const {
    newestProducts = [],
    bestSellersThisMonth = [],
    bestSellersAllTime = [],
    productsByCategory = [],
    brands = [],
    categories = [],
    coupons = [],
  } = apiData || {};

  const activeCategories = productsByCategory.filter(
    (item) => item.products.length > 0,
  );

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-sky-500/20">
      {coupons.length > 0 && <CouponsSection coupons={coupons} />}
      {bestSellersThisMonth.length > 0 && <SpecialSale products={bestSellersThisMonth} titleKey="best_seller_month" />}
      {bestSellersAllTime.length > 0 && <SpecialSale products={bestSellersAllTime} titleKey="best_seller_all_time" />}
      {categories.length > 0 && <CategoryBanners categories={categories} />}
      {newestProducts.length > 0 && <NewArrivals products={newestProducts} />}
      {activeCategories.map(({ category, products }) => (
        <ProductSection
          key={category.id}
          title={category.name}
          products={products}
        />
      ))}
      <MiddleBanner brands={brands} />

      {/* Nút cuộn lên đầu trang với hiệu ứng bay lên của rocket */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 transition-all duration-300 cursor-pointer animate-in fade-in zoom-in group"
          aria-label="Scroll to top"
          title="Cuộn lện đầu trang"
        >
          <Rocket
            size={24}
            className="transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-125 active:-translate-y-8 active:scale-95 active:rotate-12"
          />
        </button>
      )}
    </div>
  );
};

export default HomePage;
