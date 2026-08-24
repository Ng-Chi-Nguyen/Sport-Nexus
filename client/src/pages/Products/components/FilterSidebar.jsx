import { useState, useEffect } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { PRICE_RANGES, SHOE_SIZES, CLOTHING_SIZES } from "@/constants/product";
import { useTranslation } from "react-i18next";

// 1. CẬP NHẬT CHECKBOX GROUP: Tự động tràn viền (w-full) trên Mobile, nằm ngang trên PC
const CheckboxGroup = ({ title, options, selected, onChange }) => (
  <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md p-4 w-full sm:w-[calc(50%-8px)] lg:flex-1 lg:min-w-[180px] transition-colors duration-200 rounded-lg">
    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
      {title}
    </h4>
    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
      {options.map((opt) => {
        const isChecked = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            className="flex items-center gap-2.5 cursor-pointer group py-0.5"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-sky-600 dark:text-sky-500 focus:ring-sky-500 focus:ring-offset-0 cursor-pointer bg-slate-50 dark:bg-slate-800"
            />
            <span className="text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

const activePriceRange = (priceMin, priceMax) => {
  if (!priceMin && !priceMax) return [];
  const match = PRICE_RANGES.find(
    (r) =>
      String(priceMin) === String(r.min) && String(priceMax) === String(r.max),
  );
  return match ? [`${match.min}-${match.max}`] : [];
};

const FilterBar = ({
  search,
  categoryIds,
  brandIds,
  priceMin,
  priceMax,
  attrFilter,
  categories,
  brands,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onAttrFilterChange,
  onClear,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [searchInput, setSearchInput] = useState(search || "");
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search || "");
  }, [search]);

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

  const hasFilters =
    search || categoryIds || brandIds || priceMin || priceMax || attrFilter;

  const selectedCategoryIds = categoryIds
    ? categoryIds.split(",").filter(Boolean)
    : [];
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
    <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200 text-slate-800 dark:text-slate-100 mb-6 rounded-lg overflow-hidden">
      {/* 2. CẬP NHẬT HEADER CỦA FILTER: Đẩy thanh Search xuống dòng trên Mobile bằng flex-col */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3 md:gap-0">
        {/* Phần Tiêu đề & Nút xóa lọc (Mobile) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer p-1 -ml-1 rounded-md"
            >
              {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {/* Thêm whitespace-nowrap để chữ không bao giờ bị rớt dòng */}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {t("filter_heading", "BỘ LỌC SẢN PHẨM")}
            </h3>
          </div>

          {/* Nút Xóa Lọc chỉ hiện trên Mobile ở vị trí này */}
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="md:hidden text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 px-2.5 py-1.5 transition-colors cursor-pointer shadow-sm rounded-md"
            >
              {t("clear_filter_btn", "Xóa lọc")}
            </button>
          )}
        </div>

        {/* Phần Tìm kiếm & Nút xóa lọc (PC) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            {/* Thêm w-full để input search kéo giãn hết màn hình đt */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder={t("search_placeholder", "Tìm trong kết quả...")}
              className="w-full md:w-64 pl-9 pr-8 py-2 md:py-1.5 text-[13px] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#111827]/40 outline-none focus:border-sky-500 dark:focus:border-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors shadow-sm rounded-md"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onSearchChange("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Nút Xóa Lọc chỉ hiện trên PC ở vị trí này */}
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="hidden md:block text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 px-3.5 py-1.5 transition-colors cursor-pointer shadow-sm rounded-md"
            >
              {t("clear_filter_btn")}
            </button>
          )}
        </div>
      </div>

      {/* 3. CẬP NHẬT BODY CỦA FILTER: Đổi từ cuộn ngang (overflow-x-auto) sang xếp hình khối (flex-wrap) */}
      {open && (
        <div className="p-4 bg-slate-50/50 dark:bg-transparent">
          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-4">
            <CheckboxGroup
              title={t("price_range_title", "CHỌN MỨC GIÁ")}
              options={PRICE_RANGES.map((r) => ({
                value: `${r.min}-${r.max}`,
                label: t(r.labelKey),
              }))}
              selected={activePriceRange(priceMin, priceMax)}
              onChange={(val) => {
                const range = PRICE_RANGES.find(
                  (r) => `${r.min}-${r.max}` === val,
                );
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
              title={t("category_title", "LOẠI SẢN PHẨM")}
              options={(categories || []).map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
              selected={selectedCategoryIds}
              onChange={toggleCategory}
            />
            <CheckboxGroup
              title={t("brand_title", "THƯƠNG HIỆU")}
              options={(brands || []).map((b) => ({
                value: String(b.id),
                label: b.name,
              }))}
              selected={selectedBrandIds}
              onChange={toggleBrand}
            />
            <CheckboxGroup
              title={t("size_shoes_title", "SIZE GIÀY")}
              options={SHOE_SIZES.map((s) => ({ value: s, label: s }))}
              selected={selectedAttrs("Size")}
              onChange={(val) => toggleAttr("Size", val)}
            />
            <CheckboxGroup
              title={t("size_clothing_title", "SIZE QUẦN ÁO")}
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
