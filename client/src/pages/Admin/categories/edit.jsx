import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { CustomCheckbox } from "@/components/ui/ckeckbox";
// api
import categoryApi from "@/api/management/categoryApi";
// lib
import { queryClient } from "@/lib/react-query";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { Submit_GoBack } from "@/components/ui/button";

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
    title: "Chỉnh sữa",
    route: "",
  },
];
const EditCategoryPage = () => {
  const responseOld = useLoaderData();
  const navigate = useNavigate();
  const [image, setImage] = useState(responseOld.data.image);
  const [name, setName] = useState(responseOld.data.name);
  const [isActive, setIsActive] = useState(responseOld.data.is_active);
  //   console.log(responseOld);

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
      const response = await categoryApi.update(responseOld.data.id, formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
  };

  const handleStatusChange = (checkedValue) => {
    setIsActive(checkedValue);
    // console.log(isActive);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa loại hàng</h2>
      <form
        onSubmit={handleSubmit}
        className="flex items-start border border-gray-200 rounded-[10px] w-fit p-4 gap-3 mt-2"
      >
        <div className="border border-gray-200 rounded-[5px] p-3">
          <InputFile
            label="Ảnh đại diện"
            value={image}
            onChange={(file) => setImage(file)}
          />
        </div>
        <div className="flex flex-col gap-3 border border-gray-200 rounded-[5px] p-3">
          <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin danh mục
          </h3>
          <FloatingInput
            id="name"
            label="Tên danh mục"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="border border-blue-200 w-[80%] p-2 m-2 rounded-[5px]">
            <AnimatedCheckbox
              id="isActive"
              label={isActive ? "Hiện danh mục" : "Ẩn danh mục"}
              checked={isActive}
              onChange={(e) => handleStatusChange(e.target.checked)}
            />
          </div>
          <Submit_GoBack />
        </div>
      </form>
    </>
  );
};

export default EditCategoryPage;
