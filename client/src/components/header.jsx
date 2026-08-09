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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-[#0f172a] backdrop-blur-md border-b border-gray-200/70 dark:border-slate-800 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-8">
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            id="menu-toggle-btn"
            onClick={() => setIsOpenMenu((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors ${
              isOpenMenu
                ? "bg-primary/10 text-primary"
                : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            <Menu size={20} />
          </button>
          <Logo />
        </div>

        <SearchBar />

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
                    {membership.tier.name} · {membership.points_balance?.toLocaleString("vi-VN")}đ
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

          <Link
            to="/gio-hang"
            className="relative p-2.5 rounded-full text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsOpenSettings((prev) => !prev)}
            className="p-2.5 rounded-full text-gray-500 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>

          {isOpenSettings && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 shadow-xl z-50 flex flex-col py-1">
              <span className="absolute -top-1.5 right-3 w-3 h-3 bg-white dark:bg-[#1e293b] border-t border-l border-gray-200 dark:border-slate-700 rotate-45" />
              {user && user.role?.slug !== "customer" && (
                <Link
                  to="/management/orders"
                  onClick={() => setIsOpenSettings(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
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
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <Heart size={18} strokeWidth={1.5} />
                    <span>{t("wishlist")}</span>
                  </Link>
                  <Link
                    to="/hoa-don"
                    onClick={() => setIsOpenSettings(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <Receipt size={18} strokeWidth={1.5} />
                    <span>{t("invoices")}</span>
                  </Link>
                  <Link
                    to="/khuyen-mai"
                    onClick={() => setIsOpenSettings(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <TicketPercent size={18} strokeWidth={1.5} />
                    <span>{t("coupons")}</span>
                  </Link>
                  <Link
                    to="/thong-bao"
                    onClick={() => setIsOpenSettings(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <Bell size={18} strokeWidth={1.5} />
                    <span>{t("notifications")}</span>
                  </Link>
                  <Link
                    to="/lich-su-tim-kiem"
                    onClick={() => setIsOpenSettings(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <Search size={18} strokeWidth={1.5} />
                    <span>{t("search_history")}</span>
                  </Link>
                  <Link
                    to="/bao-mat"
                    onClick={() => setIsOpenSettings(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
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
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                >
                  <User size={18} strokeWidth={1.5} />
                  <span>{t("login")}</span>
                </Link>
              )}

              {/* Mục Ngôn ngữ kèm Submenu khi Hover */}
              <div
                className="relative border-b border-gray-100 dark:border-slate-700"
                onMouseEnter={() => setIsLangHovered(true)}
                onMouseLeave={() => setIsLangHovered(false)}
              >
                <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all text-left">
                  <div className="flex items-center gap-3">
                    <Languages size={18} strokeWidth={1.5} />
                    <span>{t("language")}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 dark:text-slate-500"
                  />
                </button>

                {/* Submenu chọn Tiếng Việt / English */}
                {isLangHovered && (
                  <div className="absolute right-full top-0 w-48 max-h-64 overflow-y-auto bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 shadow-xl z-50 flex flex-col py-1 scrollbar-thin">
                    {LANGUAGES.map((lang, index) => {
                      const isActive = i18n.language.startsWith(lang.code);
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleChangeLanguage(lang.code)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-primary/5 transition-all text-left ${
                            index !== LANGUAGES.length - 1
                              ? "border-b border-gray-100 dark:border-slate-700"
                              : ""
                          } ${
                            isActive
                              ? "text-primary bg-primary/5 font-semibold"
                              : "text-gray-700 dark:text-slate-200"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-lg leading-none">
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
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
              >
                <LifeBuoy size={18} strokeWidth={1.5} />
                <span>{t("help")}</span>
              </Link>
              <button
                onClick={() => setIsDark((prev) => !prev)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700 text-left w-full"
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
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all border-b border-gray-100 dark:border-slate-700"
                  >
                    <User size={18} strokeWidth={1.5} />
                    <span>{t("account")}</span>
                  </Link>
                  <button
                    onClick={() => {
                      clearAuth();
                      window.location.href = "/auth/login";
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left w-full"
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
    </header>
  );
};

export default Header;
