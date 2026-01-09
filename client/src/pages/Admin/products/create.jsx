import React, { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  PackagePlus,
  Image as ImageIcon,
} from "lucide-react";

import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SelectPro } from "@/components/ui/select";
import { InputFile } from "@/components/ui/input";
import { FloatingInput } from "@/components/ui/input";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";
import { FloatingTextarea } from "@/components/ui/textarea";
import { BtnGoback, BtnSubmit } from "@/components/ui/button";
import { Submit_GoBack } from "@/components/ui/button";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm", route: "/management/products" },
  { title: "Thêm sản phẩm mới", route: "" },
];

const CreateProductPage = () => {
  const { brands, suppliers, categories } = useLoaderData();
  // state form
  const [selectBrand, setSelectBrand] = useState("");
  const [selectSupplier, setSelectSupplier] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [basePrice, setbBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // console.log(brands);
  const brandsOptions = useMemo(
    () =>
      brands.data.map((brand) => ({
        id: brand.id,
        name: brand.name,
      })),
    [brands.data]
  );

  // console.log(categories.data);

  const suppliersOptions = useMemo(
    () =>
      suppliers.data.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      })),
    [brands.data]
  );

  const categoriesOptions = useMemo(
    () =>
      categories.data.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    [categories.data]
  );

  // console.log(suppliersOptions);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu sẵn sàng gửi đi:", formData);
  };

  const handleBrandChange = (brandId) => {
    // console.log("ID thương hiệu đã chọn:", brandId);
    setSelectBrand(brandId);
  };

  const handleSupplierChange = (supplierId) => {
    // console.log("ID NCC đã chọn:", supplierId);
    setSelectSupplier(supplierId);
  };

  const handleCategoryChange = (categoryId) => {
    // console.log("ID loại hàng đã chọn:", categoryId);
    setSelectCategory(categoryId);
  };

  const handleStatusChange = (checkedValue) => {
    setIsActive(checkedValue);
    // console.log(isActive);
  };

  return (
    <div className="">
      <Breadcrumbs data={breadcrumbData} />
      <h2>Thêm mới sản phẩm</h2>
      <form className="flex gap-3 mt-2">
        <div className="w-1/2 flex flex-col gap-3">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Phân loại hệ thống
            </h3>
            <div className="flex gap-2 mb-2">
              <div className="w-1/2">
                <SelectPro
                  value={selectBrand}
                  options={brandsOptions}
                  onChange={handleBrandChange}
                  label="Chọn thương hiệu"
                />
              </div>
              <div className="w-1/2">
                <SelectPro
                  value={selectSupplier}
                  options={suppliersOptions}
                  onChange={handleSupplierChange}
                  label="Chọn thương hiệu"
                />
              </div>
            </div>
            <SelectPro
              value={selectCategory}
              options={categoriesOptions}
              onChange={handleCategoryChange}
              label="Chọn loại hàng"
            />
          </div>
          <div className="border border-gray-200 p-3 rounded-[5px]">
            <InputFile
              label="Ảnh đại diện"
              value={thumbnail}
              onChange={(file) => setThumbnail(file)}
            />
          </div>
        </div>
        <div className="border border-gray-200 w-2/3 p-3 rounded-[5px]">
          <h3 className="font-black text-xs uppercase border-b-2 border-[#323232] pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin sản phẩm
          </h3>
          <div className="flex gap-2">
            <FloatingInput
              id="name"
              label="Tên danh mục"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="">
              <FloatingInput
                id="base_price"
                label="Giá gốc (vnđ)"
                required
                type="number"
                value={basePrice}
                onChange={(e) => setbBasePrice(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2">
            <FloatingTextarea />
          </div>
          <div className="flex items-center justify-between">
            <div className="border border-blue-200 w-[40%] p-2 m-2 rounded-[5px]">
              <AnimatedCheckbox
                id="is_active_checkbox"
                label={isActive ? "Sản phẩm đang bán" : "Tạm ngưng kinh doanh"}
                checked={isActive}
                onChange={(e) => handleStatusChange(e.target.checked)}
              />
            </div>
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
