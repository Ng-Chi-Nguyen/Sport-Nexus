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
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý sản phẩm & kho",
    route: "",
  },
  {
    title: "Thương hiệu",
    route: "",
  },
];

const BrandPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { brands, pagination } = responses?.data || {};
  // console.log("1. Toàn bộ Response:", responses);
  // console.log("2. Danh sách Brands:", brands);
  // console.log("3. Phân trang:", pagination);

  const paginationInfo = pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const allBrands = useMemo(() => {
    if (!brands) return [];
    // Làm phẳng mảng users để render 6 dòng
    return Object.values(brands).flat();
  }, [brands]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <SearchTable placeholder="Tìm kiếm quyền hạn..." />
          </div>
          <BtnAdd
            route={"/management/brands/create"}
            className="w-[30%]"
            name="Thêm thương hiệu"
          />
        </div>
        <h2 className="mt-2">Danh sách thương hiệu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {allBrands && brands.length > 0 ? (
            allBrands.map((brand, index) => (
              <Link
                to={`/management/brands/edit/${brand.id}`}
                key={brand._id || index}
              >
                <CardBrand data={brand} />
              </Link>
            ))
          ) : (
            <p className="text-gray-500 italic">
              Không tìm thấy thương hiệu nào.
            </p>
          )}
        </div>
        <div className="py-4 border-t-2 border-[#323232] bg-[#f8f9fa]">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default BrandPage;
