import { Earth } from "lucide-react";
import { BtnDelete, BtnEdit } from "@/components/ui/button";

const CardBrand = ({ data }) => {
  const { logo, name, origin } = data || {};

  // Ảnh hiển thị mặc định nếu thương hiệu chưa có logo
  const placeholderImage = "https://placehold.co/200x200/png?text=No+Logo";

  return (
    <div
      className="group flex flex-col h-full bg-white border-2 border-[#323232] rounded-[10px] p-4 shadow-[4px_4px_0px_0px_#323232] 
    hover:shadow-[4px_4px_0px_0px_#4facf3] hover:border-[#4facf3] transition-all duration-300 cursor-pointer"
    >
      <div className="h-[140px] w-full flex items-center justify-center bg-gray-50 rounded-[8px] border border-gray-100 mb-4 overflow-hidden relative group-hover:border-[#4facf3]/20 transition-colors">
        <img
          src={logo || placeholderImage}
          alt={name || "Brand Logo"}
          className="w-fit object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
      </div>
      <div className="flex flex-col flex-grow items-center text-center">
        <div className="flex flex-col flex-grow items-center text-center w-full overflow-hidden">
          {/* Tên thương hiệu - Thêm w-full và truncate */}
          <h3
            className="text-sm font-bold text-[#323232] mb-1 w-full truncate px-1 group-hover:text-[#4facf3]"
            title={name}
          >
            {name || "Tên thương hiệu"}
          </h3>

          {/* Xuất xứ - Thêm max-w-full để không bị lòi ra ngoài */}
          {origin ? (
            <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#4facf3] max-w-full">
              {/* Thêm shrink-0 để icon không bị bẹp khi chữ quá dài */}
              <Earth size={11} className="shrink-0" />
              <span className="truncate">{origin}</span>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 italic">
              Chưa cập nhật
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { CardBrand };
