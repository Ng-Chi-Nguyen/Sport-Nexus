import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnSubmit, BtnGoback } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { FloatingInput, InputFile } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/select";
import brandApi from "@/api/management/brandApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

    const fromData = new FormData();
    fromData.append("name", name);
    fromData.append("origin", selectedOrigin);
    if (logo instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      fromData.append("logo", logo);
    }

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of fromData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      const response = await brandApi.create(fromData);
      if (response.success) {
        toast.success("Thêm thương hiệu thành công!");
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
      <div className="">
        <h2>Thêm thương hiệu</h2>
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
            <div className="flex gap-5 ml-3 mt-4">
              <BtnGoback />
              <BtnSubmit name="Thêm" />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateBrandPage;
