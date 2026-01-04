import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import {
  InputFile,
  FloatingInputPassword,
  FloatingInput,
} from "@/components/ui/input";
import CustomCheckbox from "@/components/ui/ckeckbox";
import Select from "@/components/ui/select";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
// utils
// api
import userApi from "@/api/management/userApi";
import { toast } from "sonner";

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

// const moduleLabels = {
//   users: "👤 Quản lý Người dùng",
//   roles: "🔑 Vai trò & Phân quyền",
//   permissions: "🛡️ Danh mục Quyền hạn",
//   products: "📦 Sản phẩm",
//   categories: "📂 Danh mục Sản phẩm",
//   brands: "🏷️ Thương hiệu",
//   orders: "🛒 Đơn hàng",
//   coupons: "🎟️ Mã giảm giá",
//   suppliers: "🏭 Nhà cung cấp",
//   purchaseorders: "📝 Đơn nhập hàng",
//   stockmovements: "📉 Biến động kho",
//   reviews: "⭐ Đánh giá khách hàng",
//   systemlogs: "📋 Nhật ký hệ thống",
// };

// const actionOptions = [
//   { slug: "create", name: "✨ Thêm mới (Create)" },
//   { slug: "read", name: "👁️ Xem dữ liệu (Read)" },
//   { slug: "update", name: "📝 Chỉnh sửa (Update)" },
//   { slug: "delete", name: "🗑️ Xóa dữ liệu (Delete)" },
// ];

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
      // 4. Gọi API - Phải truyền nguyên cục 'data' (FormData)
      // Và phải đảm bảo headers là 'multipart/form-data'
      const response = await userApi.update(user.id, data);
      if (response.success) {
        toast.success("Cập nhật thành công!");
        navigate(-1);
      }
    } catch (error) {
      console.log("Lỗi trả về:", error.response?.data);
      // Nếu Joi vẫn báo 'must be a string', xem giải thích bên dưới
      toast.error(error.response?.data?.errors?.[0]);
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
                    <BtnSubmit name={"Sửa"} />
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
      {/* <h2 className="my-4">Chỉnh sữa & cấp quyền</h2>
      <div className="flex gap-4">
        <div className="relative w-fit group flex flex-col flex-col-reverse">
          <div className="w-full">
            <Select
              label="Áp dụng cho bảng"
              options={moduleLabels}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder="Chọn chức vụ..."
            />
          </div>
        </div>
        <div className="relative w-fit group flex flex-col flex-col-reverse">
          <div className="w-full">
            <Select
              label="Hành động"
              options={actionOptions}
              value={selectedAction}
              onChange={(val) => setSelectedAction(val)}
              placeholder="Chọn chức vụ..."
            />
          </div>
        </div>
      </div> */}
    </>
  );
};

export default EditUserPage;
