import { useMemo } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/select";
import { CardBrand } from "@/components/ui/card";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={18} strokeWidth={1.5} />,
    route: "",
  },
  { title: "Quản lý sản phẩm & kho", route: "" },
  { title: "Thương hiệu", route: "" },
];

const BrandPage = () => {
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  const { brands, pagination } = responses?.data || {};
  const {
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
    searchParams,
    setSearchParams,
  } = useTableFilters();

  const paginationInfo = pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allBrands = useMemo(() => {
    if (!brands) return [];
    return Array.isArray(brands) ? brands : Object.values(brands).flat();
  }, [brands]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder="Tìm kiếm tên thương hiệu..."
        addButton={
          <BtnAdd route={"/management/brands/create"} name="Thêm thương hiệu" />
        }
      >
        <div>
          <CountrySelect
            value={searchParams.get("origin") || ""}
            onChange={(val) => setFilter("origin", val)}
          />
        </div>
      </FilterPanel>

      <div className="bg-[#0D121F]/30 border border-slate-900/80 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center gap-3 mb-6 justify-between">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
            Danh sách thương hiệu
          </h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải lại"
          >
            <RefreshCw size={18} className={revalidator.state === "loading" ? "animate-spin" : ""} />
          </button>
          <div>
            {allBrands.length > 0 && (
              <Badge>{pagination.totalItems || 0} thương hiệu</Badge>
            )}
          </div>
        </div>

        {allBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allBrands.map((brand, index) => (
              <Link
                to={`/management/brands/edit/${brand.id}`}
                key={brand.id || brand._id || index}
              >
                <CardBrand data={brand} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4 opacity-30">🏷️</div>
            <p className="text-slate-500 italic text-sm">
              Không tìm thấy thương hiệu nào trên hệ thống.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-white/[0.03] pt-4">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
