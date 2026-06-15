import React, { useRef, useEffect } from "react";
import { LogOut, TriangleAlert, X } from "lucide-react";

// 1. MODAL XÁC NHẬN XÓA (STYLE GLASSOS NEON DANGER)
const ConfirmDelete = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* KHUNG MODAL TỐI MỜ HÀO QUANG ĐỎ GIẬN DỮ */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm bg-[#0D121F]/90 border border-rose-500/30 
                   shadow-[0_0_40px_rgba(244,63,94,0.15)] rounded-2xl p-6 
                   backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Nút đóng X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors duration-150"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Vòng tròn cảnh báo Đỏ phát sáng */}
          <div className="mb-4 p-3.5 bg-rose-500/10 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <TriangleAlert size={32} className="text-rose-400" />
          </div>

          {/* Tiêu đề Modal: Bỏ font-black thô, dùng font-bold tracking rộng */}
          <h3 className="text-lg font-bold text-slate-100 tracking-wide mb-1.5">
            {title}
          </h3>

          <p className="text-slate-400 text-xs leading-relaxed mb-6 px-2">
            {message}
          </p>

          {/* Cụm nút bấm hàng ngang phẳng lì, hiện đại */}
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.2)] transition-all duration-150"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. MODAL XÁC NHẬN CHUNG (THOÁT/ĐĂNG XUẤT/THÔNG BÁO)
const Confirm = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = "danger",
}) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* KHUNG MODAL THEME TỐI ĐA NĂNG */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-sm bg-[#0D121F]/90 border rounded-2xl p-6 backdrop-blur-xl animate-in zoom-in-95 duration-200 shadow-2xl
                   ${isDanger ? "border-rose-500/20 shadow-rose-500/5" : "border-sky-500/20 shadow-sky-500/5"}`}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors duration-150"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Vòng tròn Icon mờ */}
          <div
            className={`mb-4 p-3.5 rounded-full border ${
              isDanger
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-sky-500/10 text-sky-400 border-sky-500/30"
            }`}
          >
            <LogOut
              size={24}
              className={isDanger ? "text-rose-400" : "text-sky-400"}
            />
          </div>

          <h3 className="text-lg font-bold text-slate-100 tracking-wide mb-1.5">
            {title}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 px-2">
            {message}
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 ${
                isDanger
                  ? "bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.2)]"
                  : "bg-sky-600 hover:bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
              }`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ConfirmDelete, Confirm };
