import { useState, useEffect, useRef, useMemo } from "react";
import {
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Languages,
  Check,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-light.svg";
import { USER_SETTINGS_POPOVER } from "@/constants/menu";
import { getSidebarSections } from "@/constants/adminMenuConfig";
import useResponsive from "@/hooks/useResponsive";
import SidebarCollapsed from "@/components/admin/SidebarCollapsed";
import BottomNav from "@/components/admin/BottomNav";
import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import { clearAuth } from "@/lib/authStorage";
import LANGUAGES from "@/constants/languages";

const AdminLayout = () => {
  const prefix_path = "/management";
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { t: tCommon } = useTranslation("translation", {
    keyPrefix: "component.common",
  });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const { isDesktop, isTablet, isMobile } = useResponsive();

  // --- REFS & STATES ---
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isHoverSettings, setIsHoverSettings] = useState(false);
  const [isLangHovered, setIsLangHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const settingsRef = useRef(null);

  // State quản lý Theme (Sáng / Tối)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // State quản lý Ngôn ngữ
  const [currentLang, setCurrentLang] = useState(() => {
    return (
      localStorage.getItem("language") || i18n.language?.split("-")[0] || "vi"
    );
  });

  // Đồng bộ class "dark" vào thẻ html
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Hàm thay đổi ngôn ngữ
  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  // Popover items for settings
  const popoverItems = useMemo(() => {
    const settingsIconMap = {
      Activity: (
        <Icons.Activity
          size={16}
          strokeWidth={1.5}
          className="text-slate-400 dark:text-slate-500"
        />
      ),
      User: (
        <Icons.User
          size={16}
          strokeWidth={1.5}
          className="text-slate-400 dark:text-slate-500"
        />
      ),
      ShieldCheck: (
        <Icons.ShieldCheck
          size={16}
          strokeWidth={1.5}
          className="text-slate-400 dark:text-slate-500"
        />
      ),
      LogOut: <Icons.LogOut size={16} strokeWidth={1.5} />,
    };

    return USER_SETTINGS_POPOVER.map((item) => ({
      ...item,
      icon: settingsIconMap[item.iconName],
    }));
  }, []);

  // Read user from localStorage
  const localUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
      console.error("Parse user error:", e);
      return {};
    }
  }, []);

  // User role for menu filtering
  const userRole = localUser.role?.slug || null;

  // Menu sections from shared config
  const sidebarSections = useMemo(
    () => getSidebarSections(userRole),
    [userRole],
  );

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsOpenSettings(false);
        setIsHoverSettings(false);
        setIsLangHovered(false);
      }
    };
    if (isOpenSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenSettings]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 dark:bg-[#0B0F19] dark:text-slate-400 font-sans antialiased overflow-hidden transition-colors duration-300">
      {/* Desktop: full sidebar */}
      {isDesktop && (
        <div
          className={`relative z-50 h-full bg-white dark:bg-[#0D121F] border-r border-slate-200 dark:border-slate-900 flex flex-col justify-between p-4 selection:bg-sky-500/30 transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-[78px]" : "w-[260px]"
          }`}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header Logo */}
            <div
              className={`flex items-center mb-4 shrink-0 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Link
                to="/"
                className={`flex items-center no-underline ${
                  isCollapsed ? "" : "gap-3"
                }`}
              >
                {isCollapsed ? (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shrink-0">
                    <span className="font-black text-base tracking-tighter italic">
                      SN
                    </span>
                  </div>
                ) : (
                  <img
                    src={logoSvg}
                    alt="SportNexus"
                    className="h-12 md:h-14 w-auto object-contain shrink-0 filter dark:brightness-100 invert dark:invert-0"
                  />
                )}
              </Link>
            </div>

            {/* Menu List */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar pb-6 overflow-x-hidden">
              {sidebarSections.map((section, index) => (
                <div key={index} className="space-y-1.5">
                  {isCollapsed ? (
                    <div className="border-t border-slate-200 dark:border-slate-800/60 my-2 mx-2" />
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase px-2 truncate">
                      {tMenu(section.title)}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => `
                            flex items-center py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group
                            ${isCollapsed ? "justify-center px-0" : "px-3 gap-3"}
                            ${
                              isActive
                                ? "bg-sky-50 text-sky-600 font-semibold border-l-2 border-sky-500 dark:bg-[#161F32] dark:text-sky-400 rounded-l-none"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#111827] dark:hover:text-slate-200"
                            }
                          `}
                        >
                          <span className="transition-colors duration-150 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300 group-[.active]:text-sky-500 dark:group-[.active]:text-sky-400 shrink-0">
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <span className="truncate">
                              {tMenu(item.label)}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Area: Settings & Profile */}
          <div
            className="pt-4 border-t border-slate-200 dark:border-slate-900 space-y-3 shrink-0 relative"
            ref={settingsRef}
          >
            {/* Popover Menu */}
            {isOpenSettings && (
              <div
                className={`absolute bottom-[80%] left-0 mb-2 bg-white/95 dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-0.5 ${
                  isCollapsed ? "w-[200px]" : "w-full"
                }`}
              >
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white dark:bg-[#0D121F] border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45 pointer-events-none" />
                {!isCollapsed && (
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {tCommon("system_lookup")}
                    </p>
                  </div>
                )}

                {/* Nút Thu nhỏ / Mở rộng */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCollapsed(!isCollapsed);
                    setIsOpenSettings(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/10 transition-all text-left mt-1 cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronLeft size={16} />
                  )}
                  <span>
                    {isCollapsed
                      ? tCommon("expand_sidebar")
                      : tCommon("collapse_sidebar")}
                  </span>
                </button>

                <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                {/* Nút settings hover */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsHoverSettings(true)}
                  onMouseLeave={() => {
                    setIsHoverSettings(false);
                    setIsLangHovered(false);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsHoverSettings((prev) => !prev)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left cursor-pointer ${
                      isHoverSettings
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Settings size={16} className="shrink-0" />
                    <span>{tCommon("settings")}</span>
                  </button>

                  {isHoverSettings && (
                    <div className="absolute left-[98%] -top-1 ml-1 w-56 bg-white/95 dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer"
                      >
                        {isDarkMode ? (
                          <Sun size={16} className="text-amber-500" />
                        ) : (
                          <Moon size={16} className="text-indigo-500" />
                        )}
                        <span>
                          {isDarkMode
                            ? tCommon("light_mode")
                            : tCommon("dark_mode")}
                        </span>
                      </button>

                      {/* Ngôn ngữ */}
                      <div
                        className="relative"
                        onMouseEnter={() => setIsLangHovered(true)}
                        onMouseLeave={() => setIsLangHovered(false)}
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Languages size={16} className="shrink-0" />
                            <span>{tCommon("language")}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-slate-400 dark:text-slate-500"
                          />
                        </button>

                        {isLangHovered && (
                          <div className="absolute left-[98%] top-0 ml-1 w-48 max-h-64 overflow-y-auto bg-white/95 dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-xl p-1 z-50 flex flex-col custom-scrollbar">
                            {LANGUAGES.map((lang) => {
                              const isActive = currentLang === lang.code;
                              return (
                                <button
                                  key={lang.code}
                                  type="button"
                                  onClick={() =>
                                    handleLanguageChange(lang.code)
                                  }
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all text-left cursor-pointer ${
                                    isActive
                                      ? "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/10 font-semibold"
                                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <span className="text-base leading-none">
                                      {lang.flag}
                                    </span>
                                    <span className="truncate">
                                      {lang.label}
                                    </span>
                                  </span>
                                  {isActive && (
                                    <Check
                                      size={14}
                                      className="text-sky-500 shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                {popoverItems.map((item, idx) => {
                  if (item.type === "logout") {
                    return (
                      <div key={idx}>
                        <div className="border-t border-slate-100 dark:border-white/5 my-1" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500/90 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all text-left cursor-pointer"
                        >
                          {item.icon}
                          <span>{tMenu(item.label)}</span>
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (item.targetPath) {
                          navigate(`${prefix_path}${item.targetPath}`);
                          setIsOpenSettings(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-all text-left cursor-pointer"
                    >
                      {item.icon}
                      <span>{tMenu(item.label)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Profile trigger button */}
            <div
              onClick={() => {
                setIsOpenSettings(!isOpenSettings);
                setIsHoverSettings(false);
                setIsLangHovered(false);
              }}
              className={`flex items-center rounded-xl border cursor-pointer transition-all duration-150 group ${
                isCollapsed ? "justify-center p-2" : "p-2.5 gap-3"
              } ${
                isOpenSettings
                  ? "bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-400"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-[#111827]/60 dark:border-slate-900 dark:hover:bg-[#162035]/80 dark:hover:border-slate-800"
              }`}
            >
              <img
                src={localUser.avatar}
                alt={localUser.full_name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800 shrink-0"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0 leading-normal py-0.5">
                  <p className="text-[10px] text-blue-600 dark:text-blue-500 font-mono truncate mt-0.5 opacity-90">
                    {localUser.role?.name || "Admin"}
                  </p>
                  <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate tracking-wide">
                    {localUser.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5 opacity-90">
                    {localUser.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tablet: collapsed sidebar */}
      {isTablet && <SidebarCollapsed userRole={userRole} />}

      {/* Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#080C14] overflow-hidden transition-colors duration-300">
        {/* TỐI ƯU MOBILE: Header nhỏ chứa nút Avatar/Cài đặt góc trên cùng để đổi giao diện/ngôn ngữ */}
        {isMobile && (
          <div
            className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0D121F] border-b border-slate-200 dark:border-slate-900 shrink-0 relative"
            ref={settingsRef}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md font-black text-xs italic tracking-tighter">
                SN
              </span>
              <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-slate-100">
                SportNexus Admin
              </span>
            </div>

            {/* Nút bấm mở cài đặt tài khoản trên Mobile */}
            <div
              onClick={() => setIsOpenSettings(!isOpenSettings)}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-800 cursor-pointer shrink-0"
            >
              <img
                src={localUser.avatar}
                alt={localUser.full_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Popover Cài đặt cho Mobile (Đổ xuống từ góc phải) */}
            {isOpenSettings && (
              <div className="absolute right-4 top-full mt-2 w-64 bg-white/95 dark:bg-[#0D121F]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                  <p className="text-[12px] font-bold text-slate-900 dark:text-slate-100 truncate">
                    {localUser.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {localUser.email}
                  </p>
                </div>

                {/* Đổi Giao Diện Sáng/Tối */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
                >
                  {isDarkMode ? (
                    <Sun size={16} className="text-amber-500" />
                  ) : (
                    <Moon size={16} className="text-indigo-500" />
                  )}
                  <span>
                    {isDarkMode ? tCommon("light_mode") : tCommon("dark_mode")}
                  </span>
                </button>

                {/* Chọn Ngôn Ngữ trên Mobile */}
                <div className="py-1 border-t border-slate-100 dark:border-white/5">
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    {tCommon("language")}
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {LANGUAGES.map((lang) => {
                      const isActive = currentLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                            isActive
                              ? "bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="truncate">{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                {popoverItems.map((item, idx) => {
                  if (item.type === "logout") {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all text-left cursor-pointer"
                      >
                        {item.icon}
                        <span>{tMenu(item.label)}</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (item.targetPath) {
                          navigate(`${prefix_path}${item.targetPath}`);
                          setIsOpenSettings(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
                    >
                      {item.icon}
                      <span>{tMenu(item.label)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile: bottom navigation */}
      {isMobile && <BottomNav userRole={userRole} />}
    </div>
  );
};

export default AdminLayout;
