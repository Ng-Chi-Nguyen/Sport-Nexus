import { FloatingInput } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { SelectPro } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { Submit_GoBack } from "@/components/ui/button";
import FloatingTextarea from "@/components/ui/textarea";
import { TitleManagement } from "@/components/ui/title";

const FormStock = (props) => {
  const { orders, variants } = props;
  const [formData, setFormData] = useState({
    type: "IN",
    quantity: 0,
    order: "",
    variant_id: "",
    reason: "",
  });

  const orderOptions = useMemo(() => {
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

  const variantOptions = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      // Tạo nhãn hiển thị: #ID - Email - Số tiền
      name: `#${order.id} - ${order.user_email || "Khách tại quầy"} - ${formatCurrency(order.final_amount)}`,
    }));
  }, [orders]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value, reason: "" }));
  };

  const handleorderChange = (value) => {
    setFormData((prev) => ({ ...prev, order: value }));
  };

  const handleReasonChange = (value) => {
    setFormData((prev) => ({ ...prev, reason: value }));
  };
  // console.log(orders);

  return (
    <>
      <form className="flex gap-2">
        <div className="flex flex-col gap-3 w-1/3">
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
              options={orderOptions}
              onChange={handleorderChange}
            />
            <SelectPro
              label="Món hàng"
              value={formData.variant_id}
              options={variantsOptions}
              onChange={handleorderChange}
            />
            <FloatingInput
              label="Số lượng"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
            />
          </div>

          <Submit_GoBack />
        </div>
        <div className=" w-2/3 border border-gray-200 rounded-[5px] p-3">
          <TitleManagement color="blue">Mô tả thây đổi</TitleManagement>
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
      </form>
    </>
  );
};

export default FormStock;
