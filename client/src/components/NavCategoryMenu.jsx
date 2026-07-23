import { useEffect, useRef } from "react";
import {
  ChevronRight,
  Search,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Users,
  ArrowRight,
  Grid,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const NavCategoryMenu = ({ isScrolled, categories = [], isOpenMenu, setIsOpenMenu }) => {
  const menuRef = useRef(null);
  const { pathname } = useLocation();

  const infoLinks = [
    {
      name: "Hệ thống cửa hàng",
      to: "/he-thong-cua-hang",
      icon: <MapPin size={15} />,
    },
    {
      name: "Chính sách bảo hành",
      to: "/chinh-sach-bao-hanh",
      icon: <ShieldCheck size={15} />,
    },
    {
      name: "Điều khoản sữ dụng",
      to: "/dieu-khoan-su-dung",
      icon: <PhoneCall size={15} />,
    },
    {
      name: "Chính sách bảo mật",
      to: "/chinh-sach-bao-mat",
      icon: <PhoneCall size={15} />,
    },
    { name: "Tuyển dụng", to: "/tuyen-dung", icon: <Users size={15} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const toggleBtn = document.getElementById("menu-toggle-btn");
        if (!toggleBtn || !toggleBtn.contains(event.target)) {
          setIsOpenMenu(false);
        }
      }
    };
    if (isOpenMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenMenu, setIsOpenMenu]);

  const featured = categories.slice(0, 5);
  const grid = chunkArray(categories, 6);

  return (
    <div
      className={`font-sans select-none transition-all duration-300 w-full sticky top-16 z-40 mt-16 ${
        isScrolled
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
      ref={menuRef}
    >
      <div className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 justify-between">
          <div className="flex items-center h-full gap-2 flex-1">
            <div className="flex-1 max-w-xl sm:hidden">
              <div className="relative flex items-center">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full h-9 pl-10 pr-24 bg-slate-800 border border-slate-700 rounded-full text-sm outline-none transition-all duration-200 placeholder:text-slate-500 focus:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-colors duration-200">
                  Tìm kiếm
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center h-full gap-1">
              {infoLinks.map((link, idx) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={idx}
                    to={link.to}
                    className={`h-9 px-3.5 flex items-center gap-2 text-[13px] font-medium rounded-md transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="text-[13px] font-medium text-slate-400 hidden lg:block">
            Hotline hỗ trợ:{" "}
            <span className="text-blue-500 font-bold">0812312831</span>
          </div>
        </div>
      </div>

      {/* Menu thả xuống */}
      {isOpenMenu && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto z-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8">
            {/* Bên trái: Lưới danh mục sản phẩm (Chiếm 8 cột) */}
            <div className="col-span-1 md:col-span-8">
              <div className="flex items-center gap-2 text-slate-400 mb-4 md:mb-6 pb-2 border-b border-slate-100">
                <Grid size={14} />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Tất cả ngành hàng thể thao
                </span>
              </div>

              {categories.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Chưa có danh mục nào
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
                  {grid.map((group, gi) => (
                    <div key={gi} className="flex flex-col gap-2.5">
                      {group.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug || cat.name}`}
                          onClick={() => setIsOpenMenu(false)}
                          className="text-[13px] text-slate-600 hover:text-blue-600 hover:translate-x-1 transition-all duration-150 truncate block"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bên phải: Khối điều hướng phụ & Tiện ích (Chiếm 4 cột) */}
            <div className="col-span-1 md:col-span-4 grid grid-cols-1 gap-4 md:border-l border-slate-100 md:pl-8">
              {/* Thẻ Banner thiết kế tối giản, sang trọng */}
              <div className="rounded-xl bg-slate-900 p-5 text-white flex flex-col justify-between min-h-[140px] relative overflow-hidden shadow-sm">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[15px] uppercase tracking-wider text-blue-500">
                    Sport Nexus Hub
                  </h4>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Trang bị đầy đủ phụ kiện, dụng cụ thi đấu chuyên nghiệp
                    chính hãng.
                  </p>
                </div>
                <Link
                  to="/products"
                  onClick={() => setIsOpenMenu(false)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white hover:text-blue-400 mt-4 group transition-colors"
                >
                  <span>Xem tất cả sản phẩm</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Danh sách nổi bật thiết kế thanh lịch */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Danh mục thịnh hành
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {featured.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug || cat.name}`}
                      onClick={() => setIsOpenMenu(false)}
                      className="flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all text-[12px] font-medium"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight size={12} className="text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
