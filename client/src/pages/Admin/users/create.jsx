import { useState, useMemo } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import {
  FloatingInputPassword,
  FloatingInput,
  InputFile,
} from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
// api
import userApi from "@/api/management/userApi";
// lib
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Người dùng", route: "/management/users" },
  { title: "Thêm người dùng", route: "#" },
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

  // state form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (avatar instanceof File) formData.append("avatar", avatar);

    formData.append("full_name", name);
    formData.append("email", email);
    formData.append("phone_number", phone);
    formData.append("password", password);
    formData.append("slug", selectedRole);

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
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">
        Thêm người dùng mới
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
            <FloatingInputPassword
              id="Password"
              label="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI 3: PHÂN QUYỀN TÀI KHOẢN (4 CỘT - ĐÃ FIX relative z-20) */}
        <div className="col-span-12 md:col-span-12 lg:col-span-4 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-2xl backdrop-blur-md relative z-20 h-fit">
          <TitleManagement color="blue">Trạng thái quyền</TitleManagement>
          <div className="space-y-6">
            <Select
              label="Loại tài khoản"
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder="Chọn chức vụ..."
            />

            {/* Thanh nút bấm hành động ngăn cách mượt mà biên đáy */}
            <div className="border-t border-white/5 pt-5 flex justify-end w-full">
              <Submit_GoBack />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
