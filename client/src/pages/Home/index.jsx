import { useLoaderData } from "react-router-dom";
import { HeroBanner } from "./components/heroBanner";
import { SpecialSale } from "./components/specialSale";
import { CategoryBanners } from "./components/categoryBanners";
import { NewArrivals } from "./components/newArrivals";
import { ProductSection } from "./components/productSection";
import { MiddleBanner } from "./components/middleBanner";
import { SportsNews } from "./components/sportsNews";
import { NavCategoryMenu } from "@/components/NavCategoryMenu";
import { formatCurrency } from "@/utils/formatters";

const GRADIENT_SET = [
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-yellow-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-green-500",
];

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80";

const mapApiProduct = (p, idx = 0) => ({
  id: p.id,
  name: p.name,
  price: formatCurrency(p.min_price),
  img: p.thumbnail || `${PLACEHOLDER}&sig=${p.id}`,
  gradient: GRADIENT_SET[idx % GRADIENT_SET.length],
  initial: p.name.charAt(0).toUpperCase(),
});

const newsList = [
  {
    title: "Sân bóng chuyền hơi: Tiêu chuẩn thiết kế và sự khác biệt với sân đấu lớn",
    img: PLACEHOLDER,
  },
  {
    title: "Tiêu chuẩn xây dựng sân bóng chuyền chất lượng cho câu lạc bộ",
    img: PLACEHOLDER,
  },
  {
    title: "Kích thước sân bóng chuyền hơi mới nhất: Những điều cần lưu ý khi kẻ vạch",
    img: PLACEHOLDER,
  },
  {
    title: "Cập nhật luật bóng chuyền hơi mới nhất: Quy định đổi sân và tính điểm",
    img: PLACEHOLDER,
  },
];

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

  const saleProducts = bestSellers.map(mapApiProduct);
  const newArrivals = newestProducts.map(mapApiProduct);

  const activeCategories = productsByCategory.filter(
    (item) => item.products.length > 0,
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 font-sans antialiased selection:bg-rose-500/20">
      <NavCategoryMenu />
      <HeroBanner />
      {saleProducts.length > 0 && <SpecialSale products={saleProducts} />}
      {categories.length > 0 && <CategoryBanners categories={categories} />}
      {newArrivals.length > 0 && <NewArrivals products={newArrivals} />}
      {activeCategories.map(({ category, products }, idx) => {
        const gradient = GRADIENT_SET[idx % GRADIENT_SET.length];
        const letter = category.name.charAt(0).toUpperCase();
        return (
          <ProductSection
            key={category.id}
            title={category.name}
            iconLetter={letter}
            iconGradient={gradient}
            products={products.map((p, i) => mapApiProduct(p, i))}
          />
        );
      })}
      <MiddleBanner />
      <SportsNews news={newsList} />
      <div className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-2xl py-6 px-8 border border-slate-100 shadow-sm flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50">
          {brands.length > 0
            ? brands.map((brand) => (
                <span
                  key={brand.id}
                  className="font-bold text-slate-400 text-lg tracking-tight hover:text-blue-600 transition-colors"
                >
                  {brand.name}
                </span>
              ))
            : (
              <>
                <span className="font-bold text-slate-400 text-lg tracking-tight">VIETNAM_SHOP</span>
                <span className="font-bold text-slate-400 text-lg tracking-tight">PEAK_sports</span>
                <span className="font-bold text-slate-400 text-lg tracking-tight">Spalding</span>
                <span className="font-bold text-slate-400 text-lg tracking-tight">ĐỘNG_LỰC</span>
                <span className="font-bold text-[#E11D48] text-lg tracking-tight">JOGARBOLA</span>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
