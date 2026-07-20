import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  X,
  Menu,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Users,
  ArrowRight,
  Grid,
} from "lucide-react";
import { Link } from "react-router-dom";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const NavCategoryMenu = ({ isScrolled, compact, categories = [] }) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const menuRef = useRef(null);

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
      name: "Tư vấn mua hàng",
      to: "/tu-van-mua-hang",
      icon: <PhoneCall size={15} />,
    },
    { name: "Tuyển dụng", to: "/tuyen-dung", icon: <Users size={15} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false);
      }
    };
    if (isOpenMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenMenu]);

  const featured = categories.slice(0, 5);
  const grid = chunkArray(categories, 6);

  return (
    <div
      className={`font-sans select-none transition-all duration-300 ${
        compact ? "relative" : "w-full sticky top-16 z-40 mt-16"
      } ${
        compact
          ? ""
          : isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
      }`}
      ref={menuRef}
    >
      {compact ? (
        <button
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
            isOpenMenu
              ? "bg-primary/10 text-primary"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Menu size={16} />
          <span>Danh mục</span>
        </button>
      ) : (
        <div className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 flex items-center h-14 justify-between">
            <div className="flex items-center h-full gap-2">
              <button
                onClick={() => setIsOpenMenu(!isOpenMenu)}
                className={`h-full px-5 flex items-center gap-2.5 font-bold text-[13px] uppercase tracking-wider transition-all duration-200 ${
                  isOpenMenu
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-slate-200 hover:text-white hover:bg-slate-800"
                }`}
              >
                {isOpenMenu ? <X size={16} /> : <Menu size={16} />}
                <span>Danh mục sản phẩm</span>
              </button>

              <nav className="hidden md:flex items-center h-full gap-1">
                {infoLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className="h-9 px-3.5 flex items-center gap-2 text-[13px] font-medium text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-all"
                  >
                    <span className="text-slate-400 group-hover:text-white">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="text-[13px] font-medium text-slate-400 hidden lg:block">
              Hotline hỗ trợ:{" "}
              <span className="text-blue-500 font-bold">0812312831</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu thả xuống tinh chỉnh tinh tế */}
      {isOpenMenu && (
        <div
          className={`${
            compact
              ? "fixed top-16 left-0 w-full"
              : "absolute top-full left-0 w-full"
          } bg-white border-b border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto z-50`}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 p-8">
            {/* Bên trái: Lưới danh mục sản phẩm (Chiếm 8 cột) */}
            <div className="col-span-8">
              <div className="flex items-center gap-2 text-slate-400 mb-6 pb-2 border-b border-slate-100">
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
                <div className="grid grid-cols-4 gap-x-8 gap-y-4">
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
            <div className="col-span-4 grid grid-cols-1 gap-4 border-l border-slate-100 pl-8">
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
