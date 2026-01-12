import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput, InputFile } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/select";
// api
import brandApi from "@/api/management/brandApi";
// lib
import { queryClient } from "@/lib/react-query";
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
    title: "Thương hiệu",
    route: "management/brands",
  },
  {
    title: "Thêm thương hiệu",
    route: "",
  },
];

const CreateBrandPage = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState(null);
  const [name, setName] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log(name);
    // console.log(logo);
    // console.log(name);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("origin", selectedOrigin);
    if (logo instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      formData.append("logo", logo);
    }

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      const response = await brandApi.create(formData);
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

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm mới thương hiệu</h2>
      <form onSubmit={handleSubmit} className="flex w-fit p-4 gap-3">
        <div className="border border-gray-200 p-3 rounded-[5px]">
          <InputFile
            label="Logo thương hiệu"
            value={logo}
            onChange={(file) => setLogo(file)}
          />
        </div>
        <div className="border border-gray-200 p-3 rounded-[5px]">
          <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin thương hiệu
          </h3>
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInput
              id="name"
              label="Tên thương hiệu"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-col-reverse m-3 mb-10">
            <CountrySelect
              value={selectedOrigin}
              onChange={(val) => setSelectedOrigin(val)}
              label="Xuất xứ"
            />
          </div>
          <Submit_GoBack />
        </div>
      </form>
    </>
  );
};

export default CreateBrandPage;
