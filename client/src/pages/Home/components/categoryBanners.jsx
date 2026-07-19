const CATEGORY_STYLES = [
  { gradient: "from-blue-600 to-blue-800", text: "text-blue-200" },
  { gradient: "from-emerald-600 to-emerald-800", text: "text-emerald-200" },
  { gradient: "from-violet-600 to-violet-800", text: "text-violet-200" },
  { gradient: "from-amber-600 to-amber-800", text: "text-amber-200" },
  { gradient: "from-rose-600 to-rose-800", text: "text-rose-200" },
  { gradient: "from-cyan-600 to-cyan-800", text: "text-cyan-200" },
];

const getStyle = (idx) => CATEGORY_STYLES[idx % CATEGORY_STYLES.length];

export const CategoryBanners = ({ categories }) => {
  const display = categories.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {display.map((cat, idx) => {
          const style = getStyle(idx);
          return (
            <div
              key={cat.id}
              className={`group relative h-32 rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-gradient-to-br ${style.gradient} transition-shadow hover:shadow-lg`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                <span className="text-white/20 font-black text-4xl select-none absolute -bottom-2 -right-2">
                  {cat.name.charAt(0).toUpperCase()}
                </span>
                <h3 className="font-black text-base text-white tracking-tight relative z-10">
                  {cat.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
