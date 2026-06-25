export const MiddleBanner = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="w-full h-36 md:h-44 rounded-2xl overflow-hidden relative cursor-pointer group shadow-md border border-amber-500/10">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80"
          className="w-full h-full object-cover transition-transform group-hover:scale-101 duration-500"
          alt="World Cup Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 to-red-700/80 p-6 md:p-10 flex items-center justify-between text-white">
          <div className="space-y-1 max-w-md md:max-w-xl">
            <span className="bg-white/20 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest">
              Ấn phẩm đặc biệt
            </span>
            <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase leading-none mt-1">
              ẤN PHẨM WORLD CUP 2026 CHÍNH THỨC LỘ DIỆN
            </h2>
            <p className="text-[11px] text-amber-100 opacity-90 line-clamp-1">
              Khám phá trọn vẹn thông tin, đội hình chiến thuật và các ngôi sao
              hàng đầu.
            </p>
          </div>
          <div className="shrink-0 hidden sm:block">
            <div className="w-16 h-22 md:w-20 md:h-28 bg-white rounded shadow-2xl border border-white/20 rotate-[6deg] transform transition-transform group-hover:rotate-[2deg] flex items-center justify-center text-slate-900 font-bold text-xs p-1">
              MAG
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
