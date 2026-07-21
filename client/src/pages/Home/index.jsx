import { useLoaderData } from "react-router-dom";
import { SpecialSale } from "./components/specialSale";
import { CategoryBanners } from "./components/categoryBanners";
import { NewArrivals } from "./components/newArrivals";
import { ProductSection } from "./components/productSection";
import { MiddleBanner } from "./components/middleBanner";

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
    <div className="min-h-screen text-slate-800 font-sans antialiased selection:bg-blue-500/20">
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
      <MiddleBanner brands={brands} />
    </div>
  );
};

export default HomePage;
