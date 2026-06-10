import React, { useState } from "react";

const SearchTable = (props) => {
  const { placeholder } = props;
  const [searchValue, setSearchValue] = useState("");

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative w-full">
      {/* Icon kính lúp - Đổi màu sang text-slate-500 để ẩn mình vào nền tối */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <svg
          className="w-4 h-4 text-slate-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>

      {/* Ô Input chính - Lột xác sang phong cách Sci-Fi Dark Mode */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 rounded-xl text-sm 
                   bg-[#111827]/80 text-slate-200 placeholder-slate-500
                   border border-slate-800/80
                   focus:outline-none focus:border-sky-500 focus:bg-[#111827]
                   focus:ring-1 focus:ring-sky-500/30
                   transition-all duration-200"
      />

      {/* Nút Xóa nhanh - Đổi màu hover tinh tế hơn */}
      {searchValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export { SearchTable };
