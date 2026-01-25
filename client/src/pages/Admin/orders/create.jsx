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

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
  { title: "Thêm đơn hàng mới", route: "#" },
];

const CreateOrderPage = () => {
  const [items, setItems] = useState([
    { id: Date.now(), variantId: "", quantity: 1, cost: 0 },
  ]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <h2>Tạo đơn hàng mới</h2>

      <form onSubmit={handleSubmit} className="flex gap-5 items-start">
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & THANH TOÁN (25%) */}
        <div className="w-1/4 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-[5px] border border-gray-200">
            <TitleManagement color="blue">Thông tin khách hàng</TitleManagement>
            <div className="flex flex-col gap-4">
              <FloatingInput
                label="Email khách hàng"
                // value={orderData.user_email}
                onChange={(e) => console.log(e.target.value)}
              />
              <FloatingInput
                label="Địa chỉ giao hàng"
                // value={orderData.shipping_address}
                onChange={(e) => console.log(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <TitleManagement color="orange">
              Thanh toán & Mã giảm giá
            </TitleManagement>
            <div className="flex flex-col gap-4">
              {/* <SelectPro
                label="Phương thức thanh toán"
                options={[
                  { id: "MOMO", name: "Ví MoMo" },
                  { id: "CASH", name: "Tiền mặt" },
                ]}
                value={orderData.payment_method}
                onChange={(e) => console.log(e.target.value)}
              /> */}
              <FloatingInput
                label="Mã giảm giá (nếu có)"
                // value={orderData.coupon_code}
                onChange={(e) => console.log(e.target.value)}
              />
              <FloatingInput
                label="Số tiền giảm"
                type="number"
                // value={orderData.discount_amount}
                onChange={(e) => console.log(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <TitleManagement color="emerald">Tổng kết đơn hàng</TitleManagement>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                {/* <span>{formatCurrency(totals.total)}</span> */}
              </div>
              <div className="flex justify-between text-red-500 border-t pt-2 text-lg font-black">
                <span>Tổng cuối:</span>
                {/* <span>{formatCurrency(totals.final)}</span> */}
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM (75%) */}
        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <TitleManagement color="blue">
              Danh sách sản phẩm mua
            </TitleManagement>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Plus size={16} /> Thêm sản phẩm
            </button>
          </div>

          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-20">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative"
                style={{ zIndex: items.length - index }} // Chống ẩn Select
              >
                <div className="flex-1">
                  <SelectPro
                    label="Chọn biến thể sản phẩm"
                    // value={item.product_variant_id}
                    options={[]} // Truyền variantOptions từ loader vào đây
                    onChange={(val) =>
                      handleItemChange(item.id, "product_variant_id", val)
                    }
                  />
                </div>
                <div className="w-24">
                  <FloatingInput
                    label="SL"
                    type="number"
                    // value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="w-40">
                  <FloatingInput
                    label="Đơn giá"
                    type="number"
                    // value={item.price_at_purchase}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "price_at_purchase",
                        e.target.value,
                      )
                    }
                  />
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
