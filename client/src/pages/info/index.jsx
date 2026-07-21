import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import infoPages from "@/constants/web/infoContent";

const InfoPage = () => {
  const { pathname } = useLocation();
  const page = infoPages[pathname];

  if (!page) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Nội dung không tồn tại.
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-[#4facf3] font-semibold">
            {page.title}
          </span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
          {page.title}
        </h1>

        {page.stores && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {page.stores.map((store, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${store.mapQuery}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={store.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {store.name}
                  </h3>
                  <p className="text-xs text-slate-500">{store.address}</p>
                  <p className="text-xs text-blue-600 font-semibold">
                    Hotline: {store.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {page.sections && (
          <div className="space-y-8">
            {page.sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-bold text-slate-800 mb-2">
                  {section.heading}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPage;
