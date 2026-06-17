import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArchiveRestore,
  Award,
  Barcode,
  ChartColumnStacked,
  ClipboardClock,
  ClipboardList,
  IdCard,
  Import,
  KeySquare,
  ListTree,
  LocateFixed,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Warehouse,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  SIDEBAR_MENU_STRUCTURE,
  USER_SETTINGS_POPOVER,
} from "@/constants/menu";
import * as Icons from "lucide-react";

const AdminLayout = () => {
  const prefix_path = "/management";

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

  const popoverItems = useMemo(() => {
    const iconMap = {
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
      icon: iconMap[item.iconName],
    }));
  }, []);

  const sidebarSections = useMemo(() => {
    const rawStructure = SIDEBAR_MENU_STRUCTURE(prefix_path);
    return rawStructure.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        icon: iconMap[item.iconName] || <Icons.HelpCircle size={18} />, // Dự phòng icon mặc định nếu lỗi tên
      })),
    }));
  }, [prefix_path]);

  // --- 1. KHỞI TẠO STATE & REF HỆ THỐNG ---
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const settingsRef = useRef(null);

  // Đọc dữ liệu tài khoản động từ localStorage để map lên giao diện
  const localUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
      console.error("Lỗi parse thông tin user từ localStorage:", e);
      return {};
    }
  }, []);

  // Bộ lắng nghe sự kiện click ngoài vùng menu cài đặt để tự động thu gọn Popover
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

  // Hàm xử lý đăng xuất hệ thống
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-400 font-sans antialiased overflow-hidden">
      {/* 1. KHỐI SIDEBAR CONTAINER CHUẨN GLASSOS */}
      <div className="w-[260px] h-full bg-[#0D121F] border-r border-slate-900 flex flex-col justify-between p-4 selection:bg-sky-500/30">
        {/* VÙNG ĐỈNH: LOGO THƯƠNG HIỆU VÀ MENU ĐIỀU HƯỚNG */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Cụm Logo & Tên thương hiệu: Đã tăng kích thước và thu hẹp khoảng cách dòng */}
          <div className="flex items-center gap-3.5 px-2 py-4 mb-4 select-none shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] shrink-0">
              <span className="font-black text-base tracking-tighter italic">
                SP
              </span>
            </div>

            <div className="flex flex-col gap-0.5 leading-none">
              <Link
                to="/"
                className="font-extrabold text-xl tracking-wide flex items-center"
              >
                {/* SPORT màu trắng sáng */}
                <span className="text-white">SPORT</span>
                {/* NEXUS màu xanh lơ đặc trưng hệ thống */}
                <span className="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)] ml-0.5">
                  NEXUS
                </span>
              </Link>

              {/* Phụ đề thương hiệu */}
              <span className="text-[10px] text-slate-500 font-bold tracking-[0.22em] uppercase block">
                Admin Console
              </span>
            </div>
          </div>

          {/* Vùng cuộn chứa danh sách Menu điều hướng hệ thống */}
          <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar pb-6">
            {sidebarSections.map((section, index) => (
              <div key={index} className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase px-2">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group
                          ${
                            isActive
                              ? "bg-[#161F32] text-sky-400 font-semibold shadow-inner border-l-2 border-sky-500 rounded-l-none"
                              : "hover:bg-[#111827] hover:text-slate-200"
                          }
                        `}
                      >
                        <span className="transition-colors duration-150 text-slate-500 group-hover:text-slate-300 group-[.active]:text-sky-400">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
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
          {/* MENU CÀI ĐẶT XỔ NGƯỢC (POPOVER CHUẨN HÌNH 2) */}
          {isOpenSettings && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-[#0D121F]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl p-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-white/5 mb-1 select-none">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Tra cứu hệ thống
                </p>
              </div>

              {/* Duyệt mảng cấu trúc từ constants */}
              {popoverItems.map((item, idx) => {
                // Nhánh 1: Xử lý riêng cho nút Đăng xuất (Có màu rose và sự kiện logout)
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

                // Nhánh 2: Các nút chức năng hoặc liên kết thông thường
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      item.targetPath &&
                      navigate(`${prefix_path}${item.targetPath}`)
                    }
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all text-left"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div
            onClick={() => setIsOpenSettings(!isOpenSettings)}
            className={`flex items-center gap-3 p-2.5 rounded-xl border select-none cursor-pointer transition-all duration-150 group
               ${
                 isOpenSettings
                   ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                   : "bg-[#111827]/60 border-slate-900 hover:bg-[#162035]/80 hover:border-slate-800"
               }`}
          >
            {/* Tổ hợp Avatar + Tên + Email Động */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={
                  localUser.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                }
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
              />
              <div className="flex-1 min-w-0 leading-normal py-0.5">
                {/* Tên động */}
                <p className="text-[12px] font-bold text-slate-200 truncate tracking-wide">
                  {localUser.full_name || "Chí Nguyện Nguyễn"}
                </p>
                {/* Email động */}
                <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5 opacity-90">
                  {localUser.email || "ngchinguyen2506@gmail.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHỐI CONTAINER CHÍNH HIỂN THỊ NỘI DUNG (MAIN VIEWPORT BÊN PHẢI) */}
      <div className="flex-1 flex flex-col h-full bg-[#080C14] overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
