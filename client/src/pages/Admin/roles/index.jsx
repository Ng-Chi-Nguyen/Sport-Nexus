import Breadcrumbs from "@/components/ui/breadcrumbs";

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
      <div className="">Role Page</div>
    </>
  );
};

export default RolePage;
