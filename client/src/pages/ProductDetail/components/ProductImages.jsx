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
    <div className="space-y-3">
      <div className="aspect-square rounded-sm overflow-hidden bg-[#F8F8F8] border border-slate-200">
        {list[selected]?.url ? (
          <img
            src={list[selected].url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl font-black">
            ?
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                i === selected
                  ? "border-blue-500"
                  : "border-slate-200 hover:border-blue-300"
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
    </div>
  );
};

export default ProductImages;
