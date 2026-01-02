import { Outlet } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
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
          <div className="flex-1 relative group">
            <SearchTable placeholder="Tìm kiếm quyền hạn..." />
          </div>
          <BtnAdd
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
