import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile } from "@/components/ui/input";
import { FloatingInput } from "@/components/ui/input";
import CustomCheckbox from "@/components/ui/ckeckbox";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
// api
import categoryApi from "@/api/management/categoryApi";
// lib
import { queryClient } from "@/lib/react-query";

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
    title: "Danh mục",
    route: "/management/categories",
  },
  {
    title: "Thêm mới",
    route: "",
  },
];
const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (image instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      formData.append("image", image);
    }
    formData.append("name", name);
    formData.append("is_active", isActive);

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      const response = await categoryApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
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
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm danh mục mới</h2>
      <form
        onSubmit={handleSubmit}
        className="flex items-center border border-gray-200 rounded-[10px] w-fit p-4 gap-3"
      >
        <InputFile
          label="Ảnh đại diện"
          value={image}
          onChange={(file) => setImage(file)}
        />
        <div className="flex flex-col gap-3 w-[500px]">
          <FloatingInput
            id="name"
            label="Tên danh mục"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <CustomCheckbox
            label={isActive ? "Ẩn danh mục" : "Hiện danh mục"}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <div className="flex gap-5 ml-3 mt-4">
            <BtnGoback />
            <BtnSubmit name="Thêm" />
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateCategoryPage;
