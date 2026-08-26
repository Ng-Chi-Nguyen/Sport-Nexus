import {
  Bell,
  Check,
  ChevronRight,
  Heart,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  TicketPercent,
  User,
  Coins,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Logo } from "./logo";
import SearchBar from "@/components/search/SearchBar";
import { useCart } from "@/contexts/CartContext";
import { clearAuth } from "@/lib/authStorage";
import useMembership from "@/hooks/useMembership";

const Header = ({ isOpenMenu, setIsOpenMenu }) => {
  const { i18n, t } = useTranslation();
  const { count } = useCart();
  const { membership } = useMembership();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const [avatarError, setAvatarError] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isLangHovered, setIsLangHovered] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const settingsRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsOpenSettings(false);
        setIsLangHovered(false);
      }
    };
    if (isOpenSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenSettings]);

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangHovered(false);
    setIsOpenSettings(false);
  };

  const LANGUAGES = [
    { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
    { code: "en", flag: "🇬🇧", label: "English" },
  ];

  const itemClasses =
    "flex items-center gap-3 px-5 py-3.5 md:px-3 md:py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700/50";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200/70 dark:border-slate-800 shadow-sm">
      <div className="absolute inset-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md -z-10" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-8">
        {/* LOGO & MENU */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            id="menu-toggle-btn"
            onClick={() => setIsOpenMenu((prev) => !prev)}
            className={`hidden md:block p-2 rounded-lg transition-colors ${
              isOpenMenu
                ? "bg-primary/10 text-primary"
                : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            <Menu size={20} />
          </button>
          <Logo />
        </div>

        {/* THANH TÌM KIẾM */}
        <div className="hidden md:block flex-1 mx-4 lg:mx-8">
          <SearchBar />
        </div>

        {/* ACCOUNT & CART & SETTINGS */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <Link
              to="/tai-khoan"
              className="flex items-center gap-2.5 px-2 py-2 border-b-2 border-primary text-gray-700 dark:text-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 min-w-0 sm:min-w-[140px]"
            >
              <div className="w-10 h-7 sm:w-10 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold">
                    {user.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-col leading-tight hidden sm:flex">
                <span className="text-sm font-medium max-w-[100px] sm:max-w-[145px] truncate">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 hidden md:block">
                  {user.email}
                </span>
                {membership?.tier && (
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1">
                    <Coins size={10} />
                    {membership.tier.name} ·{" "}
                    {membership.points_balance?.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-all duration-200"
            >
              <User size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium hidden sm:inline">
                {t("login")}
              </span>
            </Link>
          )}

          {/* GIỎ HÀNG */}
          <Link
            to="/gio-hang"
            className="hidden md:flex relative p-2.5 rounded-full text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <div className="relative overflow-visible" ref={settingsRef}>
            <button
              onClick={() => setIsOpenSettings((prev) => !prev)}
              className="relative p-2.5 rounded-full text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <Settings size={20} strokeWidth={1.5} />
              <ChevronRight
                size={10}
                className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${isOpenSettings ? "rotate-90" : ""}`}
              />
            </button>

            {isOpenSettings && (
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
                onClick={() => setIsOpenSettings(false)}
              />
            )}

            {isOpenSettings && (
              <div className="fixed bottom-0 left-0 right-0 z-[70] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1e293b] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pt-3 pb-8 custom-scrollbar md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 md:w-56 md:rounded-lg md:shadow-xl md:border md:border-gray-200 md:dark:border-slate-700 md:p-1 md:z-50 animate-in slide-in-from-bottom-5 md:animate-none md:pb-1 md:overflow-visible">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-2 md:hidden" />
                <span className="hidden md:block absolute -top-1.5 right-3 w-3 h-3 bg-white dark:bg-[#1e293b] border-t border-l border-gray-200 dark:border-slate-700 rotate-45" />

                <div className="px-5 py-3 md:hidden border-b border-gray-100 dark:border-slate-700/50">
                  <SearchBar />
                </div>

                <button
                  onClick={() => {
                    setIsOpenMenu(true);
                    setIsOpenSettings(false);
                  }}
                  className={`${itemClasses} md:hidden w-full text-left`}
                >
                  <Menu size={18} strokeWidth={1.5} />
                  <span>{t("categories", "Danh mục sản phẩm")}</span>
                </button>

                <Link
                  to="/gio-hang"
                  onClick={() => setIsOpenSettings(false)}
                  className={`${itemClasses} md:hidden w-full flex justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={18} strokeWidth={1.5} />
                    <span>{t("cart", "Giỏ hàng")}</span>
                  </div>
                  {count > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </Link>

                {user && user.role?.slug !== "customer" && (
                  <Link
                    to="/management/orders"
                    onClick={() => setIsOpenSettings(false)}
                    className={itemClasses}
                  >
                    <LayoutDashboard size={18} strokeWidth={1.5} />
                    <span>{t("admin")}</span>
                  </Link>
                )}

                {user && (
                  <>
                    <Link
                      to="/yeu-thich"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <Heart size={18} strokeWidth={1.5} />
                      <span>{t("wishlist")}</span>
                    </Link>
                    <Link
                      to="/hoa-don"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <Receipt size={18} strokeWidth={1.5} />
                      <span>{t("invoices")}</span>
                    </Link>
                    <Link
                      to="/khuyen-mai"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <TicketPercent size={18} strokeWidth={1.5} />
                      <span>{t("coupons")}</span>
                    </Link>
                    <Link
                      to="/thong-bao"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <Bell size={18} strokeWidth={1.5} />
                      <span>{t("notifications")}</span>
                    </Link>
                    <Link
                      to="/lich-su-tim-kiem"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <Search size={18} strokeWidth={1.5} />
                      <span>{t("search_history")}</span>
                    </Link>
                    <Link
                      to="/bao-mat"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <ShieldCheck size={18} strokeWidth={1.5} />
                      <span>{t("security")}</span>
                    </Link>
                  </>
                )}

                {!user && (
                  <Link
                    to="/auth/login"
                    onClick={() => setIsOpenSettings(false)}
                    className={itemClasses}
                  >
                    <User size={18} strokeWidth={1.5} />
                    <span>{t("login")}</span>
                  </Link>
                )}

                {/* MENU NGÔN NGỮ HOẠT ĐỘNG HOÀN TOÀN BẰNG HOVER TRÊN PC */}
                <div
                  className="relative border-b border-gray-100 dark:border-slate-700/50 group z-[100]"
                  onMouseEnter={() => setIsLangHovered(true)}
                  onMouseLeave={() => setIsLangHovered(false)}
                >
                  <button
                    onClick={() => setIsLangHovered((prev) => !prev)}
                    className="w-full flex items-center justify-between px-5 py-3.5 md:px-3 md:py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Languages size={18} strokeWidth={1.5} />
                      <span>{t("language")}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 dark:text-slate-500 transition-transform ${isLangHovered ? "rotate-90 md:rotate-0" : ""}`}
                    />
                  </button>

                  {isLangHovered && (
                    <div className="hidden md:block absolute right-0 top-0 w-48 max-h-64 overflow-y-auto bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 shadow-2xl z-[999] py-1 custom-scrollbar">
                      {LANGUAGES.map((lang, index) => {
                        const isActive = i18n.language.startsWith(lang.code);
                        return (
                          <button
                            key={lang.code}
                            onClick={() => handleChangeLanguage(lang.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-primary/5 transition-all text-left ${index !== LANGUAGES.length - 1 ? "border-b border-gray-100 dark:border-slate-700/50" : ""} ${isActive ? "text-primary bg-primary/5 font-semibold" : "text-gray-700 dark:text-slate-200"}`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg leading-none shrink-0">
                                {lang.flag}
                              </span>
                              <span className="truncate">{lang.label}</span>
                            </span>
                            {isActive && (
                              <Check
                                size={16}
                                className="text-primary shrink-0"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link
                  to="/ho-tro"
                  onClick={() => setIsOpenSettings(false)}
                  className={itemClasses}
                >
                  <LifeBuoy size={18} strokeWidth={1.5} />
                  <span>{t("help")}</span>
                </Link>

                <button
                  onClick={() => setIsDark((prev) => !prev)}
                  className="flex items-center gap-3 px-5 py-3.5 md:px-3 md:py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700/50 text-left w-full"
                >
                  {isDark ? (
                    <Sun size={18} strokeWidth={1.5} />
                  ) : (
                    <Moon size={18} strokeWidth={1.5} />
                  )}
                  <span>{isDark ? t("light_mode") : t("dark_mode")}</span>
                </button>

                {user && (
                  <>
                    <Link
                      to="/tai-khoan"
                      onClick={() => setIsOpenSettings(false)}
                      className={itemClasses}
                    >
                      <User size={18} strokeWidth={1.5} />
                      <span>{t("account")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        clearAuth();
                        window.location.href = "/auth/login";
                      }}
                      className="flex items-center gap-3 px-5 py-3.5 md:px-3 md:py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left w-full"
                    >
                      <LogOut size={18} strokeWidth={1.5} />
                      <span>{t("logout")}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
