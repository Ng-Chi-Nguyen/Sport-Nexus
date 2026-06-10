import { Earth } from "lucide-react";

const CardBrand = ({ data }) => {
  const { logo, name, origin } = data || {};

  const placeholderImage =
    "https://placehold.co/200x200/0d121f/94a3b8?text=No+Logo";

  return (
    <div
      className="group flex items-center bg-[#111827]/60 border border-slate-900 rounded-xl p-4 gap-4
                 shadow-xl hover:border-sky-500/40 hover:bg-[#161F32]/80
                 hover:shadow-[0_0_20px_rgba(79,172,243,0.12)] 
                 transition-all duration-300 cursor-pointer w-full"
    >
      {/* 1. KHUNG LOGO TRÒN PHONG CÁCH MỚI (Nhìn cực kỳ Hi-Tech) */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0D121F] 
                  border border-slate-800/80 overflow-hidden relative flex-shrink-0 
                  transition-colors duration-300 group-hover:border-sky-500/30 p-1.5 shadow-inner"
      >
        <img
          src={logo || placeholderImage}
          alt={name || "Brand Logo"}
          className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-screen"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
      </div>

      {/* 2. KHỐI THÔNG TIN NẰM BÊN PHẢI (Xếp ngang hàng với Logo) */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Tên thương hiệu - Căn lề trái tinh tế */}
        <h3
          className="text-sm font-semibold text-slate-200 truncate w-full group-hover:text-sky-400 transition-colors duration-200 tracking-wide"
          title={name}
        >
          {name || "Tên thương hiệu"}
        </h3>

        {/* Cụm Xuất xứ & Tag Quản lý phụ trợ (Mô phỏng như ảnh mẫu) */}
        <div className="flex flex-wrap items-center gap-2">
          {origin ? (
            <div className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium text-sky-400 max-w-full">
              <Earth
                size={11}
                className="shrink-0 text-sky-400"
                strokeWidth={2}
              />
              <span className="truncate">{origin}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 italic">
              Chưa cập nhật
            </span>
          )}

          {/* Bạn có thể giữ các tag mô phỏng này để layout đầy đặn hoặc xóa nếu không cần */}
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900/40 border border-slate-800/60 px-1.5 py-0.5 rounded">
            Hệ thống
          </span>
        </div>
      </div>
    </div>
  );
};

export { CardBrand };
