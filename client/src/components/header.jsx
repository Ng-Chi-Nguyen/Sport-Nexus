import {
  ChevronDown,
  Languages,
  LayoutDashboard,
  NotebookText,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import Logo from "./logo";
import SearchHeader from "./search";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <header className="w-full bg-white border-b shadow-sm h-[65px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex-shrink-0">
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
              to="/dashboard-management"
              className=" mr-3 cursor-pointer group"
            >
              <LayoutDashboard
                size={28}
                strokeWidth={1}
                className="group-hover:text-blue-600 transition-colors"
              />
            </Link>
            <div className="border border-solid flex items-center mr-5 px-3 py-1">
              <User className="text-blue-500" />
              <p className="text-blue-500 font-bold">Tài khoản</p>
            </div>
            <button className="relative text-blue-500 p-1 rounded-[50%] cursor-pointer p-[8px]">
              <ShoppingCart />
              <span className="absolute top-[3px] right-[2px] w-2 h-2 bg-red-600 rounded-[50%]"></span>
            </button>
            <span className="border border-solid w-[1px] h-4 ml-2"></span>
            <div className="ml-2 flex items-center cursor-pointer">
              <Settings size={25} strokeWidth={0.6} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
