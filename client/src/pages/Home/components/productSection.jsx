import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProductCard } from "@/components/ui/card";
import SeeMore from "@/components/ui/seeMore";

export const ProductSection = ({ title, products = [] }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const categoryId = products[0]?.category?.id || "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
              <span className="border-b border-blue-600">{title}</span>
            </h2>
          </div>
          <button
            onClick={() => navigate(`/san-pham?category_ids=${categoryId}`)}
            className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors shrink-0"
          >
            {t("view_all")} <ChevronRight size={14} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>

          <SeeMore
            to={`/san-pham?category_ids=${categoryId}`}
            label={t("see_more")}
          />
        </div>
      </div>
    </div>
  );
};
