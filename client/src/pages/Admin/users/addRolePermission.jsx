import { useMemo, useState, useRef, useEffect } from "react"; // THÊM: useRef, useEffect để quản lý đóng mở Popover
import { LayoutDashboard, HelpCircle } from "lucide-react"; // THÊM: HelpCircle icon cho nút tra cứu
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import PermissionTable from "@/components/permissionTable";
// constants
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
// api
import userApi from "@/api/management/userApi";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý người dùng & phân quyền", route: "" },
  { title: "Người dùng", route: "/management/users" },
  { title: "Cấp quyền", route: "#" },
];

const AddRolePermissionPage = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const { user, allPermissions } = loaderData;

  const userData = user?.data?.user;
  const permissionsData = allPermissions?.data;
  const userPerms = userData?.permissions || [];
  const rolePerms = userData?.roles?.[0]?.permissions || [];

  // --- LOGIC TRA CỨU MODULES CHỦ ĐỘNG (GIỐNG TRANG PHÂN QUYỀN) ---
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsModuleOpen(false);
      }
    };
    if (isModuleOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModuleOpen]);
  // -------------------------------------------------------------

  const handleSavePermissions = async (selectedIds) => {
    try {
      const response = await userApi.updatePermission(userData.id, {
        permissionIds: selectedIds,
      });
      if (response.success) {
        toast.success("Cập nhật ma trận cấp quyền thành công!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật cấp quyền thất bại.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs data={breadcrumbData} />

      {/* KHỐI TIÊU ĐỀ: Định danh người dùng chuyên nghiệp */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
            Ma trận cấp quyền hạn
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-400">
            <span>Tài khoản:</span>
            <span className="text-sky-400 font-semibold">
              {userData?.full_name}
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-500 text-xs">
              {userData?.email}
            </span>
            <span className="text-slate-600">|</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium uppercase tracking-wider">
              {userData?.role?.name || "Thành viên"}
            </span>
          </div>
        </div>

        {/* ĐÃ THAY ĐỔI: Cụm nút hành động góc phải chứa nút Tra cứu Module chuẩn bài */}
        <div className="flex items-center gap-3 relative">
          {/* 🌟 NÚT BẤM TRA CỨU MODULE ĐỘC LẬP */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsModuleOpen(!isModuleOpen)}
              className={`h-[38px] px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all duration-200
                         ${
                           isModuleOpen
                             ? "bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                             : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200"
                         }`}
            >
              <HelpCircle size={14} strokeWidth={2.5} />
              Tra cứu Module
            </button>

            {/* POPOVER KÍNH MỜ: Đổ xuống mượt mà ngay dưới chân nút bấm */}
            {isModuleOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[320px] p-4 bg-[#0D121F]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-sky-400 border-b border-white/5 mb-3 pb-1.5 font-bold font-mono text-xs tracking-wider">
                  DANH SÁCH MODULES HỆ THỐNG:
                </p>
                <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(PERMISSION_TRANSLATIONS.modules).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-xs py-0.5 border-b border-white/[0.02]"
                      >
                        <span className="text-slate-500 font-mono font-bold uppercase">
                          {key}
                        </span>
                        <span className="text-slate-300 font-medium">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[38px] px-4 bg-slate-900/60 text-slate-400 border border-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* CONTAINER CHÍNH CHỨA BẢNG MA TRẬN PHÂN QUYỀN (GlassOS Dark Card) */}
      <div className="bg-[#0D121F]/40 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-3 rounded-full bg-violet-500"></span>
            Phân bổ quyền chức năng (Module ACL)
          </h3>
        </div>

        {/* Bảng ma trận kiểm soát quyền hạn */}
        <div className="overflow-x-auto custom-scrollbar table-dark-matrix">
          <PermissionTable
            allPermissions={permissionsData}
            userPermissions={userPerms}
            rolePermissions={rolePerms}
            onSave={handleSavePermissions}
          />
        </div>
      </div>
    </div>
  );
};

export default AddRolePermissionPage;
