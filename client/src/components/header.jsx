import { ChevronDown, NotebookText, ShoppingCart, User } from "lucide-react";
import Logo from "./logo";
import SearchHeader from "./search";

const Header = () => {
  return (
    <>
      <header className="w-full bg-white border-b shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <div className="flex-1 max-w-2xl">
            <SearchHeader />
          </div>
          <div className="flex items-center bg-blue-500 px-3 py-1 rounded-[30px] text-white">
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
          <div className="flex items-center">
            <div className="border border-solid flex items-center mr-5 px-3 py-1">
              <User className="text-blue-500" />
              <p className="text-blue-500 font-bold">Tài khoản</p>
            </div>
            <button className="relative text-blue-500 p-1 rounded-[50%] cursor-pointer p-[8px]">
              <ShoppingCart />
              <span className="absolute top-[3px] right-[2px] w-2 h-2 bg-red-600 rounded-[50%]"></span>
            </button>
            <div className="ml-2 flex items-center cursor-pointer">
              <p>VI</p>
              <ChevronDown size={20} strokeWidth={0.5} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
