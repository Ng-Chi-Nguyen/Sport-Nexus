import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInputPassword, FloatingInput } from "@/components/ui/input";
import { InputFile } from "@/components/ui/input";
// api
import userApi from "@/api/management/userApi";
import { Select } from "@/components/ui/select";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Người dùng",
    route: "/management/users",
  },
  {
    title: "Thêm khách hàng",
    route: "#",
  },
];

const roleOptions = [
  { slug: "admin", name: "Quản trị viên hệ thống" },
  { slug: "warehouse_manager", name: "Quản lý kho" },
  { slug: "purchasing_staff", name: "Nhân viên nhập hàng" },
  { slug: "sales_staff", name: "Nhân viên bán hàng" },
  { slug: "customer", name: "Khách hàng" },
];

const CreateUserPage = () => {
  const navigate = useNavigate();

  // state from
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  // --------------------

  // console.log(groupedPermissions);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (avatar instanceof File) formData.append("avatar", avatar);

    formData.append("full_name", name);
    formData.append("email", email);
    formData.append("phone_number", phone);
    formData.append("password", password);
    formData.append("slug", selectedRole);

    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // // Nếu là file, bạn sẽ thấy: avatar: File { name: "congnhan4.jpg", ... }
    // }
    try {
      const response = await userApi.create(formData);

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["users"] });
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
      <h2 className="mb-2">Thêm người dùng</h2>
      <form onSubmit={handleSubmit} className="flex my-2 gap-3">
        <div className="border border-gray-200 p-3 rounded-[5px]">
          <InputFile
            label="Ảnh đại diện"
            value={avatar} // Dùng avatar
            onChange={(file) => setAvatar(file)} // Cập nhật vào avatar
          />
        </div>
        <div className="w-1/3 border border-gray-200 rounded-[10px] p-3">
          <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin cơ bản
          </h3>
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInput
              id="full_name"
              label="Họ tên"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInput
              id="email"
              label="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInput
              id="phone_number"
              label="Số điện thoại"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-col-reverse m-3">
            <FloatingInputPassword
              id="Password"
              label="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="w-1/3 border border-gray-200 rounded-[10px] p-3">
          <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span>Thông tin trạng thái &
            loại tài khoản
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-8 mt-3">
              <Select
                label="Loại tài khoản"
                options={roleOptions}
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
                placeholder="Chọn chức vụ..."
              />

              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateUserPage;
