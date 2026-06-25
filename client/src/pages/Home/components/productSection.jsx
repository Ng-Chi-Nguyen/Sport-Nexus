import { useState } from "react";

export const ProductSection = ({
  title,
  iconLetter,
  iconBg,
  tabs = [],
  products = [],
  hasBannerCard = false,
  bannerTitle = "",
  bannerImg = "",
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded ${iconBg} flex items-center justify-center text-white text-[10px] font-bold`}
            >
              {iconLetter}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Sản phẩm
              </span>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
            </div>
          </div>
          {tabs.length > 0 && (
            <div className="flex gap-1.5 self-end sm:self-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all ${activeTab === tab.id ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {hasBannerCard && (
            <div className="lg:col-span-3 rounded-xl overflow-hidden relative min-h-[250px] bg-slate-950 border border-slate-900 shadow-inner group">
              <img
                src={bannerImg}
                className="w-full h-full object-cover opacity-65 transition-transform group-hover:scale-102"
                alt={bannerTitle}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-4 flex flex-col justify-end space-y-2">
                <span className="text-[9px] font-bold text-sky-400 tracking-widest uppercase">
                  Trang phục đội tuyển
                </span>
                <h4 className="text-white font-black text-xl leading-none tracking-tight italic">
                  {bannerTitle}
                </h4>
              </div>
            </div>
          )}

          <div
            className={`${hasBannerCard ? "lg:col-span-9 grid-cols-2 sm:grid-cols-2 md:grid-cols-4" : "lg:col-span-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"} grid gap-4`}
          >
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group relative"
              >
                <div className="aspect-square w-full bg-slate-50 rounded-lg overflow-hidden mb-3 relative flex items-center justify-center p-1">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-103"
                  />
                  {item.discount && (
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                      {item.discount}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm font-black text-blue-600 mt-1">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!hasBannerCard && (
          <div className="flex justify-center mt-6">
            <button className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all">
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
