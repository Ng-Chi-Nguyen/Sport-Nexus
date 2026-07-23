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
import FloatingTextarea from "@/components/ui/textarea";
import { Submit_GoBack } from "@/components/ui/button";
import { toast } from "sonner";
import productdApi from "@/api/core/productApi";
import productImageApi from "@/api/core/productImageApi";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import MultiFileUpload from "@/components/ui/MultiFileUpload";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý sản phẩm", route: "/management/products" },
  { title: "Thêm sản phẩm mới", route: "" },
];

const CreateProductPage = () => {
  const { brands, suppliers, categories } = useLoaderData();
  const navigate = useNavigate();
  // state form
  const [selectBrand, setSelectBrand] = useState("");
  const [selectSupplier, setSelectSupplier] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [basePrice, setbBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [productImages, setProductImages] = useState([]);

  // console.log(brands);
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
      // Khi gửi thế này, Multer ở BE sẽ bắt được và tạo ra cái <Buffer ...> bạn cần
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
    // console.log("=== KIỂM TRA DỮ LIỆU GỬI ĐI ===");
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("===============================");

    try {
      const response = await productdApi.create(formData);
      if (response.success) {
        const newProductId = response.data.id;

        if (productImages.length > 0) {
          const imageFormData = new FormData();
          productImages.forEach((file) => {
            imageFormData.append("url", file);
          });
          imageFormData.append("product_id", newProductId);
          await productImageApi.create(imageFormData);
        }

        await queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
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
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3 mt-2">
        <div className="w-full lg:w-1/2 flex flex-col gap-3">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="amber">Phân loại hệ thống</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="w-full sm:w-1/2">
                <SelectPro
                  value={selectBrand}
                  options={brandsOptions}
                  onChange={handleBrandChange}
                  label="Chọn thương hiệu"
                />
              </div>
              <div className="w-full sm:w-1/2">
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
            <TitleManagement color="cyan">Ảnh đại diện</TitleManagement>
            <InputFile
              value={thumbnail}
              onChange={(file) => setThumbnail(file)}
            />
          </div>
          <div className="border border-gray-200 p-3 rounded-[5px]">
            <MultiFileUpload
              label="Ảnh mô tả sản phẩm"
              value={productImages}
              onChange={setProductImages}
              maxFiles={10}
            />
          </div>
        </div>
        <div className="border border-gray-200 w-2/3 p-3 rounded-[5px]">
          <TitleManagement color="blue">Thông tin sản phẩm</TitleManagement>
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
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <Submit_GoBack />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;
