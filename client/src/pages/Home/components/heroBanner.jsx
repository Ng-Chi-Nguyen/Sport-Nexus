import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

import banner1 from "@/assets/images/banner-gym.jpg";
import banner2 from "@/assets/images/baner-bong-da.png";
import banner3 from "@/assets/images/banner-boi-loi.jpg";
import banner4 from "@/assets/images/banner-the-thao-dien-tu.jpg";
import banner5 from "@/assets/images/leo-nui-banner.jpg";

const bannerImages = [banner1, banner2, banner3, banner4, banner5];

export const HeroBanner = () => {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden min-h-[50vh] md:min-h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect={"fade"}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full h-full"
        >
          {bannerImages.map((imgSrc, index) => {
            // Kiểm tra nếu là ảnh bóng đá (index 1) hoặc ảnh leo núi (index 4) thì lật ngược lại
            const isFlipped = index === 1 || index === 4;

            return (
              <SwiperSlide key={index} className="w-full h-full">
                <img
                  src={imgSrc}
                  alt={`Bứt phá giới hạn thể thao ${index + 1}`}
                  className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                    isFlipped ? "scale-x-[-1]" : ""
                  }`}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Lớp nền mờ phía sau */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900/80 to-transparent z-10" />

      {/* Nội dung Banner */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-20 w-full text-left">
        <div className="max-w-3xl space-y-6">
          <span className="inline-block bg-blue-500 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded text-black">
            Bộ sưu tập mới 2026
          </span>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            Giới hạn là thứ <br />
            <span className="text-xl md:text-2xl font-normal normal-case block my-2 text-blue-400">
              chỉ
            </span>
            để vượt qua
          </h1>

          <p className="text-gray-200 text-base md:text-lg">
            <span className="text-blue-400">
              Mỗi giới hạn đều là cơ hội để bứt phá.{" "}
            </span>
            Với những sản phẩm thể thao được tuyển chọn từ các thương hiệu uy
            tín, chúng tôi đồng hành cùng bạn trên hành trình chinh phục hiệu
            suất, nâng tầm phong cách và vươn tới những mục tiêu lớn hơn.
          </p>

          {/* Khu vực tư vấn mua hàng */}
          <div className="pt-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Tư vấn mua hàng: <span className="text-blue-400">0812312831</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://web.facebook.com/nguyen.chi.nguyen.791941?locale=vi_VN"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold uppercase tracking-wider border border-blue-600 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition duration-150"
              >
                Facebook
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold uppercase tracking-wider border border-teal-500 bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition duration-150"
              >
                Zalo
              </a>
              <a
                href="https://www.tiktok.com/@chinguyen.ng"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold uppercase tracking-wider border border-white bg-white/10 text-white hover:bg-white hover:text-black transition duration-150"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
