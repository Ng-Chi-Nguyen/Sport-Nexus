import { useLoaderData, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import FilterBar from "./components/FilterSidebar";
import { ProductCard } from "@/components/ui/card";
import Pagination from "@/components/ui/pagination";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SimpleSelect } from "@/components/ui/select";
import { SORT_OPTIONS as PRODUCT_SORT_OPTIONS } from "@/constants/product";
import { useTranslation } from "react-i18next";

const ProductsPage = () => {
  const { t } = useTranslation();
  const responses = useLoaderData() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const products = responses?.products || [];
  const categories = responses?.categories || [];
  const brands = responses?.brands || [];
  const pagination = responses?.pagination || { totalPages: 1, currentPage: 1 };

  const SORT_OPTIONS = PRODUCT_SORT_OPTIONS.map((opt) => ({
    slug: opt.slug,
    name: t(opt.labelKey),
  }));

  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentCategoryIds = searchParams.get("category_ids") || "";
  const currentBrandIds = searchParams.get("brand_ids") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";
  const currentAttrFilter = searchParams.get("attr_filter") || "";

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sort", "newest");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePriceRangeChange = (min, max) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (min) params.set("price_min", min);
    else params.delete("price_min");
    if (max) params.set("price_max", max);
    else params.delete("price_max");
    setSearchParams(params);
  };

  const handleAttrFilterChange = (val) => {
    setFilter("attr_filter", val);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 mt-12">
          <Breadcrumbs
            data={[
              { title: t("breadcrumb_home"), route: "/" },
              { title: t("breadcrumb_filter"), route: "" },
            ]}
          />
        </div>

        <div className="mb-5">
          <FilterBar
            search={currentSearch}
            categoryIds={currentCategoryIds}
            brandIds={currentBrandIds}
            priceMin={currentPriceMin}
            priceMax={currentPriceMax}
            attrFilter={currentAttrFilter}
            categories={categories}
            brands={brands}
            onSearchChange={(val) => setFilter("search", val)}
            onCategoryChange={(val) => setFilter("category_ids", val)}
            onBrandChange={(val) => setFilter("brand_ids", val)}
            onPriceRangeChange={handlePriceRangeChange}
            onAttrFilterChange={handleAttrFilterChange}
            onClear={clearAllFilters}
          />
        </div>

        {/* ĐÃ TỐI ƯU MOBILE: Chuyển flex ngang thành flex-col trên màn hình nhỏ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("results_count", {
              count: products.length,
              total: pagination.totalItems || 0,
            })}
          </p>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              {t("sort_label")}
            </label>
            <div className="w-40 sm:w-44">
              <SimpleSelect
                options={SORT_OPTIONS}
                value={currentSort}
                onChange={(val) => setFilter("sort", val)}
              />
            </div>
          </div>
        </div>

        {(currentSearch ||
          currentCategoryIds ||
          currentBrandIds ||
          currentPriceMin ||
          currentAttrFilter) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
              {t("active_filters_label")}
            </span>
            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 px-3 py-1 font-medium shadow-sm rounded-md">
                Tìm: "{currentSearch}"
                <button
                  type="button"
                  onClick={() => setFilter("search", "")}
                  className="hover:text-sky-900 dark:hover:text-sky-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentCategoryIds && (
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 px-3 py-1 font-medium shadow-sm rounded-md">
                Danh mục ({currentCategoryIds.split(",").length})
                <button
                  type="button"
                  onClick={() => setFilter("category_ids", "")}
                  className="hover:text-sky-900 dark:hover:text-sky-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentBrandIds && (
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 px-3 py-1 font-medium shadow-sm rounded-md">
                Thương hiệu ({currentBrandIds.split(",").length})
                <button
                  type="button"
                  onClick={() => setFilter("brand_ids", "")}
                  className="hover:text-sky-900 dark:hover:text-sky-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentPriceMin && (
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 px-3 py-1 font-medium shadow-sm rounded-md">
                Giá: {Number(currentPriceMin).toLocaleString()}₫{" "}
                {currentPriceMax
                  ? `- ${Number(currentPriceMax).toLocaleString()}₫`
                  : "+"}
                <button
                  type="button"
                  onClick={() => handlePriceRangeChange("", "")}
                  className="hover:text-sky-900 dark:hover:text-sky-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {currentAttrFilter && (
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 px-3 py-1 font-medium shadow-sm rounded-md">
                Size ({(currentAttrFilter.match(/Size:/g) || []).length})
                <button
                  type="button"
                  onClick={() => handleAttrFilterChange("")}
                  className="hover:text-sky-900 dark:hover:text-sky-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 dark:text-slate-500 text-lg font-medium">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              variant="light"
              totalPages={pagination.totalPages}
              currentPage={pagination.currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
