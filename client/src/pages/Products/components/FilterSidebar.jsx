import { useState } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

const PRICE_RANGES = [
  { label: "Dưới 500.000₫", min: 0, max: 500000 },
  { label: "500.000₫ - 1 triệu", min: 500000, max: 1000000 },
  { label: "1 triệu - 1.500.000₫", min: 1000000, max: 1500000 },
  { label: "1.500.000₫ - 2 triệu", min: 1500000, max: 2000000 },
  { label: "2 triệu - 2.500.000₫", min: 2000000, max: 2500000 },
  { label: "2.500.000₫ - 3 triệu", min: 2500000, max: 3000000 },
  { label: "Trên 3 triệu", min: 3000000, max: 99999999 },
];

const SHOE_SIZES = Array.from({ length: 7 }, (_, i) => String(35 + i));
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const CheckboxGroup = ({ title, options, selected, onChange }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 min-w-[160px]">
    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</h4>
    <div className="space-y-2 max-h-[220px] overflow-y-auto">
      {options.map((opt) => {
        const isChecked = selected.includes(opt.value);
        return (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[13px] text-slate-700 group-hover:text-slate-900 transition-colors">{opt.label}</span>
          </label>
        );
      })}
    </div>
  </div>
);

const activePriceRange = (priceMin, priceMax) => {
  if (!priceMin && !priceMax) return [];
  const match = PRICE_RANGES.find(
    (r) => String(priceMin) === String(r.min) && String(priceMax) === String(r.max)
  );
  return match ? [`${match.min}-${match.max}`] : [];
};

const FilterBar = ({
  search, categoryIds, brandIds, priceMin, priceMax,
  attrFilter, categories, brands,
  onSearchChange, onCategoryChange, onBrandChange, onPriceRangeChange,
  onAttrFilterChange, onClear,
}) => {
  const [open, setOpen] = useState(true);
  const [searchInput, setSearchInput] = useState(search || "");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleSearchInput = (val) => {
    setSearchInput(val);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => onSearchChange(val), 400);
    setDebounceTimer(timer);
  };

  const attrValues = attrFilter ? attrFilter.split(",").filter(Boolean) : [];

  const selectedAttrs = (key) =>
    attrValues
      .filter((a) => a.startsWith(`${key}:`))
      .map((a) => a.split(":")[1]);

  const toggleAttr = (key, value) => {
    const existing = attrValues.filter((a) => !a.startsWith(`${key}:`));
    const currentForKey = selectedAttrs(key);
    if (currentForKey.includes(value)) {
      onAttrFilterChange(existing.join(","));
    } else {
      existing.push(`${key}:${value}`);
      onAttrFilterChange(existing.join(","));
    }
  };

  const selectedCategoryIds = categoryIds ? categoryIds.split(",").filter(Boolean) : [];
  const selectedBrandIds = brandIds ? brandIds.split(",").filter(Boolean) : [];

  const toggleCategory = (id) => {
    const updated = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((x) => x !== id)
      : [...selectedCategoryIds, id];
    onCategoryChange(updated.join(","));
  };

  const toggleBrand = (id) => {
    const updated = selectedBrandIds.includes(id)
      ? selectedBrandIds.filter((x) => x !== id)
      : [...selectedBrandIds, id];
    onBrandChange(updated.join(","));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <h3 className="text-sm font-bold text-slate-900">Bộ lọc sản phẩm</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-52 pl-9 pr-8 py-1.5 text-[13px] rounded-lg border border-slate-200 text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); onSearchChange(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={onClear}
            className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4">
            <CheckboxGroup
              title="Chọn mức giá"
              options={PRICE_RANGES.map((r) => ({ value: `${r.min}-${r.max}`, label: r.label }))}
              selected={activePriceRange(priceMin, priceMax)}
              onChange={(val) => {
                const range = PRICE_RANGES.find((r) => `${r.min}-${r.max}` === val);
                if (range) {
                  const active = activePriceRange(priceMin, priceMax);
                  if (active.includes(val)) {
                    onPriceRangeChange("", "");
                  } else {
                    onPriceRangeChange(String(range.min), String(range.max));
                  }
                }
              }}
            />
            <CheckboxGroup
              title="Loại sản phẩm"
              options={(categories || []).map((c) => ({ value: String(c.id), label: c.name }))}
              selected={selectedCategoryIds}
              onChange={toggleCategory}
            />
            <CheckboxGroup
              title="Thương hiệu"
              options={(brands || []).map((b) => ({ value: String(b.id), label: b.name }))}
              selected={selectedBrandIds}
              onChange={toggleBrand}
            />
            <CheckboxGroup
              title="Size giày"
              options={SHOE_SIZES.map((s) => ({ value: s, label: s }))}
              selected={selectedAttrs("Size")}
              onChange={(val) => toggleAttr("Size", val)}
            />
            <CheckboxGroup
              title="Size quần áo"
              options={CLOTHING_SIZES.map((s) => ({ value: s, label: s }))}
              selected={selectedAttrs("Size")}
              onChange={(val) => toggleAttr("Size", val)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
