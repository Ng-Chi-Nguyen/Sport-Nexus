import { useLoaderData, useSearchParams } from "react-router-dom";
import FilterSidebar from "./components/FilterSidebar";
import { ProductCard } from "@/components/ui/card";
import Pagination from "@/components/ui/pagination";

const ProductsPage = () => {
  const responses = useLoaderData() || {};
  const [searchParams, setSearchParams] = useSearchParams();

  const products = responses?.data?.products || [];
  const categories = responses?.data?.categories || [];
  const brands = responses?.data?.brands || [];
  const pagination = responses?.data?.pagination || { totalPages: 1, currentPage: 1 };

  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category_id") || "";
  const currentBrand = searchParams.get("brand_id") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

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

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="text-xs text-slate-400 flex items-center gap-1.5">
            <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
            <span>/</span>
            <span className="text-slate-700 font-medium">Sản phẩm</span>
          </nav>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <FilterSidebar
              search={currentSearch}
              sort={currentSort}
              categoryId={currentCategory}
              brandId={currentBrand}
              priceMin={currentPriceMin}
              priceMax={currentPriceMax}
              categories={categories}
              brands={brands}
              onSearchChange={(val) => setFilter("search", val)}
              onSortChange={(val) => setFilter("sort", val)}
              onCategoryChange={(val) => setFilter("category_id", val)}
              onBrandChange={(val) => setFilter("brand_id", val)}
              onPriceMinChange={(val) => setFilter("price_min", val)}
              onPriceMaxChange={(val) => setFilter("price_max", val)}
              onClear={clearAllFilters}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-semibold text-slate-700">{products.length}</span> /{" "}
                <span className="font-semibold text-slate-700">{pagination.totalItems || 0}</span> sản phẩm
              </p>
              {/* Mobile filter toggle */}
              <button
                onClick={() => document.getElementById("mobile-filters")?.classList.toggle("hidden")}
                className="lg:hidden text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Bộ lọc
              </button>
            </div>

            {/* Mobile filters */}
            <div id="mobile-filters" className="hidden mb-4 lg:hidden">
              <FilterSidebar
                search={currentSearch}
                sort={currentSort}
                categoryId={currentCategory}
                brandId={currentBrand}
                priceMin={currentPriceMin}
                priceMax={currentPriceMax}
                categories={categories}
                brands={brands}
                onSearchChange={(val) => setFilter("search", val)}
                onSortChange={(val) => setFilter("sort", val)}
                onCategoryChange={(val) => setFilter("category_id", val)}
                onBrandChange={(val) => setFilter("brand_id", val)}
                onPriceMinChange={(val) => setFilter("price_min", val)}
                onPriceMaxChange={(val) => setFilter("price_max", val)}
                onClear={clearAllFilters}
              />
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
                <p className="text-slate-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  totalPages={pagination.totalPages}
                  currentPage={pagination.currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
