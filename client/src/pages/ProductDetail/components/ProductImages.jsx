import { useState } from "react";
import { useTranslation } from "react-i18next";

const ProductImages = ({ thumbnail, images }) => {
  const { t } = useTranslation();
  const allImages = images || [];
  const [selected, setSelected] = useState(0);

  const list = thumbnail
    ? [{ url: thumbnail, is_primary: true }, ...allImages]
    : allImages.length > 0
      ? allImages
      : [{ url: null, is_primary: false }];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3.5 mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200 w-full">
      {/* Thumbnail List - Section bên dưới trên Mobile (flex-col-reverse) */}
      {list.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-w-full sm:max-h-96 pb-3 sm:pb-0 sm:pr-1 custom-scrollbar justify-center sm:justify-start">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`w-14 h-14 md:w-16 md:h-16 shrink-0 overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${
                i === selected
                  ? "border-sky-500 shadow-sky-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500/50 bg-slate-50 dark:bg-[#111827]/40"
              }`}
              title={t("thumbnail_image")}
            >
              <img
                src={img.url}
                alt={t("product_image_alt")}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Preview Image - Section bên trên trên Mobile (flex-col-reverse) */}
      <div className="flex-1 min-w-0 w-full aspect-square overflow-hidden border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md flex items-center justify-center order-last sm:order-none">
        <div className="flex-1 min-w-0 w-full aspect-square overflow-hidden border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md flex items-center justify-center order-last sm:order-none">
          {list[selected]?.url ? (
            <img
              src={list[selected].url}
              alt={t("product_preview_alt")}
              // SỬA DÒNG CLASS DƯỚI ĐÂY: object-contain -> object-scale-down
              className="w-[400px] h-auto object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-6xl font-black">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
