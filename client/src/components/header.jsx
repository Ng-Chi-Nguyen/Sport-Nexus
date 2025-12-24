import { NotebookText, User } from "lucide-react";
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
              <p className="mb-[-7px]">Tư vấn mua hàng</p>
              <span className="font-bold cursor-pointer">0812312831</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-blue-500 text-white p-1 rounded-[50%] cursor-pointer">
              <User />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
