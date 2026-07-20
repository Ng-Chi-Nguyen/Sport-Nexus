import { useLoaderData } from "react-router-dom";
import { SpecialSale } from "./components/specialSale";
import { CategoryBanners } from "./components/categoryBanners";
import { NewArrivals } from "./components/newArrivals";
import { ProductSection } from "./components/productSection";
import { MiddleBanner } from "./components/middleBanner";
import { SportsNews } from "./components/sportsNews";

const HomePage = () => {
  const apiData = useLoaderData();
  console.log(">>> HomePage loader data:", apiData);

  const {
    newestProducts = [],
    bestSellers = [],
    productsByCategory = [],
    brands = [],
    categories = [],
  } = apiData || {};

  const activeCategories = productsByCategory.filter(
    (item) => item.products.length > 0,
  );
  // console.log(bestSellers);
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 font-sans antialiased selection:bg-blue-500/20">
      {bestSellers.length > 0 && <SpecialSale products={bestSellers} />}
      {categories.length > 0 && <CategoryBanners categories={categories} />}
      {newestProducts.length > 0 && <NewArrivals products={newestProducts} />}
      {activeCategories.map(({ category, products }) => (
        <ProductSection
          key={category.id}
          title={category.name}
          products={products}
        />
      ))}
      <MiddleBanner />
      <SportsNews />
      {brands.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-14">
          <div className="bg-white rounded-2xl py-6 px-8 border border-slate-100 shadow-sm flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50">
            {brands.map((brand) => (
              <span
                key={brand.id}
                className="font-bold text-slate-400 text-lg tracking-tight hover:text-blue-600 transition-colors"
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
