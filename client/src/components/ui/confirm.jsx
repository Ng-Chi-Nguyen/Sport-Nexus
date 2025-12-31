import React, { useRef, useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";

const ConfirmDelete = ({ isOpen, title, message, onConfirm, onCancel }) => {
  // 1. Tạo một tham chiếu (ref) đến hộp thoại chính
  const modalRef = useRef();

  useEffect(() => {
    // 2. Hàm xử lý khi nhấn chuột
    const handleClickOutside = (event) => {
      // Nếu nhấn vào vùng ngoài (không nằm trong modalRef) thì đóng modal
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };

    // 3. Đăng ký sự kiện khi modal đang mở
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 4. Quan trọng: Xóa sự kiện khi đóng modal hoặc unmount để tránh lỗi bộ nhớ
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* 5. Gắn ref vào đây - Đây là vùng "bên trong" */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white border-4 border-[#323232] shadow-[8px_8px_0px_0px_#323232] rounded-[10px] p-6 animate-in fade-in zoom-in duration-200"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#323232]"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-4 bg-red-100 rounded-full border-2 border-[#323232]">
            <TriangleAlert size={40} className="text-red-500" />
          </div>

          <h3 className="text-2xl font-black uppercase text-[#323232] mb-2">
            {title}
          </h3>
          <p className="text-gray-500 font-medium mb-8">{message}</p>

          <div className="flex w-full gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 font-bold uppercase border-2 border-[#323232] rounded-[5px] shadow-[4px_4px_0px_0px_#323232] active:translate-y-1 active:shadow-none transition-all"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 font-bold uppercase bg-red-500 text-white border-2 border-[#323232] rounded-[5px] shadow-[4px_4px_0px_0px_#323232] active:translate-y-1 active:shadow-none transition-all"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ConfirmDelete };
