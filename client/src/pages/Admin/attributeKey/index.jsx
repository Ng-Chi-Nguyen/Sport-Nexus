import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { BtnActions } from "@/components/ui/button";
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
      <div className="table-retro">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-4">
                Tên thuộc tính
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Đơn vị
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Được sử dụng
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {attributes.length > 0 ? (
              attributes.map((attr, index) => (
                <tr key={attr.id || index}>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {attr.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Sử dụng class badge tối hệ thống */}
                    <Badge color="blue">{attr.unit || "Không có"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400">
                    20 sản phẩm
                  </td>
                  <td className="px-6 py-4">
                    {/* Thay cụm nút to bằng cụm icon tinh tế của GlassOS */}
                    <BtnActions
                      route={`/management/attribute-key/edit/${attr.id}`}
                      id={attr.id}
                      onDelete={() => openConfirm(attr.id, attr.name)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 text-center text-slate-500 italic"
                >
                  Không có thuộc tính nào
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
