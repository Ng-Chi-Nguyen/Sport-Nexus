import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInputPassword, FloatingInput } from "@/components/ui/input";
import { InputFile } from "@/components/ui/input";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
// api
import userApi from "@/api/management/userApi";
import { Select } from "@/components/ui/select";

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
        toast.success("Thêm người dùng thành công!");
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
        <h2 className="mb-2">Thêm người dùng</h2>
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-[10px]"
        >
          <div className="flex my-2">
            <div className="flex my-2 w-1/4 p-3 justify-center">
              <InputFile
                label="Ảnh đại diện"
                value={avatar} // Dùng avatar
                onChange={(file) => setAvatar(file)} // Cập nhật vào avatar
              />
            </div>
            <div className="w-1/3">
              <div className="flex flex-col pl-3">
                <p className="font-bold">Thông tin cơ bản</p>
              </div>
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
            <div className="w-1/3">
              <p className="font-bold">Thông tin trạng thái & loại tài khoản</p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-8 mt-3">
                  <Select
                    label="Loại tài khoản"
                    options={roleOptions}
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val)}
                    placeholder="Chọn chức vụ..."
                  />

                  <div className="flex gap-3 justify-center">
                    <div className="w-fit group flex flex-col flex-col-reverse">
                      <BtnSubmit name={"Thêm"} />
                    </div>
                    <div className="w-fit group flex flex-col flex-col-reverse">
                      <BtnGoback />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateUserPage;
