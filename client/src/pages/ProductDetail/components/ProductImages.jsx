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
    <div className="flex gap-3 mx-auto">
      {list.length > 1 && (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
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
      <div className="w-80 h-80 md:w-96 md:h-96 rounded-sm overflow-hidden border border-slate-200">
        {list[selected]?.url ? (
          <img
            src={list[selected].url}
            alt=""
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl font-black">
            ?
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImages;
