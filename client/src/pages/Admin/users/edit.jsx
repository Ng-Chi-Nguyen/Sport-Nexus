import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFile, FloatingInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
// api
import userApi from "@/api/management/userApi";
// lib
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Người dùng", route: "/management/users" },
  { title: "Chỉnh sửa", route: "#" },
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

  // state value response
  const [name, setName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone_number);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [status, setStatus] = useState(user.status);
  const [avatar, setAvatar] = useState(user.avatar);
  const [selectedRole, setSelectedRole] = useState(user.role.slug);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("full_name", name);
    data.append("email", email);
    data.append("phone_number", phone);
    data.append("status", status);
    data.append("is_verified", isVerified);
    data.append("slug", selectedRole);

    if (avatar instanceof File) {
      data.append("avatar", avatar);
    }

    try {
      const response = await userApi.update(user.id, data);
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

  const handleStatusChange = (checkedValue) => {
    setStatus(checkedValue);
  };

  const handleVerifiedChange = (checkedValue) => {
    setIsVerified(checkedValue);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-100 tracking-wide">
        Chỉnh sửa thông tin người dùng
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        {/* KHỐI 1: ẢNH ĐẠI DIỆN (3 CỘT) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-2xl backdrop-blur-md h-fit">
          <TitleManagement color="cyan">Ảnh đại diện</TitleManagement>
          <div className="flex items-center justify-center w-full py-2">
            <InputFile value={avatar} onChange={(file) => setAvatar(file)} />
          </div>
        </div>

        {/* KHỐI 2: THÔNG TIN CƠ BẢN (5 CỘT) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-5 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-2xl backdrop-blur-md h-fit">
          <TitleManagement color="green">Thông tin cơ bản</TitleManagement>
          <div className="space-y-5">
            <FloatingInput
              id="full_name"
              label="Họ tên"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FloatingInput
              id="phone_number"
              label="Số điện thoại"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI 3: TRẠNG THÁI & PHÂN QUYỀN (4 CỘT - relative z-20 chống che dropdown) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-4 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-2xl backdrop-blur-md relative z-20 h-fit">
          <TitleManagement color="blue">Trạng thái quyền</TitleManagement>
          {/* Cụm Checkbox tinh chỉnh bo viền công nghệ tối */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border border-slate-800/80 bg-[#111827]/40 p-3 rounded-xl flex items-center justify-center transition-colors duration-150 hover:border-slate-700">
              <AnimatedCheckbox
                id="is_verified_checkbox"
                label={isVerified ? "Đã xác thực" : "Chưa xác thực"}
                checked={isVerified}
                onChange={(e) => handleVerifiedChange(e.target.checked)}
              />
            </div>
            <div className="border border-slate-800/80 bg-[#111827]/40 p-3 rounded-xl flex items-center justify-center transition-colors duration-150 hover:border-slate-700">
              <AnimatedCheckbox
                id="is_active_checkbox"
                label={status ? "Hoạt động" : "Đã khóa"}
                checked={status}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Select
              label="Loại tài khoản"
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder="Chọn chức vụ..."
            />

            {/* Thanh nút bấm ngăn cách phẳng mượt biên đáy card */}
            <div className="border-t border-white/5 pt-5 flex justify-end w-full">
              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
