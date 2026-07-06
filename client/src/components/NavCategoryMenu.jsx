import { useState, useEffect, useRef } from "react"; // 🌟 THÊM: import useEffect và useRef
import { ChevronRight, X, Menu } from "lucide-react";

export const NavCategoryMenu = () => {
  // Trạng thái đóng/mở toàn bộ bảng danh mục lớn
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  // Trạng thái Tab đang được active bên trong menu
  const [activeSubTab, setActiveSubTab] = useState("sports");

  // 🌟 THÊM: Tạo một ref để định vị toàn bộ vùng Menu
  const menuRef = useRef(null);

  // 🌟 THÊM: Bộ lắng nghe sự kiện click ngoài vùng menu để tự động đóng
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu click ra ngoài vùng menuRef quản lý, ta tiến hành đóng bảng menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false);
      }
    };

    if (isOpenMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenMenu]);

  // Dữ liệu danh mục
  const sportsCategories = {
    "BÓNG RỔ": ["Bóng thi đấu", "Giày bóng rổ", "Quần áo", "Phụ kiện bóng rổ"],
    "BÓNG CHUYỀN": [
      "Bóng thi đấu",
      "Giày bóng chuyền",
      "Quần áo",
      "Phụ kiện bóng chuyền",
    ],
    "BÓNG ĐÁ & FUTSAL": [
      "Bóng thi đấu",
      "Giày bóng đá",
      "Quần áo",
      "Phụ kiện bóng đá",
    ],
    "TẬP GYM & WORKOUT": ["Quần áo", "Giày tập Gym", "Phụ kiện tập Fitness"],
    "CHẠY BỘ & ĐI BỘ": ["Giày chạy bộ", "Quần áo", "Phụ kiện chạy bộ"],
    "CẦU LÔNG": [
      "Vợt cầu lông",
      "Cầu thi đấu",
      "Giày cầu lông",
      "Quần áo",
      "Phụ kiện cầu lông",
    ],
    "BI-A": [
      "Gậy Đánh Bi-a",
      "Gậy Phá Bi-a",
      "Gậy Nhảy Bi-a",
      "Bao đựng cơ",
      "Áo thi đấu",
      "Phụ kiện bi-a",
    ],
    PICKLEBALL: ["Giày Pickleball", "Vợt Pickleball", "Phụ kiện Pickleball"],
  };

  const navLinks = [
    { id: "pickleball", label: "Pickleball chính hãng" },
    { id: "bida", label: "Bi-a Chính Hãng" },
    { id: "volleyball", label: "Giày bóng chuyền Sao Vàng" },
    { id: "seagames", label: "SEAGAMES 2026" },
    { id: "sale", label: "XẢ KHO 50%" },
  ];

  return (
    // THÊM: Gắn ref={menuRef} vào thẻ div bọc ngoài cùng này
    <div className="w-full relative z-50 font-sans select-none" ref={menuRef}>
      {/* ─── THANH TAB MENU CHÍNH ─── */}
      <div className="w-full bg-[#1E3A8A] text-white shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center h-12">
          <button
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            className={`h-full px-6 flex items-center gap-2 font-bold text-[13px] uppercase tracking-wide transition-all duration-150
              ${isOpenMenu ? "bg-[#0F172A]" : "bg-[#1E40AF] hover:bg-[#1D4ED8]"}`}
          >
            {isOpenMenu ? <X size={16} /> : <Menu size={16} />}
            <span>Danh mục sản phẩm</span>
          </button>

          <nav className="flex items-center h-full ml-4 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="h-full px-4 flex items-center text-[13px] font-medium text-slate-100 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── BẢNG MEGA MENU THẢ XUỐNG KHI ĐƯỢC CHỌN ─── */}
      {isOpenMenu && (
        <div className="absolute top-full left-0 w-full bg-[#F8FAFC] border-b border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 flex">
          <div className="max-w-[1400px] w-full mx-auto grid grid-cols-12 bg-white">
            {/* PANEL TRÁI */}
            <div className="col-span-10 p-6 border-r border-slate-100">
              <div className="flex items-center gap-6 border-b border-slate-100 pb-3 mb-6">
                {["sports", "men", "women", "accessories"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`pb-2 text-[13px] font-black uppercase tracking-wider border-b-2 transition-all
                      ${activeSubTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    {tab === "sports"
                      ? "🏀 Môn thể thao"
                      : tab === "men"
                        ? "🏃‍♂️ Thể thao Nam"
                        : tab === "women"
                          ? "🤸‍♀️ Thể thao Nữ"
                          : "🎒 Phụ kiện"}
                  </button>
                ))}
              </div>

              {activeSubTab === "sports" && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-8">
                  {Object.entries(sportsCategories).map(([subTitle, items]) => (
                    <div key={subTitle} className="space-y-2.5">
                      <h4 className="text-[12px] font-black text-slate-900 tracking-wider uppercase border-l-2 border-blue-600 pl-2">
                        {subTitle}
                      </h4>
                      <ul className="space-y-1.5">
                        {items.map((item, idx) => (
                          <li key={idx}>
                            <a
                              href={`#${item}`}
                              className="text-[12px] text-slate-500 hover:text-blue-600 hover:font-medium transition-all block truncate"
                            >
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeSubTab !== "sports" && (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  Nội dung đang được cập nhật liên tục...
                </div>
              )}
            </div>

            {/* PANEL PHẢI */}
            <div className="col-span-2 flex flex-col justify-between bg-slate-50/60 p-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center space-y-2 relative overflow-hidden group">
                <h4 className="font-black text-blue-800 text-[14px] uppercase tracking-wide leading-tight">
                  Các môn
                  <br />
                  thể thao
                </h4>
                <p className="text-[10px] text-blue-500 font-medium">
                  Sport Nexus Hub
                </p>
              </div>

              <div className="space-y-1 mt-4">
                <div className="bg-blue-600 text-white rounded-lg p-2.5 text-center group cursor-pointer hover:bg-blue-700 transition-all">
                  <span className="block text-[11px] font-black uppercase tracking-wider">
                    Môn thể thao
                  </span>
                  <span className="text-[9px] text-blue-200 block mt-0.5 group-hover:text-white transition-all">
                    Xem thêm ›
                  </span>
                </div>
                <div className="space-y-0.5 pt-2">
                  {[
                    "Pickleball chính hãng",
                    "Bi-a Chính Hãng",
                    "Giày bóng chuyền Sao Vàng",
                  ].map((txt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 cursor-pointer text-slate-600 hover:text-blue-600 transition-all"
                    >
                      <span className="text-[11px] font-bold truncate">
                        {txt}
                      </span>
                      <ChevronRight
                        size={12}
                        className="text-slate-400 shrink-0"
                      />
                    </div>
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
