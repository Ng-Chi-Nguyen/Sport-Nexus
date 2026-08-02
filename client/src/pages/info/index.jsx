import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import infoPages from "@/constants/web/infoContent";

const InfoPage = () => {
  const { pathname } = useLocation();
  const page = infoPages[pathname];

  if (!page) {
    return (
      <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
        Nội dung không tồn tại.
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-2 text-sm mb-6 mt-10">
          <Link
            to="/"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Trang chủ
          </Link>
          <ChevronRight
            size={14}
            className="text-slate-400 dark:text-slate-600"
          />
          <span className="text-[#4facf3] font-semibold">{page.title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-8 tracking-tight">
          {page.title}
        </h1>

        {page.stores && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {page.stores.map((store, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md overflow-hidden transition-colors duration-200"
              >
                <div className="h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${store.mapQuery}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={store.name}
                    className="w-full h-full grayscale dark:invert-[0.9] dark:hue-rotate-180 dark:contrast-125 transition-all duration-200"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {store.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {store.address}
                  </p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold pt-1">
                    Hotline: {store.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {page.sections && (
          <div className="space-y-8 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
            {page.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {section.heading}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
