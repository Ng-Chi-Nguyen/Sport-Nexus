import {
  Icon,
  LayoutDashboard,
  NotebookText,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import Logo from "./logo";
import SearchHeader from "./search";

const Header = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return (
    <>
      <header className="w-full bg-white border-b shadow-sm h-[65px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex-shrink-0 w-[200px]">
            <Logo />
          </div>
          <div className="flex-1 max-w-2xl">
            <SearchHeader />
          </div>
          <div className="flex items-center bg-blue-500 px-3 py-1 rounded-[30px] text-white ">
            <div className="pr-3">
              <NotebookText />
            </div>
            <div className="">
              <p className="mb-[-7px] text-[12px]">Tư vấn mua hàng</p>
              <span className="font-bold cursor-pointer text-[14px]">
                0812312831
              </span>
            </div>
          </div>
          <span className="border border-solid w-[1px] h-8"></span>
          <div className="flex items-center">
            <Link
              to="/management/dashboard"
              className=" mr-3 cursor-pointer group"
            >
              <LayoutDashboard
                size={28}
                strokeWidth={1}
                className="group-hover:text-blue-600 transition-colors"
              />
            </Link>
            {user ? (
              <Link
                to="/profile"
                className="border-b-2 border-b-blue-500 flex items-center mr-5 px-3 py-1 hover:bg-blue-100 duration-500"
              >
                <User className="text-blue-500" />
                <div className="flex flex-col ml-2">
                  <p className="text-blue-500 text-[14px] font-bold">
                    {user.full_name}
                  </p>
                  <p className="text-gray-500 text-[8px] -mt-[4px]">
                    {user.email}
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="border border-solid flex items-center mr-5 px-3 py-1"
              >
                <User className="text-blue-500" />
                <p className="text-blue-500 font-bold">Tài khoản</p>
              </Link>
            )}

            <button className="relative text-blue-500 p-1 rounded-[50%] cursor-pointer p-[8px]">
              <ShoppingCart />
              <span className="absolute top-[3px] right-[2px] w-2 h-2 bg-red-600 rounded-[50%]"></span>
            </button>
            <span className="border border-solid w-[1px] h-4 ml-2"></span>
            <div className="ml-2 flex items-center cursor-pointer">
              <div className="flex items-center justify-center p-4">
                {/* Nút chứa icon với phong cách Neo-brutalism */}
                <button className="group rounded-full transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                  <Settings
                    size={24}
                    className="text-[#4facf3] transition-transform duration-700 group-hover:animate-spin"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
