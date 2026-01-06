import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import CustomCheckbox from "@/components/ui/ckeckbox";
import { Select } from "@/components/ui/select";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
// api
import userApi from "@/api/management/userApi";

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
    title: "Chỉnh sữa",
    route: "#",
  },
];

const roleOptions = [
  { slug: "admin", name: "Quản trị viên hệ thống" },
  { slug: "warehouse_manager", name: "Quản lý kho" },
  { slug: "purchasing_staffe", name: "Nhân viên nhập hàng" },
  { slug: "sales_staff", name: "Nhân viên bán hàng" },
  { slug: "customer", name: "Khách hàng" },
];

const EditUserPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();
  const user = response.data.user;

  //state value response
  const [name, setName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone_number);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [status, setStatus] = useState(user.status);
  const [avatar, setAvatar] = useState(user.avatar);
  const [selectedRole, setSelectedRole] = useState(user.role.slug);
  // ---------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Dùng FormData để tạo ra dữ liệu 'binary' (giống Postman)
    const data = new FormData();

    // 2. Append các trường văn bản
    data.append("full_name", name);
    data.append("email", email);
    data.append("phone_number", phone);
    data.append("status", status);
    data.append("is_verified", isVerified);
    data.append("slug", selectedRole);

    // 3. QUAN TRỌNG: Chỉ append nếu là File thật sự
    if (avatar instanceof File) {
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
      data.append("avatar", avatar);
    }

    // --- ĐOẠN LOG KIỂM TRA ---
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of data.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      const response = await userApi.update(user.id, data);
      if (response.success) {
        toast.success("Cập nhật thành công!");
        navigate(-1);
      }
    } catch (error) {
      // 1. Log để kiểm tra cấu trúc lỗi thực tế trong Console
      // console.log("Cấu trúc error nhận được:", error);

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
  // console.log(selectedRole);
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa người dùng</h2>
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
          </div>
          <div className="w-1/3">
            <p className="font-bold">Thông tin trạng thái & loại tài khoản</p>
            <div className="flex">
              <div className="flex flex-col flex-col-reverse m-3 w-2/5">
                <CustomCheckbox
                  label={isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  checked={isVerified} // Sử dụng checked để điều khiển trạng thái
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
              </div>
              <div className="flex flex-col flex-col-reverse m-3">
                <CustomCheckbox
                  label={status ? "Đang hoạt động" : "Đã khóa"}
                  checked={status} // Sử dụng checked để điều khiển trạng thái
                  onChange={(e) => setStatus(e.target.checked)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-8 mt-2">
                <Select
                  label="Loại tài khoản"
                  options={roleOptions}
                  value={selectedRole}
                  onChange={(val) => setSelectedRole(val)}
                  placeholder="Chọn chức vụ..."
                />

                <div className="flex gap-3 justify-center">
                  <div className="w-fit group flex flex-col flex-col-reverse">
                    <BtnGoback />
                  </div>
                  <div className="w-fit group flex flex-col flex-col-reverse">
                    <BtnSubmit name={"Sửa"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditUserPage;
