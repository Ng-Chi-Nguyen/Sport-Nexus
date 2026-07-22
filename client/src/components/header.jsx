import {
  LayoutDashboard,
  Search,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "./logo";
import { NavCategoryMenu } from "./NavCategoryMenu";
import { useCart } from "@/contexts/CartContext";

const Header = ({ isScrolled, categories }) => {
  const { count } = useCart();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/70 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-8">
        <div className="flex items-center gap-3">
          <Logo />
          <div
            className={`transition-all duration-300 ${
              isScrolled
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <NavCategoryMenu compact categories={categories} />
          </div>
        </div>

        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full h-10 pl-10 pr-24 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors duration-200">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {user && user.role.slug !== "customer" && (
            <Link
              to="/management/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 font-medium text-sm"
            >
              <LayoutDashboard size={18} strokeWidth={1.5} />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          )}

          {user ? (
            <Link
              to="/tai-khoan"
              className="flex items-center gap-2.5 px-2 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 min-w-[140px]"
            >
              <div className="w-10 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold shrink-0">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-[150px] h-auto rounded-[50%]"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium max-w-[145px] truncate">
                  {user.full_name}
                </span>
                <span className="text-[10px] text-gray-400 hidden md:block">
                  {user.email}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all duration-200"
            >
              <User size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium hidden sm:inline">
                Đăng nhập
              </span>
            </Link>
          )}

          <Link
            to="/gio-hang"
            className="relative p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <button className="p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200">
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
