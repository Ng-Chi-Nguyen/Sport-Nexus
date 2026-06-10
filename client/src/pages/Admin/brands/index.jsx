import { useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
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

  const paginationInfo = pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allBrands = useMemo(() => {
    if (!brands) return [];
    return Array.isArray(brands) ? brands : Object.values(brands).flat();
  }, [brands]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm tên thương hiệu..." />
        </div>
        <BtnAdd route={"/management/brands/create"} name="Thêm thương hiệu" />
      </div>

      {/* CONTAINER TỐI GLASSOS */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách thương hiệu
        </h2>

        {/* ĐÃ FIX GRID: Thay đổi từ 6 cột dọc sang 1, 2, và tối đa 3 cột ngang cực rộng rãi */}
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
