import { Search } from "lucide-react";

const SearchHeader = () => {
  return (
    <div className="relative">
      <Search
        className="absolute left-1 top-3 w-5 h-5 text-gray-500"
        strokeWidth={0.5}
      />
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm"
        className=" bg-gray-50 border border-gray-200 w-[100%] rounded-full] h-[40px] pl-10 outline-none pl-[30px] text-sm h-9 placeholder:text-gray-400"
      />
      <div className="absolute top-[5px] right-[0] flex items-center gap-3 px-4 border-l border-gray-200 h-8 ml-4">
        <span className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">
          Tìm Kiếm
        </span>
      </div>
    </div>
  );
};
export default SearchHeader;
