import { FloatingInput } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { SelectPro } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { Submit_GoBack } from "@/components/ui/button";
import FloatingTextarea from "@/components/ui/textarea";
import { TitleManagement } from "@/components/ui/title";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { getRemainingQuantity, resolveSelectedQuantity } from "./form.utils";
import stockMovementApi from "@/api/management/stockMovementApi";
import orderApi from "@/api/customer/orderApi";
import { queryClient } from "@/lib/react-query";
import { useNavigate } from "react-router-dom";

const FormStock = (props) => {
  const navigate = useNavigate();
  const { orders, variants, purchases } = props;

  const [orderItems, setOrderItems] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [formData, setFormData] = useState({
    type: "IN",
    quantity: 0,
    order: "",
    variant_id: "",
    reason: "",
  });

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!formData.order) {
        setOrderItems([]);
        setSelectedQuantities({});
        return;
      }

      setIsLoadingItems(true);
      try {
        let response;
        if (formData.type === "IN") {
          response = await purchaseOrderdApi.getItems(formData.order);
        } else if (formData.type === "OUT") {
          response = await orderApi.getItems(formData.order);
        }

        if (response && response.success) {
          const items = response.data || [];
          const initialSelectedQuantities = items.reduce((acc, item) => {
            const remaining = getRemainingQuantity(item);
            acc[item.id] = remaining;
            return acc;
          }, {});

          setOrderItems(items);
          setSelectedQuantities(initialSelectedQuantities);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể tải chi tiết đơn hàng!",
        );
        console.error("Lỗi fetch:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchOrderItems();
  }, [formData.order, formData.type]);

  const orderOptions_Purchase = useMemo(() => {
    return purchases.map((purchase) => {
      const statusLabels = {
        PENDING: "Chờ",
        RECEIVED: "Đủ",
        PARTIALLY_RECEIVED: "1 phần",
        CANCELLED: "Hủy",
      };

      const statusText = statusLabels[purchase.status] || "Không xác định";

      return {
        id: purchase.id,
        name: `${purchase.supplier?.name} - ${formatDate(purchase.order_date)} - ${formatDate(purchase.expected_delivery_date)} - [${statusText}]`,
      };
    });
  }, [purchases]);

  const orderOptions_Order = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      name: `#${order.id} - ${order.user_email || "Khách tại quầy"} - ${formatCurrency(order.final_amount)}`,
    }));
  }, [orders]);

  const variantsOptions = useMemo(
    () =>
      variants.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [variants],
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value, order: "", reason: "" }));
  };

  const handleOrderChange = (value) => {
    setFormData((prev) => ({ ...prev, order: value }));
  };

  const handleSelectedQuantityChange = (itemId, value, max) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: resolveSelectedQuantity(value, max),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type !== "ADJUSTMENT" && !formData.order) {
      toast.error("Vui lòng chọn đơn hàng tham chiếu!");
      return;
    }

    const formattedItems = orderItems
      .map((item) => {
        const inputQty =
          selectedQuantities[item.id] ?? getRemainingQuantity(item);
        return {
          product_variant_id: item.product_variant?.id || item.variant_id,
          quantity: Number(inputQty),
        };
      })
      .filter((item) => item.quantity > 0);

    const finalPayload = {
      type: formData.type,
      order_id: formData.type === "ADJUSTMENT" ? null : formData.order,
      reason: formData.reason,
      items: formData.type === "ADJUSTMENT" ? [] : formattedItems,
    };

    try {
      const response =
        formData.type === "OUT"
          ? await stockMovementApi.export(finalPayload)
          : await stockMovementApi.import(finalPayload);
      if (response && response.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders-select"] }),
          queryClient.invalidateQueries({ queryKey: ["variants-select"] }),
          queryClient.invalidateQueries({
            queryKey: ["purchase-orders-select"],
          }),
        ]);

        toast.success(response.message || "Cập nhật kho thành công!");
        navigate("/management/stocks");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi dữ liệu thất bại!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 w-full items-start">
      <div className="flex flex-col gap-4 w-2/5 relative z-20">
        {/* GOM CHUNG VÀO 1 HỘP CONTAINER DUY NHẤT */}
        <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-6">
          {/* PHẦN 1: LOẠI BIẾN ĐỘNG */}
          <div>
            <TitleManagement color="emerald">Loại biến động</TitleManagement>
            <div className="mt-3">
              <SelectPro
                label="Loại"
                value={formData.type}
                options={[
                  { id: "IN", name: "Nhập hàng" },
                  { id: "OUT", name: "Xuất hàng" },
                  { id: "ADJUSTMENT", name: "Điều chỉnh" },
                ]}
                onChange={handleTypeChange}
              />
            </div>
          </div>

          {/* PHẦN 2: CHI TIẾT ĐƠN THAM CHIẾU */}
          {formData.type !== "ADJUSTMENT" && (
            <div className="border-t border-white/5 pt-4">
              <TitleManagement color="violet">Chi tiết</TitleManagement>
              <div className="mt-3">
                <SelectPro
                  label="Đơn hàng"
                  value={formData.order}
                  options={
                    formData.type === "IN"
                      ? orderOptions_Purchase
                      : formData.type === "OUT"
                        ? orderOptions_Order
                        : []
                  }
                  onChange={handleOrderChange}
                />
              </div>
            </div>
          )}
        </div>

        <Submit_GoBack justify="start" />
      </div>

      {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM THAM CHIẾU HOẶC LÝ DO (60% RỘNG - relative z-10) */}
      <div className="w-3/5 bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md min-h-[420px] relative z-10">
        {formData.type === "ADJUSTMENT" ? (
          <div className="space-y-4">
            <TitleManagement color="blue">Lý do điều chỉnh</TitleManagement>
            <div className="pt-2">
              <FloatingTextarea
                id="reason_textarea"
                label="Giải thích thay đổi"
                placeholder=" "
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                required
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <TitleManagement color="blue">
              Danh sách sản phẩm (
              {formData.type === "IN" ? "Đơn Nhập" : "Đơn Bán"})
            </TitleManagement>

            {/* DANH SÁCH SẢN PHẨM CON TỐI MỜ */}
            <div className="mt-4 overflow-y-auto space-y-3 max-h-[500px] pr-1 custom-scrollbar">
              {isLoadingItems ? (
                <div className="py-20 text-center animate-pulse text-slate-500 font-medium text-sm tracking-wide">
                  Đang tải chi tiết đơn hàng...
                </div>
              ) : orderItems.length > 0 ? (
                orderItems.map((item) => {
                  const rem = getRemainingQuantity(item);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-[#111827]/40 border border-slate-800/60 rounded-xl hover:border-sky-500/30 hover:bg-[#161F32]/50 transition-all duration-150"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-semibold text-slate-200 text-sm truncate">
                          {item.product_variant?.product?.name ||
                            "Tên sản phẩm"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          Tồn kho hiện tại:{" "}
                          <span className="text-slate-400">
                            {item.product_variant?.stock ?? 0}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Thanh ô gõ số lượng nhập */}
                        <div className="w-24">
                          <FloatingInput
                            label="Số lượng"
                            type="number"
                            min={1}
                            max={rem}
                            value={selectedQuantities[item.id] ?? rem}
                            onChange={(e) =>
                              handleSelectedQuantityChange(
                                item.id,
                                e.target.value,
                                rem,
                              )
                            }
                          />
                        </div>

                        {/* Nhãn thống kê số lượng gốc */}
                        <div className="text-right min-w-[85px] font-medium text-xs space-y-1">
                          <p className="text-slate-400">
                            Tổng đơn:{" "}
                            <span className="font-mono">{item.quantity}</span>
                          </p>
                          <p className="text-amber-400/90 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-semibold tracking-wide text-center">
                            Cần: {rem}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center text-slate-500 italic text-sm tracking-wide">
                  {formData.order
                    ? "Đơn hàng này không có sản phẩm tham chiếu."
                    : "Vui lòng chọn đơn hàng bên trái để kiểm tra danh sách."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default FormStock;
