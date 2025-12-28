import Breadcrumbs from "@/components/ui/breadcrumbs";

const breadcrumbData = [
  {
    title: "Quản lý kinh doanh",
    route: "",
  },
  {
    title: "Khách hàng",
    route: "#",
  },
];

const UserPage = () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">User Page</div>
    </>
  );
};

export default UserPage;
