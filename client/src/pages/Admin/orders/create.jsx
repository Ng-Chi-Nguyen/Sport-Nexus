import { useState, useMemo } from "react";
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axiosClient";
import { formatCurrency } from "@/utils/formatters";
import { useLoaderData } from "react-router-dom";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
  { title: "Thêm đơn hàng mới", route: "#" },
];

const CreateOrderPage = () => {
  const response = useLoaderData();
  // console.log(response);
  // state form
  const [items, setItems] = useState([
    {
      id: Date.now(),
      product_variant_id: "",
      quantity: 1,
      price_at_purchase: 0,
    },
  ]);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("CASH");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [discount, setDiscount] = useState(""); // tiền giảm
  const [final, setFinal] = useState(0); // tiền trả thực tế
  const [code, setCode] = useState("");

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        product_variant_id: "",
        quantity: 1,
        price_at_purchase: 0,
      },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  // 1. Tính Tạm tính (Tổng tiền hàng)
  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc + Number(item.quantity || 0) * Number(item.price_at_purchase || 0)
      );
    }, 0);
  }, [items]);

  // 2. Tính Tổng cuối (Sau khi trừ giảm giá)
  const finalAmount = useMemo(() => {
    const result = totalAmount - Number(discount || 0);
    return result > 0 ? result : 0;
  }, [totalAmount, discount]);

  const variantsOptions = useMemo(
    () =>
      response.productVariants.data.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [response.productVariants.data],
  );

  const handleMethodChange = (methodName) => {
    setMethod(methodName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      total_amount: final,
      total_cost: totalCost,
      status: selectStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        unit_cost_price: Number(item.cost),
      })),
    };
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <h2>Tạo đơn hàng mới</h2>

      <form onSubmit={handleSubmit} className="flex gap-5 items-start">
        <div className="w-1/4 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="blue">Thông tin khách hàng</TitleManagement>
            <div className="flex flex-col gap-4">
              <FloatingInput
                label="Email khách hàng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                label="Địa chỉ giao hàng"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="orange">
              Thanh toán & Mã giảm giá
            </TitleManagement>
            <div className="flex flex-col gap-4">
              <SelectPro
                label="Phương thức thanh toán"
                options={[
                  { id: "MOMO", name: "Ví MoMo" },
                  { id: "CASH", name: "Tiền mặt" },
                ]}
                value={method}
                onChange={handleMethodChange}
              />
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <FloatingInput
                    label="Mã giảm giá"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  // onClick={handleApplyCoupon} // Hàm gọi API kiểm tra
                  className="h-[46px] px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-[5px] text-[11px] font-black hover:bg-blue-100 transition-all uppercase tracking-wider"
                >
                  K.tra
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="emerald">Tổng kết đơn hàng</TitleManagement>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Số tiền giảm:</span>
                <span>{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-green-500 border-t pt-2 text-lg font-black">
                <span>Tổng cuối:</span>
                <span>{formatCurrency(finalAmount)}</span>
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM (75%) */}
        <div className="flex-1 bg-white p-5 rounded-[5px] border border-gray-200">
          <div className="flex justify-between items-start">
            <TitleManagement color="blue">
              Danh sách sản phẩm mua
            </TitleManagement>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-[5px] text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
          </div>

          <div className="flex flex-col gap-4 min-h-[550px] max-h-[550px] overflow-y-auto pr-2 custom-scrollbar pb-20">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-[5px] border border-gray-200 relative"
                style={{ zIndex: items.length - index }} // Chống ẩn Select
              >
                <div className="flex-1">
                  <SelectPro
                    value={item.variantId}
                    options={variantsOptions}
                    onChange={(val) =>
                      handleItemChange(item.id, "variantId", val)
                    }
                    label="Sản phẩm"
                  />
                </div>
                <div className="w-24">
                  <FloatingInput
                    label="SL"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="w-40">
                  <FloatingInput
                    label="Đơn giá"
                    type="number"
                    value={item.price_at_purchase}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "price_at_purchase",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="w-[70px]">
                  <span className="text-xs font-bold text-blue-600">
                    {formatCurrency(item.quantity * item.price_at_purchase)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItems(items.filter((i) => i.id !== item.id))
                  }
                  className="p-2 text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
