import { useState, useMemo } from "react";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
// components
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
// utils
import { formatCurrency } from "@/utils/formatters";
// api
import couponApi from "@/api/management/couponApi";
import orderApi from "@/api/customer/orderApi";
// lib
import { queryClient } from "@/lib/react-query";
import { formatFullDateTime } from "@/utils/formatters";

const breadcrumbData = [
  { title: <LayoutDashboard size={20} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
  { title: "Chỉnh sửa đơn hàng", route: "#" },
];

const EditOrderPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();
  const orderData = response.order.data;

  // --- KHỞI TẠO STATE TỪ LOADER DATA ---
  const [items, setItems] = useState(
    orderData.OrderItems.map((item) => ({
      id: item.id,
      variantId: item.product_variant_id,
      quantity: Number(item.quantity),
      price_at_purchase: Number(item.price_at_purchase),
    })),
  );

  const [email, setEmail] = useState(orderData.user_email || "");
  const [address, setAddress] = useState(orderData.shipping_address || "");
  const [method, setMethod] = useState(orderData.payment_method || "COD");
  const [paymentStatus, setPaymentStatus] = useState(
    orderData.payment_status || "Pending",
  );
  const [discount, setDiscount] = useState(
    Number(orderData.discount_amount) || 0,
  );
  const [final, setFinal] = useState(Number(orderData.final_amount) || 0);
  const [code, setCode] = useState(orderData.coupon_code || "");
  const [status, setStatus] = useState(orderData.status || "Processing");

  // --- LOGIC TÍNH TOÁN & HANDLERS (Giữ nguyên như Create) ---
  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc + Number(item.quantity || 0) * Number(item.price_at_purchase || 0)
      );
    }, 0);
  }, [items]);

  const variantsOptions = useMemo(
    () =>
      response.productVariants.data.map((v) => ({
        id: v.id,
        name: `${v.product.name} - ${v.VariableAttributes[0].attributeKey.name}: ${v.VariableAttributes[0].value}`,
      })),
    [response.productVariants.data],
  );

  const handleItemChange = (itemId, field, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
    setDiscount(0); // Reset giảm giá khi thay đổi giỏ hàng để yêu cầu check lại
    setFinal(0);
  };

  const handleApplyCoupon = async () => {
    try {
      const resCoupon = await couponApi.check({
        amount: totalAmount,
        code: code,
      });
      if (resCoupon.success) {
        toast.success(resCoupon.message);
        setDiscount(resCoupon.data.discount);
        setFinal(resCoupon.data.newAmount);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi kiểm tra mã!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmountToSend = final === 0 ? totalAmount : final;

    const dataToSend = {
      total_amount: Number(totalAmount),
      status,
      discount_amount: Number(discount),
      final_amount: Number(finalAmountToSend),
      shipping_address: address,
      coupon_code: code || null,
      user_email: email || null,
      payment_method: method,
      payment_status: paymentStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        price_at_purchase: Number(item.price_at_purchase),
      })),
    };
    console.log(dataToSend);
    try {
      // Giả sử API update của bạn là orderApi.update(id, data)
      const res = await orderApi.update(orderData.id, dataToSend);
      if (res.success) {
        await Promise.all([
          queryClient.setQueryData(["order", orderData.id], response.data),
          queryClient.resetQueries({ queryKey: ["orders"] }),
        ]);
        toast.success(res.message);
        navigate("/management/orders");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumbs data={breadcrumbData} />
      <div className="flex justify-between items-center my-4">
        <h2 className="text-xl font-bold">
          Chỉnh sửa đơn hàng #{orderData.id}
        </h2>
        <span className="text-xs text-slate-400 italic">
          Ngày tạo: {formatFullDateTime(orderData.created_at)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 items-start">
        {/* CỘT TRÁI: THÔNG TIN CHUNG */}
        <div className="w-1/4 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-[5px] border border-gray-200 shadow-sm">
            <TitleManagement color="cyan">Khách hàng</TitleManagement>
            <div className="space-y-4">
              <FloatingInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                label="Địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200 shadow-sm">
            <TitleManagement color="orange">Khuyến mãi</TitleManagement>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FloatingInput
                  label="Mã coupon"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-[46px] px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-[5px] text-[11px] font-black hover:bg-blue-100 uppercase transition-all"
              >
                K.tra
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200 shadow-sm">
            <TitleManagement color="emerald">Thanh toán</TitleManagement>
            <div className="space-y-2 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-blue-600 border-t pt-2 text-lg font-black">
                <span>Tổng cuối:</span>
                <span>
                  {discount !== 0
                    ? formatCurrency(final)
                    : formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
          <Submit_GoBack name="sữa" />
        </div>

        {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & TRẠNG THÁI */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-[5px] border border-gray-200 shadow-sm">
            <TitleManagement color="violet">
              Trạng thái hệ thống
            </TitleManagement>
            <div className="flex gap-4">
              <div className="flex-1">
                <SelectPro
                  label="Phương thức"
                  options={[
                    { id: "MOMO", name: "MoMo" },
                    { id: "COD", name: "Tiền mặt" },
                  ]}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <div className="flex-1">
                <SelectPro
                  label="Đơn hàng"
                  options={[
                    { id: "Processing", name: "Chuẩn bị" },
                    { id: "Shipping", name: "Đang giao" },
                    { id: "Delivered", name: "Đã giao" },
                  ]}
                  value={status}
                  onChange={setStatus}
                />
              </div>
              <div className="flex-1">
                <SelectPro
                  label="Thanh toán"
                  options={[
                    { id: "Pending", name: "Chờ" },
                    { id: "Paid", name: "Đã trả" },
                  ]}
                  value={paymentStatus}
                  onChange={setPaymentStatus}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[5px] border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <TitleManagement color="blue">
                Danh sách sản phẩm ({items.length})
              </TitleManagement>
              <button
                type="button"
                onClick={() =>
                  setItems([
                    ...items,
                    {
                      id: Date.now(),
                      variantId: "",
                      quantity: 1,
                      price_at_purchase: 0,
                    },
                  ])
                }
                className="bg-blue-600 text-white px-3 py-2 rounded-[5px] text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Thêm món
              </button>
            </div>

            <div className="space-y-3 min-h-[550px] max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-[5px] border border-slate-100"
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
                  <div className="w-20">
                    <FloatingInput
                      label="SL"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <FloatingInput
                      label="Giá"
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
                  <div className="w-28 text-right font-bold text-blue-600 text-sm">
                    {formatCurrency(item.quantity * item.price_at_purchase)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setItems(items.filter((i) => i.id !== item.id))
                    }
                    className="p-2 text-slate-300 hover:text-rose-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditOrderPage;
