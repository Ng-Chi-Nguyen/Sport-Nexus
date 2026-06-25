export const CategoryBanners = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-28 rounded-xl overflow-hidden relative cursor-pointer shadow-sm group border border-sky-900/10">
        <img
          src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80"
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          alt="Bóng Chuyền"
        />
        <div className="absolute inset-0 bg-sky-900/40 flex flex-col justify-center items-center text-white backdrop-blur-[1px]">
          <h3 className="font-black text-lg tracking-wider uppercase">
            Bóng Chuyền
          </h3>
          <span className="text-[9px] uppercase tracking-widest text-sky-200 mt-0.5">
            Volleyball Collection
          </span>
        </div>
      </div>
      <div className="h-28 rounded-xl overflow-hidden relative cursor-pointer shadow-sm group border border-emerald-900/10">
        <img
          src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80"
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          alt="Pickleball"
        />
        <div className="absolute inset-0 bg-emerald-950/40 flex flex-col justify-center items-center text-white backdrop-blur-[1px]">
          <h3 className="font-black text-lg tracking-wider uppercase">
            Pickleball
          </h3>
          <span className="text-[9px] uppercase tracking-widest text-emerald-200 mt-0.5">
            Pickleball Gear
          </span>
        </div>
      </div>
      <div className="h-28 rounded-xl overflow-hidden relative cursor-pointer shadow-sm group border border-slate-900/10">
        <img
          src="https://images.unsplash.com/photo-1544192240-4a34fed0104c?auto=format&fit=crop&w=400&q=80"
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          alt="Billiards"
        />
        <div className="absolute inset-0 bg-slate-950/50 flex flex-col justify-center items-center text-white backdrop-blur-[1px]">
          <h3 className="font-black text-lg tracking-wider uppercase">
            Billiards
          </h3>
          <span className="text-[9px] uppercase tracking-widest text-slate-300 mt-0.5">
            Billiards & Pools
          </span>
        </div>
      </div>
    </div>
  );
};
