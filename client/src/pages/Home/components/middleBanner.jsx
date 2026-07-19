import { ArrowRight } from "lucide-react";

export const MiddleBanner = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="relative h-44 md:h-52 rounded-2xl overflow-hidden group shadow-md">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="World Cup Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/85 via-amber-700/60 to-transparent p-7 md:p-10 flex items-center">
          <div className="space-y-2 max-w-lg">
            <span className="inline-block bg-white/15 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded tracking-widest text-amber-100 backdrop-blur-sm">
              Ấn phẩm đặc biệt
            </span>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
              ẤN PHẨM WORLD CUP 2026
              <br />
              CHÍNH THỨC LỘ DIỆN
            </h2>
            <p className="text-[13px] text-amber-100/80 max-w-md line-clamp-1">
              Khám phá trọn vẹn thông tin, đội hình chiến thuật và các ngôi sao
              hàng đầu.
            </p>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-amber-300 pt-1 group-hover:gap-2.5 transition-all">
              Khám phá ngay <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
