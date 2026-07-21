import React, { useEffect, useState, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";

const MultiFileUpload = ({ label, value = [], onChange, maxFiles = 10 }) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = value.map((item) => {
      if (item instanceof File) return URL.createObjectURL(item);
      if (typeof item === "string") return item;
      if (item?.url) return item.url;
      return null;
    });
    setPreviews(urls.filter(Boolean));
    return () =>
      urls.forEach((u) => {
        if (u?.startsWith?.("blob:")) URL.revokeObjectURL(u);
      });
  }, [value]);

  const handleFileSelect = useCallback(
    (e) => {
      const newFiles = Array.from(e.target.files || []);
      const remaining =
        maxFiles -
        value.filter((v) => v instanceof File || typeof v === "string").length;
      if (newFiles.length > remaining) {
        newFiles.splice(remaining);
      }
      onChange([...value, ...newFiles]);
      e.target.value = "";
    },
    [value, onChange, maxFiles],
  );

  const handleRemove = useCallback(
    (index) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const canAdd = value.length < maxFiles;

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 flex items-center gap-2 border-b border-white/5">
          <span className="w-1.5 h-3.5 rounded-sm bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
          {label}
        </h3>
      )}

      <div className="grid grid-cols-4 gap-3">
        {previews.map((src, idx) => (
          <div
            key={idx}
            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-800 bg-[#0D121F]"
          >
            <img
              src={src}
              alt={`Ảnh ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {canAdd && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-[#0D121F]/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:bg-[#161F32]/40">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <ImagePlus size={24} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">
              Thêm ảnh
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

export default MultiFileUpload;
