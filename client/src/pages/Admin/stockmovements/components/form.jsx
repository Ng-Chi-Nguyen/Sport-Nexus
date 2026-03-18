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

const FormStock = (props) => {
  const { orders, variants, purchases } = props;

  const [orderItems, setOrderItems] = useState([]);
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
          setOrderItems(response.data || []);
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

  console.log(orderItems);

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
  // console.log(orders);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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
                    const rem = item.quantity - (item.quantity_received || 0);
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
                          <div>
                            <p className="text-xs font-medium">
                              Nhập về: {item.quantity}
                            </p>
                            <p className="text-xs font-bold text-orange-500">
                              Cần: {rem}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                variant_id: item.product_variant_id,
                                quantity: rem,
                              }))
                            }
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Chọn
                          </button>
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
