import { useState } from "react";

const ProductImages = ({ thumbnail, images }) => {
  const allImages = images || [];
  const [selected, setSelected] = useState(0);

  const list = thumbnail
    ? [{ url: thumbnail, is_primary: true }, ...allImages]
    : allImages.length > 0
      ? allImages
      : [{ url: null, is_primary: false }];

  return (
    <div className="flex gap-3.5 mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {list.length > 1 && (
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-96 pr-1 custom-scrollbar">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${
                i === selected
                  ? "border-sky-500 shadow-sky-500/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500/50 bg-slate-50 dark:bg-[#111827]/40"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <div className="w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 shadow-xl dark:shadow-2xl backdrop-blur-md flex items-center justify-center">
        {list[selected]?.url ? (
          <img
            src={list[selected].url}
            alt=""
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-6xl font-black">
            ?
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImages;
