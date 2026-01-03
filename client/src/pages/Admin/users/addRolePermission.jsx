import Breadcrumbs from "@/components/ui/breadcrumbs";
import PermissionTable from "@/components/permissionTable";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData } from "react-router-dom";
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
    title: "Cấp quyền",
    route: "#",
  },
];

const AddRolePermissionPage = () => {
  const loaderData = useLoaderData();
  const { user, allPermissions } = loaderData;
  //   console.log(loaderData);
  const userData = user?.data?.user;
  const permissionsData = allPermissions?.data;
  const userPerms = userData?.permissions || [];
  const rolePerms = userData?.roles?.[0]?.permissions || [];
  //   console.log(userData);
  //   console.log(permissionsData);
  //   console.log(rolePerms);

  const handleSavePermissions = async (selectedIds) => {
    try {
      // THAY ĐỔI Ở ĐÂY: Bọc selectedIds vào trong một Object với key là permissionIds
      const response = await userApi.updatePermission(userData.id, {
        permissionIds: selectedIds,
      });
      //   console.log(response);
      if (response.success) {
        toast.success("Cấp quyền thành công!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Cập nhật thất bại.");
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="p-4">
        <div className="flex items-center">
          <h2>
            Cấp quyền cho:{" "}
            <span className="text-primary">{userData?.full_name}</span>
          </h2>
          <p className="ml-1 text-[12px] text-gray-400"> ({userData.email})</p>
        </div>

        {/* Truyền đúng biến đã bóc tách */}
        <PermissionTable
          allPermissions={permissionsData} // Vẫn là danh sách tổng để vẽ bảng
          userPermissions={userPerms} // Đã sửa để lấy từ userData
          rolePermissions={rolePerms} // Đã sửa để lấy từ userData
          onSave={handleSavePermissions}
        />
      </div>
    </>
  );
};

export default AddRolePermissionPage;
