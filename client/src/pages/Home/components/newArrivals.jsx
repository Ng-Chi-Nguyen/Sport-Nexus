import { Clock } from "lucide-react";

export const NewArrivals = ({ products }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-100">
            <Clock className="text-white" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              New Arrivals
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Hàng mới về
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-square rounded-t-xl overflow-hidden bg-slate-50">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className={`hidden w-full h-full absolute inset-0 bg-gradient-to-br ${item.gradient} items-center justify-center`}
                  >
                    <span className="text-white/30 font-black text-6xl select-none">
                      {item.initial}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-[13px] font-medium text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-sm font-black text-blue-600">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
