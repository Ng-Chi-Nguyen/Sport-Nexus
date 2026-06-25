export const SportsNews = ({ news }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((colIndex) => (
        <div
          key={colIndex}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              📋
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tổng hợp
              </span>
              <h3 className="text-base font-black text-slate-900">
                Tư vấn thể thao
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5 space-y-3 group cursor-pointer">
              <div className="aspect-[4/3] sm:aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80"
                  className="w-full h-full object-cover transition-transform group-hover:scale-102"
                  alt="Featured"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-[13px] font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                  Kích thước sân bóng chuyền hơi nam và nữ: Những thông số bạn
                  bắt buộc cần biết
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Tại Việt Nam, bóng chuyền hơi đã trở thành một phong trào rèn
                  luyện sức khỏe vô cùng bổ ích...
                </p>
              </div>
            </div>
            <div className="sm:col-span-7 space-y-3.5 divide-y divide-slate-100/60">
              {news.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 cursor-pointer group ${idx > 0 ? "pt-3.5" : ""}`}
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover group-hover:scale-102"
                      alt="Thumb"
                    />
                  </div>
                  <h5 className="text-[12px] font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
