import { Outlet } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button3DLink } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";

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
    route: "#",
  },
];

const UserPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="p-2">
        <div className="flex items-center gap-4">
          <div className="w-[70%] relative group">
            <SearchTable placeholder="Tìm kiếm quyền hạn..." />
          </div>
          <Button3DLink
            route={"/management/permissions/create"}
            className="w-[30%]"
            name="Thêm người dùng"
          />
        </div>
      </div>
      <div className="">
        <h2 className="py-2">Danh sách người dùng</h2>
      </div>
    </>
  );
};

export default UserPage;
