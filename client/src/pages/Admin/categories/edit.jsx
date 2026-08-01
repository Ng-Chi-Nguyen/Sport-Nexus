import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { Submit_GoBack } from "@/components/ui/button";
import { TitleManagement } from "@/components/ui/title";
// api
import categoryApi from "@/api/management/categoryApi";
// lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={18} strokeWidth={1.5} />,
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
    title: "Chỉnh sửa",
    route: "",
  },
];

const EditCategoryPage = () => {
  const responseOld = useLoaderData();
  const navigate = useNavigate();
  const [image, setImage] = useState(responseOld.data.image);
  const [name, setName] = useState(responseOld.data.name);
  const [isActive, setIsActive] = useState(responseOld.data.is_active);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (image instanceof File) {
      formData.append("image", image);
    }
    formData.append("name", name);
    formData.append("is_active", isActive);

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
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        Chỉnh sửa loại hàng #{responseOld.data.id}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-4xl"
      >
        {/* CARD: ẢNH ĐẠI DIỆN */}
        <div className="w-full lg:w-[40%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <TitleManagement color="cyan">Ảnh đại diện</TitleManagement>
          <div className="mt-3">
            <InputFile value={image} onChange={(file) => setImage(file)} />
          </div>
        </div>

        {/* CARD: THÔNG TIN DANH MỤC */}
        <div className="w-full lg:w-[60%] rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
          <h3 className="font-bold text-xs uppercase border-b pb-2 mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
            <span className="w-2 h-4 rounded-sm bg-sky-500"></span> Thông tin
            danh mục
          </h3>

          <div className="space-y-4">
            <FloatingInput
              id="name"
              label="Tên danh mục"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="p-3 rounded-lg border transition-colors duration-200 bg-slate-50 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800">
              <AnimatedCheckbox
                id="isActive"
                label={isActive ? "Hiện danh mục" : "Ẩn danh mục"}
                checked={isActive}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <Submit_GoBack name="Cập nhật" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryPage;
