import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/input";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import statusOptions from "@/constants/purchaseOrder";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import purchaseOrderApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhập hàng", route: "/management/purchase" },
  { title: "Chỉnh sửa đơn hàng", route: "" },
];

const EditPurchaseOrder = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  const { purchaseId } = useParams(); // Lấy ID từ URL

  // Dữ liệu cũ từ backend
  const purchaseOld = response.purchase.data;

  // 1. Khởi tạo State thông tin chung
  const [selectSupplier, setSelectSupplier] = useState(purchaseOld.supplier_id);
  const [expectedDate, setExpectedDate] = useState(
    purchaseOld.expected_delivery_date
      ? purchaseOld.expected_delivery_date.split("T")[0]
      : "",
  );
  const [selectStatus, setSelectStatus] = useState(purchaseOld.status);

  // 2. Khởi tạo State danh sách món hàng (Mapping từ backend PurchaseOrderItems)
  const [items, setItems] = useState(
    purchaseOld.PurchaseOrderItems.map((item) => ({
      id: item.id, // Giữ ID gốc để backend biết là update món cũ
      variantId: item.product_variant_id,
      quantity: item.quantity,
      cost: item.unit_cost_price,
    })),
  );

  // 3. Tự động tính tổng tiền khi items thay đổi
  const totalCost = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.cost || 0),
      0,
    );
  }, [items]);

  // 4. Chuẩn bị Options cho Select
  const suppliersOptions = useMemo(
    () => response.suppliers.data.map((s) => ({ id: s.id, name: s.name })),
    [response.suppliers.data],
  );

  const variantsOptions = useMemo(
    () =>
      response.productVariants.data.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [response.productVariants.data],
  );

  // 5. Hàm xử lý logic món hàng
  const handleAddItem = () => {
    if (items.length >= 10) {
      toast.error("Nếu số lượng lớn hơn 10 món hãy nhập bằng file");
      return;
    }
    setItems([
      ...items,
      { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectSupplier || !expectedDate) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

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

    try {
      const res = await purchaseOrderApi.update(purchaseId, dataToSend);
      if (res.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
        toast.success("Cập nhật đơn hàng thành công!");
        navigate("/management/purchase");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật!");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="my-2">Chỉnh sửa đơn nhập hàng #PO-{purchaseId}</h2>

      <form onSubmit={handleSubmit} className="flex gap-4">
        {/* CỘT TRÁI: THÔNG TIN CHUNG */}
        <div className="flex flex-col w-1/4 gap-4">
          <div className="border border-slate-200 p-5 rounded-[5px] bg-white shadow-sm">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500"></span> Nhà cung cấp
            </h3>
            <SelectPro
              value={selectSupplier}
              options={suppliersOptions}
              onChange={setSelectSupplier}
              label="Chọn nhà cung cấp"
            />
          </div>

          <div className="border border-slate-200 p-5 rounded-[5px] bg-white shadow-sm">
            <h3 className="font-black text-xs uppercase border-b-2 border-emerald-500 pb-2 mb-4 flex items-center gap-2 text-emerald-600">
              <span className="w-2 h-4 bg-emerald-500"></span> Trạng thái đơn
            </h3>
            <SelectPro
              value={selectStatus}
              options={statusOptions}
              onChange={setSelectStatus}
              label="Trạng thái"
            />
          </div>

          <div className="border border-slate-200 p-5 rounded-[5px] bg-white shadow-sm">
            <h3 className="font-black text-xs uppercase border-b-2 border-orange-500 pb-2 mb-4 flex items-center gap-2 text-orange-600">
              <span className="w-2 h-4 bg-orange-500"></span> Thời gian & Chi
              phí
            </h3>
            <div className="flex flex-col gap-4">
              <FloatingInput
                label="Ngày dự kiến"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
              <FloatingInput
                label="Tổng tiền (VNĐ)"
                type="text"
                readOnly
                value={new Intl.NumberFormat("vi-VN").format(totalCost)}
                className="bg-slate-50 font-bold text-red-600"
              />
            </div>
          </div>
          <Submit_GoBack name="Sữa" />
        </div>

        {/* CỘT PHẢI: CHI TIẾT MÓN HÀNG */}
        <div className="flex-1 border border-slate-200 p-5 rounded-[5px] bg-white shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-black text-xs uppercase border-b-2 border-blue-500 pb-2 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500"></span> Chi tiết món hàng
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-primary text-white py-2 px-6 rounded-[5px] font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Thêm món hàng
            </button>
          </div>

          {/* Thêm pb-40 để hàng cuối cùng không bị cắt menu khi xổ xuống */}
          <div className="flex flex-col gap-4 max-h-[610px] overflow-y-auto pr-2 pb-40 custom-scrollbar">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all group relative"
                // FIX: Hàng trên cùng (index 0) sẽ có z-index cao nhất
                style={{ zIndex: items.length - index }}
              >
                <div className="w-2/4">
                  <SelectPro
                    value={item.variantId}
                    options={variantsOptions}
                    onChange={(val) =>
                      handleItemChange(item.id, "variantId", val)
                    }
                    label="Sản phẩm"
                  />
                </div>

                {/* Các thành phần khác giữ nguyên */}
                <div className="w-1/4">
                  <FloatingInput
                    label="Số lượng"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="w-1/4">
                  <FloatingInput
                    label="Giá nhập"
                    type="number"
                    min={0}
                    value={item.cost}
                    onChange={(e) =>
                      handleItemChange(item.id, "cost", e.target.value)
                    }
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPurchaseOrder;
