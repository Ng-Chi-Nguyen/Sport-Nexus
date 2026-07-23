import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { slug: "newest", name: "Mới nhất" },
  { slug: "best-selling", name: "Bán chạy" },
  { slug: "price-asc", name: "Giá: Thấp → Cao" },
  { slug: "price-desc", name: "Giá: Cao → Thấp" },
  { slug: "rating", name: "Đánh giá cao nhất" },
];

const FilterSelect = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.slug === value);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
      >
        <span className={selected ? "text-slate-700" : "text-slate-400"}>{selected ? selected.name : placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.slug}
              onClick={() => { onChange(opt.slug); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${value === opt.slug ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterSidebar = ({ search, sort, categoryId, brandId, priceMin, priceMax, categories, brands, onSearchChange, onSortChange, onCategoryChange, onBrandChange, onPriceMinChange, onPriceMaxChange, onClear }) => {
  const [searchInput, setSearchInput] = useState(search || "");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => onSearchChange(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search || "");
  }, [search]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
        Bộ lọc
      </h3>

      {/* Search */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); onSearchChange(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Danh mục
        </label>
        <FilterSelect
          value={categoryId}
          onChange={onCategoryChange}
          placeholder="Tất cả danh mục"
          options={[
            { slug: "", name: "Tất cả" },
            ...(categories || []).map((c) => ({ slug: String(c.id), name: c.name })),
          ]}
        />
      </div>

      {/* Brand */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Thương hiệu
        </label>
        <FilterSelect
          value={brandId}
          onChange={onBrandChange}
          placeholder="Tất cả thương hiệu"
          options={[
            { slug: "", name: "Tất cả" },
            ...(brands || []).map((b) => ({ slug: String(b.id), name: b.name })),
          ]}
        />
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Khoảng giá
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
          <span className="text-slate-300 shrink-0">–</span>
          <input
            type="number"
            placeholder="Tối đa"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Sắp xếp
        </label>
        <FilterSelect
          value={sort || "newest"}
          onChange={onSortChange}
          placeholder="Mới nhất"
          options={SORT_OPTIONS}
        />
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="w-full py-2.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default FilterSidebar;
