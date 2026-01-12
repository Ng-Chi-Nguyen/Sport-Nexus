import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { CustomCheckbox } from "@/components/ui/ckeckbox";
import { Select } from "@/components/ui/select";
// api
import userApi from "@/api/management/userApi";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";

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
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(response.message);
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

  const handleStatusChange = (checkedValue) => {
    setStatus(checkedValue);
    // console.log(isActive);
  };

  const handleVerifiedChange = (checkedValue) => {
    setIsVerified(checkedValue);
    // console.log(isActive);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2>Chỉnh sữa người dùng</h2>
      <form onSubmit={handleSubmit} className="flex my-2 gap-3">
        <div className="border border-gray-200 p-3 rounded-[5px]">
          <InputFile
            label="Ảnh đại diện"
            value={avatar} // Dùng avatar
            onChange={(file) => setAvatar(file)} // Cập nhật vào avatar
          />
        </div>
        <div className="w-1/3 border border-gray-200 p-3 rounded-[5px]">
          <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
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
        </div>
        <div className="w-1/3 border border-gray-200 rounded-[10px] p-3">
          <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span>Thông tin trạng thái &
            loại tài khoản
          </h3>
          <div className="flex">
            <div className="border border-gray-200 p-2 m-2 w-1/2 rounded-[5px]">
              <AnimatedCheckbox
                id="is_verified_checkbox"
                label={isVerified ? "Đã xác thực" : "Chưa xác thực"}
                checked={isVerified}
                onChange={(e) => handleVerifiedChange(e.target.checked)}
              />
            </div>
            <div className="border border-gray-200 p-2 w-1/2 m-2 rounded-[5px] flex items-center">
              <AnimatedCheckbox
                id="is_active_checkbox"
                label={status ? "Đang hoạt động" : "Đã khóa"}
                checked={status}
                onChange={(e) => handleStatusChange(e.target.checked)}
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

              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditUserPage;
