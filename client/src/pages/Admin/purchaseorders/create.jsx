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
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
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
    <div className="animate-in fade-in duration-500 space-y-4">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">
        Thêm đơn nhập hàng mới
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full">
        {/* CỘT TRÁI: THÔNG TIN CHUNG (CHIẾM 30% RỘNG - relative z-30 để dropdown đè nổi lên trên) */}
        <div className="flex flex-col w-[30%] gap-3.5 relative z-30">
          {/* CONTAINER DUY NHẤT: Giảm padding từ p-5 xuống p-4, nén gap dọc bằng space-y-3.5 */}
          <div className="bg-[#0D121F]/40 border border-slate-900 p-4 rounded-xl shadow-xl backdrop-blur-md space-y-3.5">
            {/* PHẦN 1: NHÀ CUNG CẤP (Bỏ bớt margin-bottom dư thừa) */}
            <div>
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-1 mb-2 flex items-center gap-2 border-b border-white/5">
                <span className="w-1.5 h-3 rounded-sm bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></span>
                Nhà cung cấp
              </h3>
              <SelectPro
                value={selectSupplier}
                options={suppliersOptions}
                onChange={setSelectSupplier}
                label="Chọn nhà cung cấp"
              />
            </div>

            {/* PHẦN 2: TRẠNG THÁI MẶC ĐỊNH */}
            <div className="border-t border-white/5 pt-3">
              <h3 className="font-semibold text-xs text-emerald-400/90 uppercase tracking-wider pb-1 mb-2 flex items-center gap-2 border-b border-white/5">
                <span className="w-1.5 h-3 rounded-sm bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                Trạng thái mặc định
              </h3>
              <SelectPro
                value={selectStatus}
                options={statusOptions}
                onChange={setSelectStatus}
                label="Trạng thái"
              />
            </div>

            {/* PHẦN 3: THỜI GIAN & NGÂN SÁCH (ĐÃ THU GỌN CỰC ĐẠI) */}
            <div className="border-t border-white/5 pt-3">
              <h3 className="font-semibold text-xs text-orange-400/90 uppercase tracking-wider pb-1 mb-2 flex items-center gap-2 border-b border-white/5">
                <span className="w-1.5 h-3 rounded-sm bg-orange-500 shadow-[0_0_8px_#f97316]"></span>
                Thời gian & Ngân sách
              </h3>

              {/* Nén khoảng cách giữa Input Date và Text hiển thị tiền tiền bằng gap-2 */}
              <div className="flex flex-col gap-2">
                <FloatingInput
                  label="Ngày nhận hàng dự kiến"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />

                {/* ĐÃ SỬA: Loại bỏ hộp bọc viền dầy cũ, chuyển thành dòng chữ phẳng mượt siêu tiết kiệm không gian */}
                <div className="flex justify-between items-center px-1 py-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Tổng ước tính:
                  </span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI: DANH SÁCH MÓN HÀNG NHẬP VỀ (70% RỘNG - relative z-10) */}
        <div className="flex-1 bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-xl backdrop-blur-md relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider pb-2 flex items-center gap-2 border-b border-white/5">
              <span className="w-1.5 h-3.5 rounded-sm bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></span>
              Danh sách món hàng nhập về
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-sky-500/10 text-sky-400 border border-sky-500/20 py-2 px-4 rounded-lg font-bold hover:bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.05)] transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> Thêm món hàng
            </button>
          </div>

          {/* VÙNG CUỘN CHỨA CÁC INPUT ITEM */}
          <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2 pb-20 custom-scrollbar">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-[#111827]/40 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-all duration-150 relative"
                style={{ zIndex: items.length - index }}
              >
                {/* Chọn Biến thể sản phẩm */}
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

                {/* Nhập Số lượng */}
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

                {/* Nhập Giá nhập gốc */}
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

                {/* Nút gỡ dòng sản phẩm */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Xóa dòng"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-20 text-slate-500 italic text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                Chưa có món hàng nào được chọn nhập về.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;
