import { useState, useMemo } from "react";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import { FloatingInput } from "@/components/ui/input";
import { TitleManagement } from "@/components/ui/title";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Submit_GoBack } from "@/components/ui/button";
import { SelectPro } from "@/components/ui/select";
// utils
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
// api
import couponApi from "@/api/management/couponApi";
import orderApi from "@/api/customer/orderApi";
// lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
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

  // --- LOGIC TÍNH TOÁN & HANDLERS ---
  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc + Number(item.quantity || 0) * Number(item.price_at_purchase || 0)
      );
    }, 0);
  }, [items]);

  const variantsOptions = useMemo(() => {
    if (!response?.productVariants?.data) return [];

    return response.productVariants.data.map((v) => {
      // Kiểm tra xem sản phẩm có thuộc tính biến thể hay không
      const hasAttributes =
        Array.isArray(v.VariableAttributes) && v.VariableAttributes.length > 0;

      // Trích xuất an toàn qua Optional Chaining
      const attrName = hasAttributes
        ? v.VariableAttributes[0]?.attributeKey?.name
        : "";
      const attrValue = hasAttributes ? v.VariableAttributes[0]?.value : "";

      // Tạo nhãn: có biến thể thì hiển thị kèm theo, không có thì chỉ hiện tên sản phẩm gốc
      const variantLabel = hasAttributes ? ` - ${attrName}: ${attrValue}` : "";

      return {
        id: v.id,
        name: `${v.product?.name || "Sản phẩm không rõ tên"}${variantLabel}`,
      };
    });
  }, [response?.productVariants?.data]);

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
    try {
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
    <div className="animate-in fade-in duration-500 space-y-4">
      <Breadcrumbs data={breadcrumbData} />

      {/* KHỐI TIÊU ĐỀ ĐƠN HÀNG TRÊN NỀN TỐI */}
      <div className="flex justify-between items-center my-2">
        <h2 className="text-xl font-bold text-slate-100 tracking-wide">
          Chỉnh sửa đơn hàng #{orderData.id}
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Ngày tạo: {formatFullDateTime(orderData.created_at)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & DÒNG TIỀN (30% CHIỀU RỘNG) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
          {/* CARD: KHÁCH HÀNG */}
          <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <TitleManagement color="cyan">Khách hàng</TitleManagement>
            <div className="flex flex-col gap-5 mt-3">
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

          {/* CARD: KHUYẾN MÃI */}
          <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <TitleManagement color="orange">Khuyến mãi</TitleManagement>
            <div className="flex gap-3 items-end mt-3">
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
                className="h-[46px] px-4 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg text-xs font-bold hover:bg-sky-500/20 transition-all uppercase tracking-wider flex-shrink-0"
              >
                K.tra
              </button>
            </div>
          </div>

          {/* CARD: THANH TOÁN */}
          <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <TitleManagement color="emerald">Thanh toán</TitleManagement>
            <div className="space-y-3 text-sm font-medium mt-4">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính:</span>
                <span className="font-mono text-slate-300">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Giảm giá:</span>
                <span className="font-mono text-rose-400">
                  -{formatCurrency(discount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 border-t border-slate-800/80 pt-3 text-base font-black">
                <span>Tổng cuối:</span>
                <span className="font-mono bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                  {discount !== 0
                    ? formatCurrency(final)
                    : formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <Submit_GoBack name="Sửa đơn" />
        </div>

        {/* CỘT PHẢI: TRẠNG THÁI HỆ THỐNG & SẢN PHẨM MUA */}
        <div className="flex-1 flex flex-col gap-4">
          {/* CARD: TRẠNG THÁI HỆ THỐNG (ĐÃ FIX: Thêm relative z-20 để dropdown nổi lên trên) */}
          <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md relative z-20">
            <TitleManagement color="violet">
              Trạng thái hệ thống
            </TitleManagement>
            <div className="flex gap-4 mt-3">
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

          {/* CARD: DANH SÁCH SẢN PHẨM MUA (ĐÃ FIX: Thêm relative z-10 để nằm dưới tầng dropdown) */}
          <div className="bg-[#0D121F]/40 border border-slate-900 rounded-xl p-5 shadow-xl backdrop-blur-md relative z-10">
            <div className="flex justify-between items-center mb-5">
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
                className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.05)] transition-all duration-150"
              >
                <Plus size={16} strokeWidth={2.5} /> Thêm món
              </button>
            </div>

            {/* DANH SÁCH DÒNG SẢN PHẨM MUA */}
            <div className="flex flex-col gap-3 min-h-[500px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-10">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-[#111827]/40 border border-slate-800/60 rounded-xl relative transition-all duration-150"
                  style={{ zIndex: items.length - index }}
                >
                  {/* Trường chọn biến thể sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <SelectPro
                      value={item.variantId}
                      options={variantsOptions}
                      onChange={(val) =>
                        handleItemChange(item.id, "variantId", val)
                      }
                      label="Sản phẩm"
                    />
                  </div>

                  {/* Số lượng */}
                  <div className="w-24 flex-shrink-0">
                    <FloatingInput
                      label="SL"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>

                  {/* Đơn giá mua */}
                  <div className="w-36 flex-shrink-0">
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

                  {/* Tổng tiền của dòng sản phẩm */}
                  <div className="w-[110px] text-right pr-2 flex-shrink-0">
                    <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/5 px-2 py-1 rounded border border-sky-500/10">
                      {formatCurrency(item.quantity * item.price_at_purchase)}
                    </span>
                  </div>

                  {/* Nút xóa dòng sản phẩm */}
                  <button
                    type="button"
                    onClick={() =>
                      setItems(items.filter((i) => i.id !== item.id))
                    }
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-150 flex-shrink-0"
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
