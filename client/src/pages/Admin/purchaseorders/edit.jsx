import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/input";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PURCHASE_STATUS_OPTIONS } from "@/constants/management/purchaseOrder";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import purchaseOrderApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";
import { TitleManagement } from "@/components/ui/title";
import { formatCurrency } from "@/utils/formatters";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý chuỗi cung ứng", route: "" },
  { title: "Nhập hàng", route: "/management/purchase" },
  { title: "Chỉnh sửa đơn hàng", route: "" },
];

const EditPurchaseOrder = () => {
  const response = useLoaderData();
  const navigate = useNavigate();
  const { purchaseId } = useParams();

  // Dữ liệu cũ từ backend
  const purchaseOld = response?.purchase?.data;

  // 1. Khởi tạo State thông tin chung
  const [selectSupplier, setSelectSupplier] = useState(
    purchaseOld?.supplier_id || "",
  );
  const [expectedDate, setExpectedDate] = useState(
    purchaseOld?.expected_delivery_date
      ? purchaseOld.expected_delivery_date.split("T")[0]
      : "",
  );
  const [selectStatus, setSelectStatus] = useState(
    purchaseOld?.status || "PENDING",
  );

  // 2. Khởi tạo State danh sách món hàng
  const [items, setItems] = useState(
    purchaseOld?.PurchaseOrderItems
      ? purchaseOld.PurchaseOrderItems.map((item) => ({
          id: item.id,
          variantId: item.product_variant_id,
          quantity: item.quantity,
          cost: item.unit_cost_price,
        }))
      : [{ id: Date.now(), variantId: "", quantity: 1, cost: 0 }],
  );

  // Tự động cập nhật khi dữ liệu cũ được tải xong
  useEffect(() => {
    if (purchaseOld) {
      setSelectSupplier(purchaseOld.supplier_id || "");
      setExpectedDate(
        purchaseOld.expected_delivery_date
          ? purchaseOld.expected_delivery_date.split("T")[0]
          : "",
      );
      setSelectStatus(purchaseOld.status || "PENDING");
      if (
        purchaseOld.PurchaseOrderItems &&
        purchaseOld.PurchaseOrderItems.length > 0
      ) {
        setItems(
          purchaseOld.PurchaseOrderItems.map((item) => ({
            id: item.id,
            variantId: item.product_variant_id,
            quantity: item.quantity,
            cost: item.unit_cost_price,
          })),
        );
      }
    }
  }, [purchaseOld]);

  // 3. Tự động tính tổng tiền khi items thay đổi
  const totalCost = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.cost || 0),
      0,
    );
  }, [items]);

  // 4. Chuẩn bị Options cho Select
  const suppliersOptions = useMemo(
    () =>
      response?.suppliers?.data?.map((s) => ({ id: s.id, name: s.name })) || [],
    [response?.suppliers?.data],
  );

  const variantsOptions = useMemo(() => {
    if (!response?.productVariants?.data) return [];

    return response.productVariants.data.map((v) => {
      const hasAttributes =
        Array.isArray(v.VariableAttributes) && v.VariableAttributes.length > 0;
      const attrName = hasAttributes
        ? v.VariableAttributes[0]?.attributeKey?.name
        : "";
      const attrValue = hasAttributes ? v.VariableAttributes[0]?.value : "";
      const variantLabel = hasAttributes ? ` - ${attrName}: ${attrValue}` : "";

      return {
        id: v.id,
        name: `${v.product?.name || "Sản phẩm không rõ tên"}${variantLabel}`,
      };
    });
  }, [response?.productVariants?.data]);

  // 5. Hàm xử lý logic món hàng
  const handleAddItem = (e) => {
    e.preventDefault();
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
        toast.success(res.message);
        navigate("/management/purchase");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật!");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">
        Chỉnh sửa đơn nhập hàng #PO-{purchaseId}
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full">
        {/* CỘT TRÁI: THÔNG TIN CHUNG (Giao diện Đen) */}
        <div className="flex flex-col w-[30%] gap-3.5 relative z-30">
          <div className="bg-[#0D121F]/40 border border-slate-900 p-4 rounded-xl shadow-xl backdrop-blur-md space-y-3.5">
            {/* PHẦN 1: NHÀ CUNG CẤP */}
            <div>
              <TitleManagement color="blue">Nhà cung cấp</TitleManagement>
              <SelectPro
                value={selectSupplier}
                options={suppliersOptions}
                onChange={setSelectSupplier}
                label="Chọn nhà cung cấp"
              />
            </div>

            {/* PHẦN 2: TRẠNG THÁI */}
            <div className="border-t border-white/5 pt-3">
              <TitleManagement color="green">Trạng thái đơn</TitleManagement>
              <SelectPro
                value={selectStatus}
                options={PURCHASE_STATUS_OPTIONS.map(s => ({ id: s.slug, name: s.name }))}
                onChange={setSelectStatus}
                label="Trạng thái"
              />
            </div>

            {/* PHẦN 3: THỜI GIAN & CHI PHÍ */}
            <div className="border-t border-white/5 pt-3">
              <TitleManagement color="orange">
                Thời gian & Chi phí
              </TitleManagement>
              <div className="flex flex-col gap-2">
                <FloatingInput
                  label="Ngày dự kiến"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />

                <div className="flex justify-between items-center px-1 py-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Tổng tiền (VNĐ):
                  </span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Submit_GoBack name="Sửa" />
        </div>

        {/* CỘT PHẢI: CHI TIẾT MÓN HÀNG (Giao diện Đen) */}
        <div className="flex-1 bg-[#0D121F]/40 border border-slate-900 p-5 rounded-2xl shadow-xl backdrop-blur-md relative z-20">
          <div className="flex items-center justify-between mb-6">
            <TitleManagement color="violet">Chi tiết món hàng</TitleManagement>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-sky-500/10 text-sky-400 border border-sky-500/20 py-2 px-4 rounded-lg font-bold hover:bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.05)] transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> Thêm món hàng
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2 pb-60 custom-scrollbar relative z-30">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-[#111827]/40 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-all duration-150 relative"
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
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
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
