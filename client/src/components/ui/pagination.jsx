import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  // Hàm tạo mảng các số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)]; // Loại bỏ trùng lặp nếu có
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-3 mt-2 mb-2 mr-5 font-black">
      {/* Nút Quay lại */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center p-2 border-2 border-[#323232] bg-white shadow-[3px_3px_0px_0px_#323232] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={20} strokeWidth={3} />
      </button>

      {/* Danh sách các trang */}
      <div className="flex gap-2">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 self-end text-[#323232]">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`
                  w-10 h-10 border-2 border-[#323232] transition-all
                  ${
                    currentPage === page
                      ? "bg-[#4facf3] text-white shadow-none translate-x-[3px] translate-y-[3px]"
                      : "bg-white text-[#323232] shadow-[3px_3px_0px_0px_#323232] hover:bg-gray-50 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Nút Tiếp theo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center p-2 border-2 border-[#323232] bg-white shadow-[3px_3px_0px_0px_#323232] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Pagination;
