import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Users,
  Grid,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export const NavCategoryMenu = ({
  isScrolled,
  categories = [],
  isOpenMenu,
  setIsOpenMenu,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  const infoLinks = [
    { key: "store_system", to: "/he-thong-cua-hang", icon: MapPin },
    { key: "warranty_policy", to: "/chinh-sach-bao-hanh", icon: ShieldCheck },
    { key: "terms_of_use", to: "/dieu-khoan-su-dung", icon: PhoneCall },
    { key: "privacy_policy", to: "/chinh-sach-bao-mat", icon: ShieldCheck },
    { key: "recruitment", to: "/tuyen-dung", icon: Users },
  ];

  // Xử lý click outside đóng menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      const toggleBtn = document.getElementById("menu-toggle-btn");
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!toggleBtn || !toggleBtn.contains(e.target))
      ) {
        setIsOpenMenu(false);
      }
    };
    if (isOpenMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenMenu, setIsOpenMenu]);

  return (
    <div
      ref={menuRef}
      className={`sticky top-16 z-40 w-full font-sans transition-all duration-300 ${
        isScrolled
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* 1. TOP NAV BAR */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          {/* Search Box cho Mobile */}
          <div className="flex-1 sm:hidden relative flex items-center rounded-full overflow-hidden bg-slate-800 border border-slate-700 focus-within:border-blue-500">
            <Search
              size={14}
              className="absolute left-3 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="w-full h-8 pl-9 pr-16 bg-transparent text-xs text-white placeholder-slate-500 outline-none focus:outline-none focus:ring-0 border-none"
            />
            <button
              type="button"
              className="absolute right-0 h-full px-3 bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors"
            >
              {t("search_btn")}
            </button>
          </div>

          {/* Links Điều Hướng Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {infoLinks.map((link) => {
              const isActive = pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`h-8 px-3 flex items-center gap-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} />
                  <span>{t(`${link.key}`)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Hotline */}
          <div className="hidden lg:block text-xs font-medium text-slate-400">
            {t("hotline")}:{" "}
            <a
              href="tel:0812312831"
              className="text-blue-400 font-bold hover:underline"
            >
              0812312831
            </a>
          </div>
        </div>
      </div>

      {/* 2. MEGA DROPDOWN MENU */}
      {isOpenMenu && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
          <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Lưới Danh Mục Chiếm 3 Cột */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Grid size={14} />
                <span>
                  {t("categories_title", { count: categories.length })}
                </span>
              </div>

              {categories.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  {t("no_categories")}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/products?category=${cat.slug || cat.name}`}
                      onClick={() => setIsOpenMenu(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight size={12} className="text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Banner Quảng Cáo Chiếm 1 Cột */}
            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Sport Nexus
                </span>
                <h4 className="text-xs font-semibold">{t("banner_title")}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t("banner_desc")}
                </p>
                <Link
                  to="/products"
                  onClick={() => setIsOpenMenu(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 pt-2"
                >
                  <span>{t("view_all")}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
