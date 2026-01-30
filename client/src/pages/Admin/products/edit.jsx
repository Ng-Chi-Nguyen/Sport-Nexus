import React, { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
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
import { Submit_GoBack } from "@/components/ui/button";
import { toast } from "sonner";
import productdApi from "@/api/core/productApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm", route: "/management/products" },
  { title: "Chỉnh sữa sản phẩm", route: "" },
];

const CreateProductPage = () => {
  const { brands, suppliers, categories, product } = useLoaderData();

  // console.log(product);

  const navigate = useNavigate();
  // state form
  const [selectBrand, setSelectBrand] = useState(product.data.brand_id);
  const [selectSupplier, setSelectSupplier] = useState(
    product.data.supplier_id,
  );
  const [selectCategory, setSelectCategory] = useState(
    product.data.category_id,
  );
  const [name, setName] = useState(product.data.name);
  const [thumbnail, setThumbnail] = useState(product.data.thumbnail);
  const [basePrice, setbBasePrice] = useState(product.data.base_price);
  const [isActive, setIsActive] = useState(product.data.is_active);
  const [description, setDescription] = useState(product.data.description);

  // console.log(selectBrand);

  const brandsOptions = useMemo(
    () =>
      brands.data.map((brand) => ({
        id: brand.id,
        name: brand.name,
      })),
    [brands.data],
  );

  // console.log(categories.data);

  const suppliersOptions = useMemo(
    () =>
      suppliers.data.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      })),
    [brands.data],
  );

  const categoriesOptions = useMemo(
    () =>
      categories.data.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    [categories.data],
  );

  // console.log(suppliersOptions);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (thumbnail instanceof File) {
      formData.append("thumbnail", thumbnail);
    }
    formData.append("name", name);
    formData.append("base_price", basePrice);
    formData.append("is_active", isActive);
    formData.append("brand_id", selectBrand);
    formData.append("supplier_id", selectSupplier);
    formData.append("category_id", selectCategory);
    formData.append("description", description);

    // --- ĐOẠN LOG KIỂM TRA ---
    console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("===============================");
    try {
      const response = await productdApi.update(product.data.id, formData);
      // console.log(response);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
    }
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
      <form onSubmit={handleSubmit} className="flex gap-3 mt-2">
        <div className="w-1/2 flex flex-col gap-3">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
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
          <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Thông tin sản phẩm
          </h3>
          <div className="flex gap-2">
            <FloatingInput
              id="name"
              label="Tên sản phẩm"
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
            <FloatingTextarea
              id="product_desc"
              label="Mô tả sản phẩm"
              placeholder="Nhập mô tả chi tiết..."
              value={description} // Truyền giá trị từ state vào
              onChange={(e) => setDescription(e.target.value)} // Cập nhật state khi gõ
              required={true}
            />
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
            <Submit_GoBack name="Sữa" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
