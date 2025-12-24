import { Search } from "lucide-react";

const SearchHeader = () => {
  return (
    <div className="relative">
      <Search className="absolute left-1 top-2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm"
        className=" bg-gray-50 border border-gray-200 w-[500px] rounded-full] h-[40px] pl-10 outline-none pl-[30px] text-sm h-9 placeholder:text-gray-400"
      />
    </div>
  );
};
export default SearchHeader;
