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
  LaptopMinimal,
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
  Bell,
  Search,
  MessageSquare,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const prefix_path = "/management";

  const menuSalesMarketing = [
    {
      path: `${prefix_path}/orders`,
      icon: <ClipboardList strokeWidth={1.5} size={18} />,
      label: "Đơn hàng",
    },
    {
      path: `${prefix_path}/carts`,
      icon: <ShoppingCart strokeWidth={1.5} size={18} />,
      label: "Giỏ hàng",
    },
    {
      path: `${prefix_path}/coupons`,
      icon: <Barcode strokeWidth={1.5} size={18} />,
      label: "Khuyến mãi",
    },
    {
      path: `${prefix_path}/reviews`,
      icon: <Star strokeWidth={1.5} size={18} />,
      label: "Đánh giá & Phản hồi",
    },
  ];

  const menuCatalog_Inventory = [
    {
      path: `${prefix_path}/categories`,
      icon: <ListTree strokeWidth={1.5} size={18} />,
      label: "Danh mục",
    },
    {
      path: `${prefix_path}/products`,
      icon: <Package strokeWidth={1.5} size={18} />,
      label: "Sản phẩm",
    },
    {
      path: `${prefix_path}/product-variants`,
      icon: <ChartColumnStacked strokeWidth={1.5} size={18} />,
      label: "Sản phẩm chi tiết",
    },
    {
      path: `${prefix_path}/attribute-key`,
      icon: <Tag strokeWidth={1.5} size={18} />,
      label: "Thuộc tính SP",
    },
    {
      path: `${prefix_path}/brands`,
      icon: <Award strokeWidth={1.5} size={18} />,
      label: "Thương hiệu",
    },
    {
      path: `${prefix_path}/stocks`,
      icon: <Warehouse strokeWidth={1.5} size={18} />,
      label: "Tồn kho",
    },
  ];

  const menuSupplyChain = [
    {
      path: `${prefix_path}/suppliers`,
      icon: <ArchiveRestore strokeWidth={1.5} size={18} />,
      label: "Nhà cung cấp",
    },
    {
      path: `${prefix_path}/purchase`,
      icon: <Import strokeWidth={1.5} size={18} />,
      label: "Nhập hàng",
    },
  ];

  const menuUser_ACL = [
    {
      path: `${prefix_path}/users`,
      icon: <IdCard strokeWidth={1.5} size={18} />,
      label: "Khách hàng",
    },
    {
      path: `${prefix_path}/permissions`,
      icon: <KeySquare strokeWidth={1.5} size={18} />,
      label: "Phân quyền",
    },
    {
      path: `${prefix_path}/addresses`,
      icon: <LocateFixed strokeWidth={1.5} size={18} />,
      label: "Địa chỉ",
    },
  ];

  const System = [
    {
      path: `${prefix_path}/dashboard`,
      icon: <LayoutDashboard strokeWidth={1.5} size={18} />,
      label: "Tổng quan",
    },
    {
      path: `${prefix_path}/logs`,
      icon: <ClipboardClock strokeWidth={1.5} size={18} />,
      label: "Hoạt động",
    },
  ];

  const sidebarSections = [
    { title: "HỆ THỐNG", items: System },
    { title: "KINH DOANH", items: menuSalesMarketing },
    { title: "SẢN PHẨM & KHO", items: menuCatalog_Inventory },
    { title: "CHUỖI CUNG ỨNG", items: menuSupplyChain },
    { title: "NGƯỜI DÙNG & ACL", items: menuUser_ACL },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-400 font-sans antialiased overflow-hidden">
      <div className="w-[260px] h-full bg-[#0D121F] border-r border-slate-900 flex flex-col justify-between p-4 selection:bg-sky-500/30">
        <div>
          {/* Logo GlassOS */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <span className="font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide leading-tight">
                SPORTNEXUS
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Menu Navigation */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
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

        {/* User Profile & Footer Sidebar */}
        <div className="pt-4 border-t border-slate-900 space-y-3">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-slate-900 hover:text-rose-400 transition-colors">
            <Settings size={18} strokeWidth={1.5} />
            <span>Cài đặt</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-rose-500/80 hover:bg-rose-950/20 hover:text-rose-400 transition-colors">
            <LogOut size={18} strokeWidth={1.5} />
            <span>Đăng xuất</span>
          </button>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#111827]/60 border border-slate-900">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate">
                Alex Rivera
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Pro Plan User
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Bên phải) */}
      <div className="flex-1 flex flex-col h-full bg-[#080C14] overflow-hidden">
        {/* Vùng hiển thị Router Con */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
