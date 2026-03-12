import { FloatingInput } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { SelectPro } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { Submit_GoBack } from "@/components/ui/button";
import FloatingTextarea from "@/components/ui/textarea";
import { TitleManagement } from "@/components/ui/title";
import { formatDate } from "@/utils/formatters";

const FormStock = (props) => {
  const { orders, variants, purchases } = props;
  const [formData, setFormData] = useState({
    type: "IN",
    quantity: 0,
    order: "",
    variant_id: "",
    reason: "",
  });

  // console.log(purchases);

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
    [variants.data],
  );

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value, reason: "" }));
  };

  const handleOrderChange = (value) => {
    setFormData((prev) => ({ ...prev, order: value }));
    console.log(formData);
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
        <div className=" w-3/5 border border-gray-200 rounded-[5px] p-3">
          {formData.type === "ADJUSTMENT" ? (
            <div className="space-y-4">
              <TitleManagement color="blue">Mô tả thay đổi</TitleManagement>
              <FloatingTextarea
                id="reason"
                label="Giải thích thay đổ"
                placeholder="Dùng cho điều chỉnh còn lại không nhập"
                value={formData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                isLocked={formData.type !== "ADJUSTMENT"}
                required={formData.type === "ADJUSTMENT"}
              />
            </div>
          ) : formData.type === "IN" ? (
            <>
              <TitleManagement color="blue">
                Chi tiết đơn hàng (Nhập)
              </TitleManagement>
              {purchaseItems && (
                <div className="mt-4">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Sản phẩm
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Số lượng
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Giá nhập
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.data.map((item) => (
                        <tr key={item.id} className="bg-white border-b">
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {item.product_variant.product.name}
                          </th>
                          <td className="px-6 py-4">{item.quantity}</td>
                          <td className="px-6 py-4">
                            {formatCurrency(item.unit_cost_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : formData.type === "OUT" ? (
            <TitleManagement color="blue">
              Chi tiết đơn hàng (Bán)
            </TitleManagement>
          ) : (
            <p className="text-gray-400 italic">
              Vui lòng chọn loại biến động...
            </p>
          )}
        </div>
      </form>
    </>
  );
};

export default FormStock;
