import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/select";
import { CardBrand } from "@/components/ui/card";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";
import Pagination from "@/components/ui/pagination";

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

      {/* CONTAINER TỐI GLASSOS */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="section-title">
          Danh sách thương hiệu
        </h2>

        {/* GRID THƯƠNG HIỆU */}
        {allBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {allBrands.map((brand, index) => (
              <Link
                to={`/management/brands/edit/${brand.id}`}
                key={brand.id || brand._id || index}
                className="block hover:scale-[1.015] active:scale-[0.985] transition-transform duration-200"
              >
                <CardBrand data={brand} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 italic text-sm">
            Không tìm thấy thương hiệu nào trên hệ thống.
          </div>
        )}

        {/* PHÂN TRANG */}
        <div className="mt-6 border-t border-white/5 pt-4">
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
