import { Phone } from "lucide-react";

export const HeroBanner = () => {
  return (
    <div className="w-full pt-[90px] bg-white border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        <div className="lg:col-span-7 relative flex justify-center items-center h-[350px] lg:h-[400px]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
          <div className="relative w-full h-full flex justify-center items-center group">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"
              alt="Jogarbola 1"
              className="w-64 absolute z-10 -rotate-[15deg] -translate-x-24 drop-shadow-2xl transition-transform group-hover:-translate-x-28"
            />
            <img
              src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=500&q=80"
              alt="Jogarbola 2"
              className="w-64 absolute z-20 -rotate-[5deg] translate-y-6 drop-shadow-2xl transition-transform group-hover:scale-105"
            />
            <img
              src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80"
              alt="Jogarbola 3"
              className="w-64 absolute z-10 rotate-[10deg] translate-x-28 drop-shadow-2xl transition-transform group-hover:translate-x-32"
            />
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-black text-blue-600 tracking-wider text-xl">
              SPORT NEXUS
            </span>
            <div className="h-6 w-[2px] bg-slate-300"></div>
            <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">
              Official Store
            </span>
          </div>
          <div className="bg-blue-600 text-white font-black text-4xl md:text-6xl px-6 py-3 rounded-2xl transform -rotate-1 shadow-xl inline-block tracking-tight">
            CÒN 1690K
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              Giày thể thao Jogarbola Vortex
            </h1>
            <p className="text-blue-600 font-bold text-lg tracking-wide uppercase">
              ⚡ GIẢM GIÁ ĐẶC BIỆT 300K - MIỄN PHÍ GIAO HÀNG
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800">
            <Phone className="text-blue-400 animate-bounce" size={18} />
            <div className="leading-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tư vấn mua hàng
              </p>
              <p className="text-lg font-mono font-black text-blue-400 mt-0.5">
                0812.312.831
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
