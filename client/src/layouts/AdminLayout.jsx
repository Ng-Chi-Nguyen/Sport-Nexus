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
  Warehouse,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const prefix_path = "/management";

  const menuSalesMarketing = [
    {
      path: `${prefix_path}/orders`,
      icon: <ClipboardList strokeWidth={1} />,
      label: "Đơn hàng",
      className: "text-green-500",
      hoverClass: "group-hover:text-green-600",
    },
    {
      path: `${prefix_path}/carts`,
      icon: <ShoppingCart strokeWidth={1} />,
      label: "Giỏ hàng",
      className: "text-[#804ff3]",
      hoverClass: "group-hover:text-[#804ff3]",
    },
    {
      path: `${prefix_path}/coupons`,
      icon: <Barcode strokeWidth={1} />,
      label: "Khuyến mãi",
      className: "text-[#1fef42]",
      hoverClass: "group-hover:text-[#1fef42]",
    },
    {
      path: `${prefix_path}/reviews`,
      icon: <Star strokeWidth={1} />,
      label: "Đánh giá & Phản hồi",
      className: "text-[#f3eb16]",
      hoverClass: "group-hover:text-[#f3eb16]",
    },
  ];

  const menuCatalog_Inventory = [
    {
      path: `${prefix_path}/categories`,
      icon: <ListTree strokeWidth={1} />,
      label: "Danh mục",
      className: "text-yellow-300",
      hoverClass: "group-hover:text-yellow-300",
    },
    {
      path: `${prefix_path}/products`,
      icon: <Package strokeWidth={1} />,
      label: "Sản phẩm",
      className: "text-amber-500",
      hoverClass: "group-hover:text-amber-600",
    },
    {
      path: `${prefix_path}/product-variants`,
      icon: <ChartColumnStacked strokeWidth={1} />,
      label: "Sản phẩm chi tiết",
      className: "text-amber-500",
      hoverClass: "group-hover:text-amber-600",
    },
    {
      path: `${prefix_path}/brands`,
      icon: <Award strokeWidth={1} />,
      label: "Thương hiệu",
      className: "text-[#d34aaf]",
      hoverClass: "group-hover:text-[#d34aaf]",
    },
    {
      path: `${prefix_path}/stocks`,
      icon: <Warehouse strokeWidth={1} />,
      label: "Tồn kho",
      className: "text-[#af38ff]",
      hoverClass: "group-hover:text-[#af38ff]",
    },
  ];

  const menuSupplyChain = [
    {
      path: `${prefix_path}/suppliers`,
      icon: <ArchiveRestore strokeWidth={1} />,
      label: "Nhà cung cấp",
      className: "text-[#958c9b]",
      hoverClass: "group-hover:text-[#958c9b]",
    },
    {
      path: `${prefix_path}/purchase`,
      icon: <Import strokeWidth={1} />,
      label: "Nhập hàng",
      className: "text-[#0049f5]",
      hoverClass: "group-hover:text-[#0049f5]",
    },
  ];

  const menuUser_ACL = [
    {
      path: `${prefix_path}/users`,
      icon: <IdCard strokeWidth={1} />,
      label: "Khách hàng",
      className: "text-orange-500",
      hoverClass: "group-hover:text-orange-600",
    },
    {
      path: `${prefix_path}/permissions`,
      icon: <KeySquare strokeWidth={1} />,
      label: "Phân quyền",
      className: "text-[#d50707]",
      hoverClass: "group-hover:text-[#d50707]",
    },
    {
      path: `${prefix_path}/addresses`,
      icon: <LocateFixed strokeWidth={1} />,
      label: "Địa chỉ",
      className: "text-[#000ed1]",
      hoverClass: "group-hover:text-[#000ed1]",
    },
  ];

  const System = [
    {
      path: `${prefix_path}/dashboard`,
      icon: <LaptopMinimal strokeWidth={1} />,
      label: "Tổng quan",
      className: "text-blue-500",
      hoverClass: "group-hover:text-blue-600", // Class khi hover
    },
    {
      path: `${prefix_path}/logs`,
      icon: <ClipboardClock strokeWidth={1} />,
      label: "Hoạt động",
      className: "text-[#00d150]",
      hoverClass: "group-hover:text-[#00d150]",
    },
  ];

  const sidebarSections = [
    { title: "MENU Q.LÝ HỆ THỐNG", items: System },
    { title: "MENU Q.LÝ KINH DOANH", items: menuSalesMarketing },
    { title: "MENU Q.LÝ SẢN PHẨM & KHO", items: menuCatalog_Inventory },
    { title: "MENU Q.LÝ CHUỖI CUNG ỨNG", items: menuSupplyChain },
    { title: "MENU Q.LÝ NGƯỜI DÙNG & PHÂN QUYỀN", items: menuUser_ACL },
  ];

  // console.log(menuItems);
  return (
    <div className="flex h-[calc(100vh-65px)] max-w-[1440px] mx-auto px-4">
      <div className="w-[20%] h-screen overflow-y-auto bg-[#1E293B] text-[#fff] custom-scrollbar transition-all duration-300 p-3">
        {sidebarSections.map((section, index) => (
          <div key={index} className="mb-6">
            <p className="font-[900] text-[#4facf3] text-[16px] mb-2 tracking-tight">
              {section.title}
            </p>

            <ul className="border-l-[5px] border-[#4facf3] pl-2 space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
              group flex items-center py-2 px-1 rounded-lg cursor-pointer transition-all duration-200
              ${item.hoverClass} 
              ${isActive ? "bg-[#2c3e50]" : "hover:bg-[#252525]"}
            `}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`
                  transition-transform duration-200 group-hover:scale-110
                  ${item.className}
                  ${isActive ? `${item.hoverClass}` : ""}
                `}
                      >
                        {item.icon}
                      </span>

                      <div className="ml-2">
                        <span
                          className={`
                    ml-2 text-[17px] transition-colors duration-200 
                    ${
                      isActive ? `${item.className} font-bold` : item.hoverClass
                    }
                  `}
                        >
                          {item.label}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col border-l border-blue-400">
        <div className=""></div>
        <div className="flex-1 bg-white p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
