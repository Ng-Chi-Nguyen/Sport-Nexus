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

  // console.log(purchases);

  useEffect(() => {
    const fetchOrderItems = async () => {
      // 1. Dừng nếu chưa có ID đơn hàng
      if (!formData.order) {
        setOrderItems([]);
        setSelectedQuantities({});
        return;
      }

      setIsLoadingItems(true);
      try {
        let response;
        // 2. Chuyển đổi linh hoạt giữa API Nhập (IN) và Xuất (OUT)
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
    // dependency array đầy đủ
  }, [formData.order, formData.type]);

  // console.log(orderItems);

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
      // Tạo nhãn hiển thị: #ID - Email - Số tiền
      name: `#${order.id} - ${order.user_email || "Khách tại quầy"} - ${formatCurrency(order.final_amount)}`,
    }));
  }, [orders]);

  const variantsOptions = useMemo(
    () =>
      variants.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [variants.data],
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value, reason: "" }));
  };

  const handleOrderChange = (value) => {
    setFormData((prev) => ({ ...prev, order: value }));
  };

  const handleVariantChange = (value) => {
    setFormData((prev) => ({ ...prev, variant_id: value }));
  };

  const handleReasonChange = (value) => {
    setFormData((prev) => ({ ...prev, reason: value }));
  };

  const handleSelectedQuantityChange = (itemId, value, max) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: resolveSelectedQuantity(value, max),
    }));
  };
  // console.log(orders);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra nếu là đơn Nhập/Xuất mà chưa chọn đơn hàng
    if (formData.type !== "ADJUSTMENT" && !formData.order) {
      toast.error("Vui lòng chọn đơn hàng tham chiếu!");
      return;
    }

    // 2. Gom danh sách sản phẩm và số lượng tương ứng từ cột bên phải
    const formattedItems = orderItems
      .map((item) => {
        const inputQty =
          selectedQuantities[item.id] ?? getRemainingQuantity(item);
        return {
          product_variant_id: item.product_variant?.id || item.variant_id,
          quantity: Number(inputQty),
        };
      })
      .filter((item) => item.quantity > 0); // Chỉ lấy sản phẩm có số lượng nhập lớn hơn 0

    // 3. Tạo Object chứa toàn bộ dữ liệu cuối cùng để Log
    const finalPayload = {
      type: formData.type,
      order_id: formData.type === "ADJUSTMENT" ? null : formData.order,
      reason: formData.reason,
      items: formData.type === "ADJUSTMENT" ? [] : formattedItems,
    };

    // 4. Chỉ thực hiện Log ra Console đúng yêu cầu của bạn
    console.log("=== DỮ LIỆU ĐÃ ĐƯỢC GOM ===");
    console.log(finalPayload);
    try {
      const response = await stockMovementApi.import(finalPayload);
      console.log(response);
      if (response && response.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders-select"] }),
          queryClient.invalidateQueries({ queryKey: ["variants-select"] }),
          queryClient.invalidateQueries({
            queryKey: ["purchase-orders-select"],
          }),
          // queryClient.invalidateQueries({ queryKey: ["stocks"] }),
        ]);

        toast.success(response.message || "Cập nhật kho thành công!");

        // 3. Chuyển hướng về trang quản lý kho hàng
        navigate("/management/stocks");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi dữ liệu thất bại!");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex flex-col gap-3 w-2/5">
          <div className="border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="emerald">Loại biến động</TitleManagement>
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
          <div className="flex flex-col gap-4 border border-gray-200 rounded-[5px] p-3">
            <TitleManagement color="violet">Chi tiết</TitleManagement>
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

          <Submit_GoBack justify="center" />
        </div>
        {/* CỘT PHẢI: CHI TIẾT ĐƠN HÀNG THAM CHIẾU */}
        <div className="w-3/5 border border-gray-200 rounded-[5px] p-3 min-h-[400px] bg-white">
          {formData.type === "ADJUSTMENT" ? (
            <div className="space-y-4">
              <TitleManagement color="blue">Lý do điều chỉnh</TitleManagement>
              <FloatingTextarea
                label="Giải thích thay đổi"
                placeholder="Nhập lý do xuất/nhập kho thủ công..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                required
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <TitleManagement color="blue">
                Danh sách sản phẩm (
                {formData.type === "IN" ? "Đơn Nhập" : "Đơn Bán"})
              </TitleManagement>

              <div className="mt-4 overflow-y-auto space-y-2">
                {isLoadingItems ? (
                  <div className="py-10 text-center animate-pulse text-gray-400">
                    Đang tải chi tiết...
                  </div>
                ) : orderItems.length > 0 ? (
                  orderItems.map((item) => {
                    const rem = getRemainingQuantity(item);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <div>
                          <p className="font-bold text-slate-700">
                            {item.product_variant?.product?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Tồn kho hiện tại: {item.product_variant?.stock}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="w-[90px]">
                            <FloatingInput
                              label="Số nhập"
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
                          <div>
                            <p className="text-xs font-medium">
                              Nhập về: {item.quantity}
                            </p>
                            <p className="text-xs font-bold text-orange-500">
                              Cần: {rem}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-gray-400 italic text-sm">
                    {formData.order
                      ? "Đơn hàng này không có sản phẩm."
                      : "Vui lòng chọn đơn hàng bên trái."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default FormStock;
