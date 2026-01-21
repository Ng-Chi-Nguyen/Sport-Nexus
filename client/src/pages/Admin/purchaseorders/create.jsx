import Breadcrumbs from "@/components/ui/breadcrumbs";
import { FloatingInput } from "@/components/ui/input";
import { SelectPro } from "@/components/ui/select";
import { Submit_GoBack } from "@/components/ui/button";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import statusOptions from "@/constants/purchaseOrder";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhập hàng", route: "/management/purchase" },
  { title: "Thêm đơn nhập hàng", route: "" },
];

const CreatePurchaseOrder = () => {
  const responses = useLoaderData();
  const navigate = useNavigate();

  // 1. State quản lý thông tin chung
  const [selectSupplier, setSelectSupplier] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [selectStatus, setSelectStatus] = useState("PENDING");

  // 2. State quản lý danh sách món hàng
  const [items, setItems] = useState([
    { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
  ]);

  // 3. Tự động tính tổng tiền khi danh sách items thay đổi
  const totalCost = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.cost || 0),
      0,
    );
  }, [items]);

  // 4. Chuẩn bị Options từ LoaderData
  const suppliersOptions = useMemo(
    () => responses.suppliers.data.map((s) => ({ id: s.id, name: s.name })),
    [responses.suppliers.data],
  );

  const variantsOptions = useMemo(
    () =>
      responses.productVariants.data.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [responses.productVariants.data],
  );

  // 5. Hàm xử lý logic món hàng
  const handleAddItem = (e) => {
    e.preventDefault();
    if (items.length >= 10) {
      toast.error("Nếu số lượng món hàng lớn hơn 10 món hãy nhập bằng file");
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
      toast.error("Vui lòng điền đầy đủ thông tin nhà cung cấp và ngày nhận!");
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
      const response = await purchaseOrderdApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase"] });
        toast.success(response.message);
        navigate("/management/purchase");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra!");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="my-3 font-bold text-xl text-slate-800 uppercase tracking-tight">
        Thêm đơn nhập hàng mới
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-4">
        {/* CỘT TRÁI: THÔNG TIN CẤU HÌNH (25%) */}
        <div className="flex flex-col w-1/4 gap-4">
          <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="font-black text-[11px] uppercase border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500"></span> Nhà cung cấp
            </h3>
            <SelectPro
              value={selectSupplier}
              options={suppliersOptions}
              onChange={setSelectSupplier}
              label="Chọn nhà cung cấp"
            />
          </div>

          <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="font-black text-[11px] uppercase border-b-2 border-emerald-500 pb-2 mb-4 flex items-center gap-2 text-emerald-600">
              <span className="w-2 h-4 bg-emerald-500"></span> Trạng thái mặc
              định
            </h3>
            <SelectPro
              value={selectStatus}
              options={statusOptions}
              onChange={setSelectStatus}
              label="Trạng thái"
            />
          </div>

          <div className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
            <h3 className="font-black text-[11px] uppercase border-b-2 border-orange-500 pb-2 mb-4 flex items-center gap-2 text-orange-600">
              <span className="w-2 h-4 bg-orange-500"></span> Thời gian & Ngân
              sách
            </h3>
            <div className="flex flex-col gap-4">
              <FloatingInput
                label="Ngày nhận hàng dự kiến"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Tổng tiền ước tính
                </p>
                <p className="text-lg font-black text-red-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalCost)}
                </p>
              </div>
            </div>
          </div>
          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI: CHI TIẾT MÓN HÀNG (75%) */}
        <div className="flex-1 border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-black text-[11px] uppercase border-b-2 border-blue-500 pb-2 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500"></span> Danh sách món hàng
              nhập về
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-primary text-white py-2 px-6 rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-md text-sm"
            >
              <Plus size={18} /> Thêm món hàng
            </button>
          </div>

          {/* Danh sách items có Scrollbar - Thêm pb-40 để tạo khoảng trống cho hàng cuối */}
          <div className="flex flex-col gap-4 max-h-[610px] overflow-y-auto pr-2 pb-40 custom-scrollbar">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all group relative"
                // FIX: Hàng trên có z-index cao hơn hàng dưới
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

                {/* Các Input khác giữ nguyên */}
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
                    title="Xóa dòng"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                Chưa có món hàng nào được chọn
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;
