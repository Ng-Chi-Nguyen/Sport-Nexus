import { useState, useEffect, useRef } from "react";
import { LayoutDashboard } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
// api
import supplierdApi from "@/api/management/supplierApi";
import Pagination from "@/components/ui/pagination";
//lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhà cung cấp", route: "#" },
];

const SupplierPage = () => {
  const response = useLoaderData();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentSearch = searchParams.get("search") || "";
  const currentProvince = searchParams.get("province") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleProvinceChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("province", value);
    else params.delete("province");
    setSearchParams(params);
  };

  const suppliers = response?.data?.supplier || [];
  const pagination = response?.data?.pagination || [];

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const openConfirm = (supplierId) => {
    setDeleteTarget(supplierId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await supplierdApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  const renderAddress = (locationData) => {
    if (!locationData)
      return <span className="text-slate-500 italic">Chưa cập nhật</span>;

    try {
      const loc =
        typeof locationData === "string"
          ? JSON.parse(locationData)
          : locationData;

      const addressParts = [loc.detail, loc.ward, loc.province].filter(Boolean);
      return addressParts.join(", ");
    } catch (error) {
      return <span className="text-rose-400">Lỗi định dạng địa chỉ</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <div className="w-[180px]">
          <SimpleSelect
            placeholder="Tất cả tỉnh/thành"
            value={currentProvince}
            onChange={(val) => handleProvinceChange(val)}
            options={[
              { slug: "", name: "Tất cả" },
              ...(response.provinces || []).map((p) => ({ slug: p, name: p })),
            ]}
          />
        </div>
        <BtnAdd
          route={"/management/suppliers/create"}
          name="Thêm nhà cung cấp"
        />
      </div>

      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-slate-100 tracking-wide mb-6">
          Danh sách nhà cung cấp
        </h2>

        {/* BẢNG CHUYỂN ĐỔI SANG LAYOUT 5 CỘT TÁCH BIỆT */}
        <div className="table-retro">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-4 w-[30%] !text-start">
                  Nhà cung cấp
                </th>
                <th scope="col" className="px-6 py-4 w-[25%] !text-start">
                  Địa chỉ
                </th>
                <th scope="col" className="px-6 py-4 w-[18%] !text-start">
                  Email liên hệ
                </th>
                <th scope="col" className="px-6 py-4 w-[15%] !text-start">
                  Số điện thoại
                </th>
                <th scope="col" className="px-6 py-4 w-[12%] text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    {/* CỘT 1: LOGO + TÊN + ĐẠI DIỆN */}
                    <td className="">
                      <div className="flex items-start gap-4">
                        {/* Khung ảnh Logo w-20 h-20 chuẩn lớn */}
                        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 p-1.5 flex items-center justify-center">
                          <img
                            src={
                              supplier.logo_url ||
                              "https://placehold.co/200x200/png?text=No+Logo"
                            }
                            alt={supplier.name}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Text thông tin cơ bản */}
                        <div className="min-w-0 flex-1 space-y-1.5 pt-1">
                          <p className="font-semibold text-slate-100 text-sm tracking-wide">
                            {supplier.name}
                          </p>
                          <p className="text-[12px] text-slate-400">
                            <span className="text-slate-500">Đại diện:</span>{" "}
                            <span className="text-green-300 font-medium">
                              {supplier.contact_person}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 2: ĐỊA CHỈ CHI TIẾT */}
                    <td
                      className=" text-slate-300 align-top"
                      title={renderAddress(supplier.location_data)}
                    >
                      <div className="line-clamp-3 whitespace-normal break-words text-xs leading-relaxed text-slate-400">
                        {renderAddress(supplier.location_data)}
                      </div>
                    </td>

                    {/* CỘT 3: EMAIL (Đã tách biệt) */}
                    <td className=" align-top  text-xs font-mono text-sky-400 break-all pr-4">
                      {supplier.email}
                    </td>

                    {/* CỘT 4: SỐ ĐIỆN THOẠI (Đã tách biệt) */}
                    <td className="align-top text-xs font-mono text-emerald-400 whitespace-nowrap">
                      {supplier.phone}
                    </td>

                    {/* CỘT 5: HÀNH ĐỘNG HỆ THỐNG */}
                    <td className=" text-center align-top">
                      <BtnActions
                        route={`/management/suppliers/edit/${supplier.id}`}
                        id={supplier.id}
                        onDelete={() => openConfirm(supplier.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    Không có nhà cung cấp nào được tìm thấy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa nhà cung cấp"
          message="Bạn đang thực hiện xóa nhà cung cấp này khỏi hệ thống."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />

        <div className="mt-6">
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplierPage;
