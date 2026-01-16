import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import statusOptions from "@/constants/purchaseOrder";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuổi cung ứng", route: "" },
  { title: "Nhập hàng", route: "/management/purchase" },
  { title: "Thêm đơn nhập hàng", route: "" },
];

const CreatePurchaseOrder = () => {
  const responses = useLoaderData();
  const navigate = useNavigate();

  const [selectSupplier, setSelectSupplier] = useState("");
  const [selectVartant, setSelectVariant] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [selectStatus, setSelectStatus] = useState("PENDING");

  // State để quản lý danh sách món hàng (Khởi tạo có sẵn 1 dòng)
  const [items, setItems] = useState([
    { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
  ]);

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

  //  Hàm thêm một dòng mới
  const handleAddItem = (e) => {
    e.preventDefault(); // Chặn form reload
    if (items.length >= 10) {
      toast.error("Nếu số lượng món hàng lớn hơn 10 món hãy nhập bằng file");
      return;
    }
    setItems([
      ...items,
      { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
    ]);
  };

  // 3. Hàm cập nhật dữ liệu khi gõ vào input
  const handleItemChange = (id, field, value) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleSupplierChange = (supplierId) => {
    // console.log("ID NCC đã chọn:", supplierId);
    setSelectSupplier(supplierId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      supplier_id: Number(selectSupplier),
      expected_delivery_date: expectedDate,
      total_cost: totalCost,
      status: selectStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        unit_cost_price: Number(item.cost),
      })),
    };
    console.log(dataToSend);
    try {
      const response = await purchaseOrderdApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase"] });
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

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="my-2">Thêm đơn nhập hàng</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
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
          <div className="border border-gray-200 p-5 rounded-[5px">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Trạng thái nhập
              hàng
            </h3>
            <SelectPro
              label="Trạng thái nhập hàng"
              value={selectStatus}
              options={statusOptions}
              onChange={(e) => setSelectStatus(e.target.value)}
            />
          </div>
          <div className="border border-gray-200 p-5 rounded-[5px]">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Ngày nhận hàng dự
              kiến
            </h3>
            <FloatingInput
              label="Ngày nhận hàng dự kiến"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
          <div className="border border-gray-200 p-5 rounded-[5px]">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Tổng tiền nhập hàng
            </h3>
            <FloatingInput
              label="Tông tiền nhập hàng"
              type="number"
              min={0}
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
          </div>

          <Submit_GoBack />
        </div>

        <div className="flex-1 border border-gray-200 p-5 rounded-[5px]">
          <div className="flex items-start justify-between">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#4facf3]"></span> Chỉ tiết món hàng
            </h3>
            <div className="">
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-primary mb-4 text-[#FFF] py-[3px] px-6 rounded-[5px] font-bold hover:opacity-80 transition"
              >
                Thêm món hàng
              </button>
            </div>
          </div>
          <div className="pt-2 flex flex-col gap-4 max-h-[610px]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 animate-in fade-in duration-300"
              >
                <div className="w-2/4">
                  <SelectPro
                    value={item.variantId}
                    options={variantsOptions}
                    onChange={(val) =>
                      handleItemChange(item.id, "variantId", val)
                    }
                    label="Chọn món hàng nhập về"
                  />
                </div>
                <div className="w-1/4">
                  <FloatingInput
                    label="Số lượng"
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="w-1/4">
                  <FloatingInput
                    label="Giá nhập"
                    min={0}
                    type="number"
                    value={item.cost}
                    onChange={(e) =>
                      handleItemChange(item.id, "cost", e.target.value)
                    }
                  />
                </div>

                {/* Nút xóa dòng nếu cần */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 font-bold px-4 py-2 bg-red-200 rounded-[5px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </>
  );
};

export default CreatePurchaseOrder;
