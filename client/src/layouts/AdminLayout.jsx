import { useState, useEffect, useRef, useMemo } from "react";
import { LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-light.svg";
import {
  SIDEBAR_MENU_STRUCTURE,
  USER_SETTINGS_POPOVER,
} from "@/constants/menu";
import * as Icons from "lucide-react";

const AdminLayout = () => {
  const prefix_path = "/management";
  const navigate = useNavigate();

  // --- REFS & STATES HỆ THỐNG ---
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State thu nhỏ thanh điều hướng
  const settingsRef = useRef(null);

  // Mảng Object ánh xạ Icon chính
  const iconMap = {
    LayoutDashboard: <Icons.LayoutDashboard strokeWidth={1.5} size={18} />,
    ClipboardClock: <Icons.ClipboardClock strokeWidth={1.5} size={18} />,
    ClipboardList: <Icons.ClipboardList strokeWidth={1.5} size={18} />,
    ShoppingCart: <Icons.ShoppingCart strokeWidth={1.5} size={18} />,
    Barcode: <Icons.Barcode strokeWidth={1.5} size={18} />,
    Star: <Icons.Star strokeWidth={1.5} size={18} />,
    ListTree: <Icons.ListTree strokeWidth={1.5} size={18} />,
    Package: <Icons.Package strokeWidth={1.5} size={18} />,
    ChartColumnStacked: (
      <Icons.ChartColumnStacked strokeWidth={1.5} size={18} />
    ),
    Tag: <Icons.Tag strokeWidth={1.5} size={18} />,
    Award: <Icons.Award strokeWidth={1.5} size={18} />,
    Warehouse: <Icons.Warehouse strokeWidth={1.5} size={18} />,
    ArchiveRestore: <Icons.ArchiveRestore strokeWidth={1.5} size={18} />,
    Import: <Icons.Import strokeWidth={1.5} size={18} />,
    IdCard: <Icons.IdCard strokeWidth={1.5} size={18} />,
    KeySquare: <Icons.KeySquare strokeWidth={1.5} size={18} />,
    LocateFixed: <Icons.LocateFixed strokeWidth={1.5} size={18} />,
  };

  // Trộn cấu trúc dữ liệu Menu từ Constants
  const sidebarSections = useMemo(() => {
    const rawStructure = SIDEBAR_MENU_STRUCTURE(prefix_path);
    return rawStructure.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        icon: iconMap[item.iconName] || <Icons.HelpCircle size={18} />,
      })),
    }));
  }, [prefix_path]);

  // Bộ Icons cho menu cài đặt Popover
  const popoverItems = useMemo(() => {
    const settingsIconMap = {
      Activity: (
        <Icons.Activity
          size={16}
          strokeWidth={1.5}
          className="text-slate-500"
        />
      ),
      User: (
        <Icons.User size={16} strokeWidth={1.5} className="text-slate-500" />
      ),
      ShieldCheck: (
        <Icons.ShieldCheck
          size={16}
          strokeWidth={1.5}
          className="text-slate-500"
        />
      ),
      LogOut: <Icons.LogOut size={16} strokeWidth={1.5} />,
    };

    return USER_SETTINGS_POPOVER.map((item) => ({
      ...item,
      icon: settingsIconMap[item.iconName],
    }));
  }, []);

  // Đọc dữ liệu user động từ localStorage
  const localUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
      console.error("Lỗi parse thông tin user:", e);
      return {};
    }
  }, []);
  // console.log(localUser);
  // Đóng Popover khi click ra ngoài vùng chỉ định
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsOpenSettings(false);
      }
    };
    if (isOpenSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenSettings]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-400 font-sans antialiased overflow-hidden">
      {/* 1. KHỐI SIDEBAR CONTAINER CHUẨN GLASSOS (Hỗ trợ transition mượt mà khi đổi size w) */}
      <div
        className={`h-full bg-[#0D121F] border-r border-slate-900 flex flex-col justify-between p-4 selection:bg-sky-500/30 transition-all duration-300 ease-in-out
                   ${isCollapsed ? "w-[78px]" : "w-[260px]"}`}
      >
        {/* VÙNG ĐỈNH: LOGO THƯƠNG HIỆU VÀ MENU ĐIỀU HƯỚNG */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Cụm Logo & Tên thương hiệu */}
          <div
            className={`flex items-center mb-4 select-none shrink-0 ${isCollapsed ? "justify-center" : ""}`}
          >
            <Link
              to="/"
              className={`flex items-center no-underline ${isCollapsed ? "" : "gap-3"}`}
            >
              {isCollapsed ? (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] shrink-0">
                  <span className="font-black text-base tracking-tighter italic">
                    SN
                  </span>
                </div>
              ) : (
                <img
                  src={logoSvg}
                  alt="SportNexus"
                  className="h-12 md:h-14 w-auto object-contain shrink-0"
                />
              )}
            </Link>
          </div>

          {/* Vùng cuộn chứa danh sách Menu điều hướng hệ thống */}
          <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar pb-6 overflow-x-hidden">
            {sidebarSections.map((section, index) => (
              <div key={index} className="space-y-1.5">
                {/* Tiêu đề nhóm menu: Ẩn hoặc chuyển thành dấu gạch ngang tùy trạng thái */}
                {isCollapsed ? (
                  <div className="border-t border-slate-800/60 my-2 mx-2"></div>
                ) : (
                  <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-2 truncate animate-in fade-in duration-200">
                    {section.title}
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
                              ? "bg-[#161F32] text-sky-400 font-semibold shadow-inner border-l-2 border-sky-500 rounded-l-none"
                              : "hover:bg-[#111827] hover:text-slate-200"
                          }
                        `}
                      >
                        <span className="transition-colors duration-150 text-slate-500 group-hover:text-slate-300 group-[.active]:text-sky-400 shrink-0">
                          {item.icon}
                        </span>
                        {/* Ẩn chữ menu khi co lại */}
                        {!isCollapsed && (
                          <span className="truncate animate-in fade-in duration-200">
                            {item.label}
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

        {/* VÙNG ĐÁY SIDEBAR: TOÀN BỘ KHỐI PROFILE BIẾN THÀNH NÚT BẤM CÀI ĐẶT */}
        <div
          className="pt-4 border-t border-slate-900 space-y-3 shrink-0 relative"
          ref={settingsRef}
        >
          {/* MENU CÀI ĐẶT XỔ NGƯỢC (POPOVER CHUẨN) */}
          {isOpenSettings && (
            <div
              className={`absolute bottom-full left-0 mb-2 bg-[#0D121F]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150
                            ${isCollapsed ? "w-[180px]" : "w-full"}`}
            >
              {!isCollapsed && (
                <div className="px-3 py-2 border-b border-white/5 mb-1 select-none">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Tra cứu hệ thống
                  </p>
                </div>
              )}

              {/* CHỨC NĂNG THU NHỎ / MỞ RỘNG SIDEBAR (Nút mới bổ sung) */}
              <button
                type="button"
                onClick={() => {
                  setIsCollapsed(!isCollapsed);
                  setIsOpenSettings(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-sky-400 bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-all text-left"
              >
                {isCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
                <span>{isCollapsed ? "Mở rộng thanh" : "Thu nhỏ thanh"}</span>
              </button>

              <div className="border-t border-white/5 my-1"></div>

              {/* Duyệt các item cũ từ constants */}
              {popoverItems.map((item, idx) => {
                if (item.type === "logout") {
                  return (
                    <div key={idx}>
                      <div className="border-t border-white/5 my-1"></div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-500/90 hover:bg-rose-950/20 hover:text-rose-400 transition-all text-left"
                      >
                        {item.icon}
                        <span>{item.label}</span>
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
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all text-left"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* VÙNG CLICK PROFILE */}
          <div
            onClick={() => setIsOpenSettings(!isOpenSettings)}
            className={`flex items-center rounded-xl border select-none cursor-pointer transition-all duration-150 group
                       ${isCollapsed ? "justify-center p-2" : "p-2.5 gap-3"}
                       ${
                         isOpenSettings
                           ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                           : "bg-[#111827]/60 border-slate-900 hover:bg-[#162035]/80 hover:border-slate-800"
                       }`}
          >
            <img
              src={localUser.avatar}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
            />

            {/* Ẩn khối text định danh khi Sidebar thu nhỏ */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 leading-normal py-0.5 animate-in fade-in duration-200">
                <p className="text-[12px] font-bold text-slate-200 truncate tracking-wide">
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

      {/* 2. KHỐI CONTAINER CHÍNH HIỂN THỊ NỘI DUNG (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col h-full bg-[#080C14] overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
