import { Earth } from "lucide-react";
import Badge from "./badge";

const CardBrand = ({ data }) => {
  const { logo, name, origin } = data || {};

  const placeholderImage =
    "https://placehold.co/200x200/0d121f/94a3b8?text=No+Logo";

  return (
    <div
      className="group relative bg-[#111827]/40 p-5 cursor-pointer w-[90%]
                 border border-slate-800/60
                 hover:border-sky-500/40
                 transition-all duration-400
                 hover:shadow-[0_0_40px_rgba(14,165,233,0.12)]
                 overflow-hidden"
    >
      <div
        className="absolute inset-0  opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none
                   bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <div
          className="w-[70%] h-auto p-2 flex items-center justify-center
                     bg-[#0D121F] overflow-hidden flex-shrink-0
                     ring-2 ring-slate-700/60 group-hover:ring-sky-400/50
                     shadow-[0_0_20px_rgba(0,0,0,0.3)]
                     group-hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]
                     transition-all duration-300"
        >
          <img
            src={logo || placeholderImage}
            alt={name || "Brand Logo"}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
        </div>

        <div className="space-y-1">
          <h3
            className="text-base font-bold text-slate-100 truncate max-w-[180px] mx-auto group-hover:text-white transition-colors duration-200 tracking-wide"
            title={name}
          >
            {name || "Tên thương hiệu"}
          </h3>

          {origin ? (
            <Badge color="blue">
              <Earth size={12} className="shrink-0" strokeWidth={2} />
              <span className="pl-1 truncate max-w-[140px]">{origin}</span>
            </Badge>
          ) : (
            <span className="text-[12px] text-slate-600 italic block">
              Chưa cập nhật
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { CardBrand };
