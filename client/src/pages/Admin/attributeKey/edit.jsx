import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import attributeKeyApi from "@/api/core/attributrKeyApi";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";
import { useLoaderData, useNavigate } from "react-router-dom";
import { TitleManagement } from "@/components/ui/title";

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
    route: "/management/attribute-key/",
  },
  {
    title: "Chỉnh sữa",
    route: "",
  },
];

const EditAttributeKey = () => {
  const responseOld = useLoaderData();
  // console.log(response.data);
  const navigate = useNavigate();
  const [name, setName] = useState(responseOld.data.name);
  const [unit, setUnit] = useState(responseOld.data.unit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("unit", unit);
    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");
    try {
      const response = await attributeKeyApi.update(
        responseOld.data.id,
        formData,
      );
      // console.log(response);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 w-fit border border-gray-200 p-3 rounded-[5px]"
      >
        <TitleManagement color="blue">Thông tin tuộc tính</TitleManagement>
        <div className="flex gap-2">
          <FloatingInput
            label="Tên thuộc tính"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingInput
            label="Đơn vị"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="ml-auto mr-auto">
          <Submit_GoBack />
        </div>
      </form>
    </>
  );
};

export default EditAttributeKey;
