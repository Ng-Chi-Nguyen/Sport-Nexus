import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý sản phẩm & kho",
    route: "",
  },
  {
    title: "Sản phẩm",
    route: "",
  },
];

const ProductPage = () => {
  const response = useLoaderData();
  console.log(response);
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable placeholder="Tìm kiếm sản phẩm..." />
        </div>
        <BtnAdd
          route={"/management/products/create"}
          className="w-[30%]"
          name="Thêm nhà cung cấp"
        />
      </div>
    </>
  );
};

export default ProductPage;
