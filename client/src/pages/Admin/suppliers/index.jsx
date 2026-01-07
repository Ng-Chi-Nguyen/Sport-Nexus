import { LayoutDashboard, Menu, X } from "lucide-react";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom"; // Thêm useNavigate nếu cần
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { useState } from "react";
import Badge from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm";
import supplierdApi from "@/api/management/supplierApi";
import { toast } from "sonner";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhà cung cấp", route: "#" },
];

const SupplierPage = () => {
  const response = useLoaderData();
  const revalidator = useRevalidator();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const suppliers = response?.data?.supplier || [];

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const openConfirm = (supplierId) => {
    setDeleteTarget(supplierId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await supplierdApi.delete(deleteTarget); // Gọi API xóa
      if (response.success) {
        revalidator.revalidate(); // Cập nhật UI
        toast.success(response.message);
        setIsConfirmOpen(false); // Đóng modal
      }
    } catch (error) {
      // 1. Log để kiểm tra cấu trúc lỗi thực tế trong Console
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      // 2. Lấy thông báo lỗi linh hoạt
      // Nếu có Interceptor: dùng error.message
      // Nếu không có Interceptor: dùng error.response?.data?.message
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  // 1. Hàm hỗ trợ định dạng địa chỉ từ JSON
  const renderAddress = (locationData) => {
    if (!locationData)
      return <span className="text-gray-400 italic">Chưa cập nhật</span>;

    try {
      // Parse nếu là chuỗi, nếu là object rồi thì dùng luôn
      const loc =
        typeof locationData === "string"
          ? JSON.parse(locationData)
          : locationData;

      // Nối các trường lại, loại bỏ các trường trống
      const addressParts = [loc.detail, loc.ward, loc.province].filter(Boolean);
      return addressParts.join(", ");
    } catch (error) {
      return <span className="text-red-400">Lỗi định dạng địa chỉ</span>;
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm nhà cung cấp..." />
        </div>
        <BtnAdd
          route={"/management/suppliers/create"}
          className="w-[30%]"
          name="Thêm nhà cung cấp"
        />
      </div>

      <div className="relative mt-4 bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-[5px]">
        <table className="w-full text-sm text-left text-[#323232]">
          <thead className="text-sm uppercase bg-primary border-b-2 text-[#fff] border-[#323232]">
            <tr>
              <th className="px-6 py-4 font-black text-center">Logo</th>
              <th className="px-6 py-4 font-black text-center">Tên NCC</th>
              <th className="px-6 py-4 font-black text-center">Liên hệ</th>
              <th className="px-6 py-4 font-black text-center">Đại diện</th>
              <th className="px-6 py-4 font-black text-center">Địa chỉ</th>
              <th className="px-6 py-4 font-black text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 flex justify-center">
                    <div className="w-12 h-12 border border-gray-200 rounded overflow-hidden bg-gray-50">
                      <img
                        src={
                          supplier.logo_url ||
                          "https://placehold.co/200x200/png?text=No+Logo"
                        }
                        alt={supplier.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-center">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        {supplier.email}
                      </span>
                      <Badge color="pink">{supplier.phone}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {supplier.contact_person}
                  </td>

                  {/* 2. HIỂN THỊ ĐỊA CHỈ ĐÃ ĐỊNH DẠNG */}
                  <td
                    className="px-6 py-4  max-w-[400px]" // 1. Đặt Max-width tùy chọn (ví dụ 350px)
                    title={renderAddress(supplier.location_data)}
                  >
                    <div className="line-clamp-3 whitespace-normal break-words text-sm">
                      {/* 2. Dùng line-clamp-3 để giới hạn 3 dòng và hiện '...' */}
                      {renderAddress(supplier.location_data)}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center relative">
                    <div className="flex justify-center items-center">
                      {/* MENU NỔI */}
                      <div
                        className={`absolute right-[70%] top-1/2 -translate-y-1/2 z-50 flex gap-2 items-center transition-all duration-300 ${
                          openMenuId === supplier.id
                            ? "opacity-100 visible translate-x-0"
                            : "opacity-0 invisible translate-x-4 pointer-events-none"
                        }`}
                      >
                        <div className="flex gap-2 p-1.5 bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-md">
                          <BtnEdit
                            route={`/management/suppliers/edit/${supplier.id}`}
                            name="Sửa"
                          />
                          <BtnDelete
                            name="Xóa"
                            onClick={() => openConfirm(supplier.id)}
                          />
                          <div className="absolute top-1/2 -right-[9px] -translate-y-1/2 w-4 h-4 bg-white border-r-2 border-t-2 border-[#323232] rotate-45 z-[-1]"></div>
                        </div>
                      </div>

                      {/* NÚT TOGGLE */}
                      <button
                        onClick={() => toggleMenu(supplier.id)}
                        className={`p-2 rounded-md border-2 border-[#323232] transition-all duration-200 ${
                          openMenuId === supplier.id
                            ? "bg-[#ff5252] text-white shadow-none"
                            : "bg-white text-[#323232] shadow-[3px_3px_0px_0px_#323232] hover:bg-[#4facf3] hover:text-white"
                        }`}
                      >
                        {openMenuId === supplier.id ? (
                          <X size={18} />
                        ) : (
                          <Menu size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  Không có nhà cung cấp nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title="Xóa nhà cung cấp"
          message={`Bạn đang thực hiện xóa nhà cung cấp".`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default SupplierPage;
