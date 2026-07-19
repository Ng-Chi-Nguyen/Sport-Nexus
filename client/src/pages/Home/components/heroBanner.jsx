import { Phone, ChevronRight } from "lucide-react";

export const HeroBanner = () => {
  return (
    <div className="w-full pt-[90px] bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          <div className="flex items-center gap-3">
            <span className="font-black text-blue-600 tracking-tight text-2xl">
              SPORT NEXUS
            </span>
            <div className="h-5 w-px bg-slate-300" />
            <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              Official Store
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-500 tracking-wide uppercase">
              Giảm giá đặc biệt - Miễn phí giao hàng
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Giày thể thao
              <br />
              <span className="text-blue-600">Jogarbola Vortex</span>
            </h1>
            <div className="flex items-center gap-3 pt-1 justify-center lg:justify-start">
              <span className="bg-blue-600 text-white font-black text-3xl md:text-4xl px-5 py-2 rounded-xl inline-block tracking-tight shadow-lg shadow-blue-600/20">
                1.690.000₫
              </span>
              <span className="text-slate-300 text-lg line-through font-medium">
                2.390.000₫
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 text-white pl-5 pr-4 py-3 rounded-xl shadow-lg">
            <Phone className="text-blue-400" size={18} />
            <div className="leading-none flex-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Tư vấn mua hàng
              </p>
              <p className="text-base font-bold text-blue-400 mt-0.5">
                0812.312.831
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <ChevronRight className="text-slate-500" size={16} />
          </div>
        </div>
        <div className="order-1 lg:order-2 flex justify-center items-center">
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 via-transparent to-orange-100/30 rounded-full" />
            <div className="relative flex items-center justify-center">
              <div className="relative z-20 w-56 md:w-64 aspect-square drop-shadow-2xl -translate-y-2 group-hover:scale-105 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
                  alt="Jogarbola Vortex"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
