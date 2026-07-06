import { useLoaderData } from "react-router-dom";
import { HeroBanner } from "./components/heroBanner";
import { SpecialSale } from "./components/specialSale";
import { CategoryBanners } from "./components/categoryBanners";
import { NewArrivals } from "./components/newArrivals";
import { ProductSection } from "./components/productSection";
import { MiddleBanner } from "./components/middleBanner";
import { SportsNews } from "./components/sportsNews";
import { NavCategoryMenu } from "@/components/NavCategoryMenu";

const HomePage = () => {
  const data = useLoaderData();
  console.log(">>> HomePage loader data:", data);
  // ─── MOCK DATA (BẠN GIỮ NGUYÊN HOÀN TOÀN MẢNG DATA CŨ) ───
  const saleProducts = [
    {
      id: 1,
      tag: "GIẢM TỐC",
      name: "Áo thi đấu chính thức giải bi-a Hanoi Open 2025 - Đen",
      price: "375.000đ",
      oldPrice: "750.000đ",
      discount: "-50%",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      tag: "GIẢM TỐC",
      name: "Áo thi đấu chính thức giải bi-a Hanoi Open 2025 - Trắng",
      price: "375.000đ",
      oldPrice: "750.000đ",
      discount: "-50%",
      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      tag: "GIẢM TỐC",
      name: "Áo phông thể thao giải bi-a Hanoi Open 2025 - Đen đặc biệt",
      price: "250.000đ",
      oldPrice: "500.000đ",
      discount: "-50%",
      img: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      tag: "GIẢM TỐC",
      name: "Áo phông thể thao giải bi-a Hanoi Open 2025 - Trắng basic",
      price: "250.000đ",
      oldPrice: "500.000đ",
      discount: "-50%",
      img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 5,
      tag: "GIẢM TỐC",
      name: "Áo polo Seagames 2025 Rise Beyond - Trắng/Đỏ",
      price: "269.000đ",
      oldPrice: "445.000đ",
      discount: "-40%",
      img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const newArrivals = [
    {
      id: 1,
      name: "Giày Pickleball Nữ Jogarbola Terra màu 'Deep Pink'",
      price: "1.490.000đ",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Giày Pickleball Nữ Jogarbola Terra màu 'White/Purple'",
      price: "1.490.000đ",
      img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Giày Pickleball Jogarbola Terra màu 'White/Black'",
      price: "1.490.000đ",
      img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      name: "Giày Pickleball Jogarbola Terra màu 'Green/Orange'",
      price: "1.490.000đ",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 5,
      name: "Giày Pickleball Jogarbola Terra màu 'Blue/White'",
      price: "1.490.000đ",
      img: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const pickleballProducts = [
    {
      id: 1,
      name: "Vợt Pickleball Jogarbola Solus Core 'Pink' JG-SolusC-04",
      price: "1.950.000đ",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Vợt Pickleball Jogarbola Solus Core 'Green' JG-SolusC-03",
      price: "1.950.000đ",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Vợt Pickleball Jogarbola Solus Core 'Red' JG-SolusC-02",
      price: "1.950.000đ",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      name: "Vợt Pickleball Jogarbola Solus Core 'Black' JG-SolusC-01",
      price: "1.950.000đ",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 5,
      name: "Vợt Pickleball Jogarbola Solus Tiêu chuẩn USA 'Vulca'",
      price: "3.950.000đ",
      img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const volleyballProducts = [
    {
      id: 1,
      name: "Bộ quần áo thi đấu tuyển bóng chuyền Nam - Đỏ",
      price: "399.000đ",
      oldPrice: "445.000đ",
      discount: "-10%",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Bộ quần áo thi đấu tuyển bóng chuyền Nam - Tím/Trắng",
      price: "399.000đ",
      oldPrice: "445.000đ",
      discount: "-10%",
      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Bộ quần áo thi đấu tuyển bóng chuyền Nam - Xanh dương",
      price: "399.000đ",
      oldPrice: "445.000đ",
      discount: "-10%",
      img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      name: "Bộ quần áo luyện tập đội tuyển bóng chuyền Nữ Việt Nam",
      price: "298.000đ",
      img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const billiardProducts = [
    {
      id: 1,
      name: "Gậy Bi-a Universal Jump chuyên dụng nhảy bi chính hãng",
      price: "13.100.000đ",
      img: "https://images.unsplash.com/photo-1544192240-4a34fed0104c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Gậy Bi-a Universal Break phá bi dòng công nghệ đỉnh cao",
      price: "13.100.000đ",
      img: "https://images.unsplash.com/photo-1544192240-4a34fed0104c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Cơ bida lỗ Universal dòng carbon siêu bền chống cong vênh",
      price: "22.800.000đ",
      img: "https://images.unsplash.com/photo-1544192240-4a34fed0104c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      name: "Gậy Bi-a lỗ Universal ELEGA cao cấp khảm họa tiết tinh xảo",
      price: "25.700.000đ",
      img: "https://images.unsplash.com/photo-1544192240-4a34fed0104c?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const newsList = [
    {
      title:
        "Sân bóng chuyền hơi: Tiêu chuẩn thiết kế và sự khác biệt với sân đấu lớn",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=150&q=80",
    },
    {
      title: "Tiêu chuẩn xây dựng sân bóng chuyền chất lượng cho câu lạc bộ",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=150&q=80",
    },
    {
      title:
        "Kích thước sân bóng chuyền hơi mới nhất: Những điều cần lưu ý khi kẻ vạch",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=150&q=80",
    },
    {
      title:
        "Cập nhật luật bóng chuyền hơi mới nhất: Quy định đổi sân và tính điểm",
      img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=150&q=80",
    },
  ];

  // Cấu hình các Tabs điều hướng của Pickleball
  const pickleballTabs = [
    { id: "vot", label: "Vợt Pickleball" },
    { id: "giay", label: "Giày Pickleball" },
    { id: "phukien", label: "Phụ kiện Pickleball" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 font-sans antialiased selection:bg-rose-500/20">
      <NavCategoryMenu />
      {/* 1. Khu vực Banner lớn trên đỉnh */}
      <HeroBanner />

      {/* 2. Khối sản phẩm khuyến mãi Đặc Biệt */}
      <SpecialSale products={saleProducts} />

      {/* 3. Khối 3 Banner đại diện các môn thể thao (Mới thêm) */}
      <CategoryBanners />

      {/* 4. Khối sản phẩm hàng mới về */}
      <NewArrivals products={newArrivals} />

      {/* 5. Khối Sản phẩm môn Pickleball (Có Tab Filter) */}
      <ProductSection
        title="Pickleball"
        iconLetter="P"
        iconBg="bg-orange-500"
        tabs={pickleballTabs}
        products={pickleballProducts}
      />

      {/* 6. Khối Sản phẩm môn Bóng Chuyền (Có Large Banner dọc đi kèm) */}
      <ProductSection
        title="Bóng chuyền"
        iconLetter="V"
        iconBg="bg-sky-600"
        products={volleyballProducts}
        hasBannerCard={true}
        bannerTitle="THE FRONTLINE EDITION"
        bannerImg="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80"
      />

      {/* 7. Khối Sản phẩm môn Bi-a (Billiards) */}
      <ProductSection
        title="Bi-a"
        iconLetter="B"
        iconBg="bg-emerald-600"
        products={billiardProducts}
      />

      {/* 8. Banner rộng quảng cáo giữa trang */}
      <MiddleBanner />

      {/* 9. Khối tin tức tư vấn cẩm nang thể thao */}
      <SportsNews news={newsList} />

      {/* 10. Dải logo các thương hiệu đối tác dưới đáy trang */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        <div className="bg-white rounded-xl py-5 px-6 border border-slate-100 shadow-sm flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          <span className="font-mono text-slate-400 font-black text-lg tracking-wider italic">
            VIETNAM_SHOP
          </span>
          <span className="font-sans text-slate-400 font-extrabold text-xl tracking-tight">
            PEAK_sports
          </span>
          <span className="font-serif text-slate-400 font-black text-lg uppercase tracking-widest">
            Spalding
          </span>
          <span className="font-sans text-slate-400 font-black text-xl tracking-tighter italic">
            ĐỘNG_LỰC
          </span>
          <span className="font-sans text-[#E11D48] font-black text-lg tracking-wider">
            JOGARBOLA
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
