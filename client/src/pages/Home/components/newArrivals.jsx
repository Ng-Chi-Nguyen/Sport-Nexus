export const NewArrivals = ({ products }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              New Arrivals
            </span>
            <h3 className="text-base font-black text-slate-900">Hàng mới về</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-2 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="aspect-square w-full bg-slate-50 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h4>
                <p className="text-sm font-black text-blue-600">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
          <div className="flex gap-1">
            <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 text-xs">
              ‹
            </button>
            <button className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs">
              ›
            </button>
          </div>
          <div className="flex-1 h-[2px] bg-slate-100 relative rounded">
            <div className="absolute top-0 left-0 h-full w-16 bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
