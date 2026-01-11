import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react"; // Import thêm icon để thao tác
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import Badge from "@/components/ui/badge";
import { useState } from "react";
import { ConfirmDelete } from "@/components/ui/confirm";
import attributeKeyApi from "@/api/core/attributrKeyApi";
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
    title: "Thuộc tính sản phẩm",
    route: "",
  },
];

const AttributeKey = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: "",
    name: "",
  });
  // Truy xuất đúng mảng attribute từ object lồng nhau của bạn
  const attributes = responses?.data?.attribute || [];

  const openConfirm = (productId, name) => {
    // console.log(productId);
    // console.log(name);
    setDeleteTarget({
      id: productId,
      name: name,
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await attributeKeyApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
        revalidator.revalidate(); // Cập nhật UI
        toast.success(response.message);
        setIsConfirmOpen(false); // Đóng modal
      }
      revalidator.revalidate(); // Cập nhật UI
      setIsConfirmOpen(false); // Đóng modal
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

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* Header Actions */}
      <div className="flex items-center gap-4 rounded-xl">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm tên thuộc tính..." />
        </div>
        <BtnAdd
          route={"/management/attribute-key/create"}
          className="w-[200px]"
          name="Thêm thuộc tính"
        />
      </div>
      <h2>Danh sách thuộc tính</h2>
      <div className="relative bg-white table-retro">
        <table className="w-full text-sm text-left text-[#323232]">
          <thead className="text-sm uppercase bg-primary border-b-2 border-[#323232]">
            <tr>
              <th scope="col" className="px-6 py-4 font-black">
                Tên thuộc tính
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Đơn vị
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Được sữ dụng
              </th>
              <th scope="col" className="px-6 py-4 font-black text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {attributes.length > 0 ? (
              attributes.map((attr, index) => (
                <tr
                  key={attr.id || index}
                  className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-bold text-[#323232] whitespace-nowrap">
                    {attr.name}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-400 text-[12px]">
                    <Badge color="blue">{attr.unit || "Không có"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-[12px]">
                    20 sản phẩm
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-center">
                      <BtnEdit
                        route={`/management/attribute-key/edit/${attr.id}`}
                        name="Sửa"
                      />
                      <BtnDelete
                        name="Xóa"
                        onClick={() => openConfirm(attr.id, attr.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-3 text-center text-gray-400 italic"
                >
                  Không có quyền nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        totalPages={paginationInfo.totalPages}
        currentPage={paginationInfo.currentPage}
        onPageChange={handlePageChange}
      />
      <ConfirmDelete
        isOpen={isConfirmOpen}
        title="Xóa thuộc tính"
        message={`Bạn đang thực hiện xóa thuộc tính "${deleteTarget.name}".`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default AttributeKey;
