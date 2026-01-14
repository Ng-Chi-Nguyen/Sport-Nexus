import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuổi cung ứng", route: "" },
  { title: "Nhập hàng", route: "/management/purchase" },
  { title: "Thêm đơn nhập hàng", route: "" },
];

const CreatePurchaseOrder = () => {
  const responses = useLoaderData();
  const [selectSupplier, setSelectSupplier] = useState("");
  const [selectVartant, setSelectVariant] = useState("");
  console.log(responses);

  const suppliersOptions = useMemo(
    () =>
      responses.suppliers.data.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      })),
    [responses.suppliers.data]
  );

  const variantsOptions = useMemo(
    () =>
      responses.productVariants.data.map((variant) => ({
        id: variant.id,
        name: `${variant.product.name} - ${variant.VariableAttributes[0].attributeKey.name}: ${variant.VariableAttributes[0].value}`,
      })),
    [responses.suppliers.data]
  );

  const handleSupplierChange = (supplierId) => {
    // console.log("ID NCC đã chọn:", supplierId);
    setSelectSupplier(supplierId);
  };

  const handleVariantChange = (variantId) => {
    console.log("ID NCC đã chọn:", variantId);
    setSelectVariant(variantId);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="my-2">Thêm đơn nhập hàng</h2>
      <form className="flex gap-2">
        <div className="flex flex-col w-1/4 gap-3">
          <div className="border border-gray-200 p-5 rounded-[5px]">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Nhà cung cấp sản
              phẩm
            </h3>
            <SelectPro
              value={selectSupplier}
              options={suppliersOptions}
              onChange={handleSupplierChange}
              label="Chọn thương hiệu"
            />
          </div>
          <div className="border border-gray-200 p-5 rounded-[5px]">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Ngày nhận hàng dự
              kiến
            </h3>
            <FloatingInput label="Ngày nhận hàng dự kiến" type="date" />
          </div>
          <div className="border border-gray-200 p-5 rounded-[5px]">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Tổng tiền nhập hàng
            </h3>
            <FloatingInput label="Tông tiền nhập hàng" type="number" />
          </div>
        </div>
        <div className="flex-1 border border-gray-200 p-5 rounded-[5px]">
          <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#4facf3]"></span> Chỉ tiết món hàng
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-2/4">
              <SelectPro
                value={selectVartant}
                options={variantsOptions}
                onChange={handleVariantChange}
                label="Chọn món hàng nhaaoj về"
              />
            </div>
            <div className="w-1/4">
              <FloatingInput label="Số lượng món hàng" type="number" />
            </div>
            <div className="w-1/4">
              <FloatingInput label="Giá món hàng" type="number" />
            </div>
            <button className="bg-primary text-[#FFF] py-[1px] px-4 text-[30px] rounded-[5px] font-bold">
              +
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreatePurchaseOrder;
