import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button3DLink } from "@/components/ui/button";
import { Outlet } from "react-router-dom";

const breadcrumbData = [
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
        <div className="flex">
          <div className="w-[80%] border border-red-500 mr-3">
            <p>Search</p>
          </div>
          <Button3DLink
            route={"/management/users/create"}
            className="w-[20%]"
            name="Thêm người dùng"
          />
        </div>
      </div>
      <div className="">
        List User
        <Outlet />
      </div>
    </>
  );
};

export default UserPage;
