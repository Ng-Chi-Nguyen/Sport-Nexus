import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button3DLink } from "@/components/ui/button";

const breadcrumbData = [
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Phân quyền",
    route: "#",
  },
];

const RolePage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="p-2">
        <div className="flex">
          <div className="w-[80%] border border-red-500 mr-3">
            <p>Search</p>
          </div>
          <Button3DLink
            route={"/management/roles/create"}
            className="w-[20%]"
            name="Thêm quyền"
          />
        </div>
      </div>
      <div className="">Role Page</div>
    </>
  );
};

export default RolePage;
