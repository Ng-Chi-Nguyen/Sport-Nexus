import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnGoback, BtnSubmit, BtnDelete } from "@/components/ui/button";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
// api
import brandApi from "@/api/management/brandApi";
import { queryClient } from "lib/react-query";

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
    route: "management/brands",
  },
  {
    title: "Sữa thương hiệu",
    route: "",
  },
];

const EditBrandPage = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  const brand = response.data;
  // state data response
  const [name, setName] = useState(brand.name);
  const [logo, setLogo] = useState(brand.logo);
  const [selectedOrigin, setSelectedOrigin] = useState(brand.origin);
  // starte delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  //   console.log(name);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fromData = new FormData();

    if (logo instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      fromData.append("logo", logo);
    }

    fromData.append("name", name);
    fromData.append("origin", selectedOrigin);

    try {
      const response = await brandApi.update(brand.id, fromData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["brands"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  const openConfirm = (name) => {
    setDeleteTarget(name);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await brandApi.delete(brand.id); // Gọi API xóa
      //   revalidator.revalidate(); // Cập nhật UI
      if (response.success) {
        setIsConfirmOpen(false); // Đóng modal
        await queryClient.invalidateQueries({ queryKey: ["brands"] });
        toast.success(response.message);
        navigate(-1);
      } else {
        toast.success(response.message);
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

  return (
    <div>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa thương hiệu</h2>
      <form
        onSubmit={handleSubmit}
        className="flex border border-gray-200 rounded-[10px] w-fit p-4 gap-3"
      >
        <div className="flex my-2 w-fit p-3 justify-center">
          <InputFile
            label="Logo thương hiệu"
            value={logo}
            onChange={(file) => setLogo(file)}
          />
        </div>
        <div className="flex flex-col w-fit mt-5">
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInput
              id="name"
              label="Tên thương hiệu"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-col-reverse m-3">
            <CountrySelect
              value={selectedOrigin}
              onChange={(val) => setSelectedOrigin(val)}
              label="Xuất xứ"
            />
          </div>
          <div className="flex items-center gap-5 ml-3 mt-4">
            <BtnGoback />
            <BtnSubmit name="Cập nhật" />
            <BtnDelete onClick={() => openConfirm(brand.name)} />
          </div>
        </div>
      </form>
      <ConfirmDelete
        isOpen={isConfirmOpen}
        title="Xóa thương hiệu"
        message={`Bạn đang thực hiện xóa thương hiệu "${deleteTarget}".`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default EditBrandPage;
