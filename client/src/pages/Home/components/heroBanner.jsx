import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import {
  Mountain,
  Footprints,
  Dumbbell,
  Trophy,
  Bike,
  CircleDot,
  Waves,
  Activity,
  Users,
  Dribbble,
  Volleyball,
  Gamepad2,
} from "lucide-react";

import "swiper/css";

import banner1 from "@/assets/images/banner-gym.jpg";
import banner2 from "@/assets/images/baner-bong-da.png";
import banner3 from "@/assets/images/banner-boi-loi.jpg";
import banner4 from "@/assets/images/banner-the-thao-dien-tu.jpg";
import banner5 from "@/assets/images/leo-nui-banner.jpg";

const bannerImages = [banner1, banner2, banner3, banner4, banner5];

const quickCategories = [
  { name: "Leo núi", slug: "leo-nui", icon: <Mountain size={20} /> },
  { name: "Chạy bộ", slug: "chay-bo", icon: <Footprints size={20} /> },
  { name: "Gym & Fitness", slug: "gym-fitness", icon: <Dumbbell size={20} /> },
  { name: "Cầu lông", slug: "cau-long", icon: <Trophy size={20} /> },
  { name: "Xe đạp", slug: "xe-dap", icon: <Bike size={20} /> },
  { name: "Tennis", slug: "tennis", icon: <CircleDot size={20} /> },
  { name: "Bơi lội", slug: "boi-loi", icon: <Waves size={20} /> },
  { name: "Bóng đá", slug: "bong-da", icon: <Activity size={20} /> },
  { name: "Đồng đội", slug: "the-thao-dong-doi", icon: <Users size={20} /> },
  { name: "Bóng rổ", slug: "bong-ro", icon: <Dribbble size={20} /> },
  { name: "Bóng chuyền", slug: "bong-chuyen", icon: <Volleyball size={20} /> },
  { name: "Game", slug: "game", icon: <Gamepad2 size={20} /> },
];

export const HeroBanner = () => {
  return (
    <section className="relative bg-slate-900 text-white min-h-[550px] md:min-h-[620px] flex items-center justify-center font-sans select-none overflow-visible">
      {/* 1. Slider hình nền */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {bannerImages.map((imgSrc, index) => {
            const isFlipped = index === 1 || index === 4;
            return (
              <SwiperSlide key={index} className="w-full h-full">
                <img
                  src={imgSrc}
                  alt={`Banner ${index + 1}`}
                  className={`w-full h-full object-cover object-center ${
                    isFlipped ? "scale-x-[-1]" : ""
                  }`}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* 2. Lớp phông phủ tối */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10 pointer-events-none" />

      {/* 3. Nội dung chữ bên trái */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-20 w-full text-left">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block bg-blue-500 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded text-black shadow-sm">
            Bộ sưu tập mới 2026
          </span>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none text-white">
            Giới hạn là thứ <br />
            <span className="text-xl md:text-2xl font-normal normal-case block my-2 text-blue-400">
              chỉ
            </span>
            để vượt qua
          </h1>

          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            <span className="text-blue-400 font-semibold">
              Mỗi giới hạn đều là cơ hội để bứt phá.{" "}
            </span>
            Với những sản phẩm thể thao được tuyển chọn từ các thương hiệu uy
            tín, chúng tôi đồng hành cùng bạn trên hành trình vươn tới những mục
            tiêu lớn hơn.
          </p>

          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tư vấn mua hàng: <span className="text-white">0812312831</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-blue-600 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-teal-500 bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white transition-colors"
              >
                Zalo
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-white bg-white/10 text-white hover:bg-white hover:text-black transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Thanh Icon danh mục trượt ngang LIÊN TỤC (Marquee Mode) */}
      <div className="absolute bottom-0 left-[8%] sm:right-8 lg:right-12 translate-y-1/2 z-40 max-w-[calc(100vw-32px)] md:max-w-[580px] lg:max-w-[680px]">
        <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border-2 border-slate-700/80 shadow-2xl">
          <Swiper
            modules={[Autoplay, FreeMode]}
            slidesPerView="auto"
            spaceBetween={8}
            freeMode={true}
            speed={5000} // Thời gian hoàn thành 1 lượt (càng lớn chạy càng chậm & mượt)
            autoplay={{
              delay: 0, // Delay = 0 để trượt liên tục không dừng
              disableOnInteraction: false,
              pauseOnMouseEnter: true, // Rê chuột vào sẽ dừng để click
            }}
            loop={true}
            /* Thêm style linear để hiệu ứng trôi liên tục như dòng chữ chạy */
            className="w-full flex items-center [&_.swiper-wrapper]:!timing-function-linear [&_.swiper-wrapper]:!ease-linear"
          >
            {quickCategories.map((cat, idx) => (
              <SwiperSlide key={idx} className="!w-auto">
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200 group border border-slate-700/60 hover:border-blue-500 hover:-translate-y-1 shadow-md"
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-[9px] font-semibold mt-1 px-1 text-center truncate max-w-[60px] leading-tight">
                    {cat.name}
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};
