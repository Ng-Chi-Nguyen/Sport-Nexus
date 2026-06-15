import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input"; // ĐỔI SANG: Dùng FloatingInput để đồng bộ và sạch lỗi đè chữ
import { Select } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
// api
import permissionApi from "@/api/management/permissionApi";
// constants
import { MODULE_LABELS, ACTION_OPTIONS } from "@/constants/permission";
// lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Phân quyền", route: "/management/permissions" },
  { title: "Thêm quyền", route: "#" },
];

const CreatePermissionPage = () => {
  const navigate = useNavigate();

  // Dữ liệu gửi đi
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [permissionName, setPermissionName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: permissionName,
      module: selectedRole,
      action: selectedAction,
    };

    try {
      const response = await permissionApi.create(formData);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["permissions"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  const moduleOptions = useMemo(() => {
    return Object.entries(MODULE_LABELS).map(([key, value]) => ({
      slug: key,
      name: value,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">
        Thêm quyền hạn mới
      </h2>

      {/* CHUYỂN ĐỔI: Dùng hệ lưới Grid 12 cột căng tràn diện tích GlassOS */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 w-full">
        {/* CONTAINER CHÍNH: Ép cứng z-20 độc lập để Dropdown hiển thị đè nổi lên trên mượt mà */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-[#0D121F]/40 border border-slate-900 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-20">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 mb-6 flex items-center gap-2 border-b border-white/5">
            <span className="w-1.5 h-3.5 rounded-sm bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></span>
            Cấu hình tham số quyền hạn
          </h3>

          {/* Hàng ngang chứa 2 bộ chọn cấu trúc gọn gàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="flex flex-col gap-1">
              <Select
                label="Chọn chức vụ / Phạm vi"
                options={moduleOptions}
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
                placeholder="Chọn mục..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Select
                label="Áp dụng cho bảng (Action)"
                options={ACTION_OPTIONS}
                value={selectedAction}
                onChange={(val) => setSelectedAction(val)}
                placeholder="Chọn mục..."
              />
            </div>
          </div>

          {/* Ô nhập tên quyền: Thay thế InputFrom cũ bằng FloatingInput để xử lý triệt để lỗi đè chữ */}
          <div className="w-full mb-8">
            <FloatingInput
              id="permission_name"
              label="Tên quyền hạn chi tiết"
              required
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
            />
          </div>

          {/* THANH ĐIỀU HƯỚNG BIÊN ĐÁY: Ngăn cách phẳng bằng border mờ */}
          <div className="flex justify-end border-t border-white/5 pt-5 w-full">
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePermissionPage;
