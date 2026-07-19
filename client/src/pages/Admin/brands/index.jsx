import { useMemo, useState, useEffect, useRef } from "react";
import { LayoutDashboard } from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { CountrySelect } from "@/components/ui/select";
import { CardBrand } from "@/components/ui/card";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { brands, pagination } = responses?.data || {};

  const currentOrigin = searchParams.get("origin") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasAllClear = currentSearch || currentOrigin;

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

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

  const handleOriginClick = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("origin", value);
    else params.delete("origin");
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & BỘ LỌC & NÚT THÊM - ĐÃ FIX KHÔNG BỊ ĐÈ */}
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm tên thương hiệu..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>

        <div className="w-[250px] shrink-0">
          <CountrySelect
            value={currentOrigin}
            onChange={(val) => handleOriginClick(val)}
            label="Xuất xứ"
          />
        </div>

        {hasAllClear && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="shrink-0 px-2.5 py-1.5 text-[10px] font-bold rounded border border-slate-800 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}

        <div className="shrink-0">
          <BtnAdd route={"/management/brands/create"} name="Thêm thương hiệu" />
        </div>
      </div>

      {/* CONTAINER TỐI GLASSOS */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
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
