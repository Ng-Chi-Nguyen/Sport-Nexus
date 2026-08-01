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
import { formatCurrency } from "@/utils/formatters";
// api
import couponApi from "@/api/management/couponApi";
import orderApi from "@/api/customer/orderApi";
// lib
import { queryClient } from "@/lib/react-query";

const breadcrumbData = [
  { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
  { title: "Quản lý kinh doanh", route: "" },
  { title: "Đơn hàng", route: "/management/orders" },
  { title: "Thêm đơn hàng mới", route: "#" },
];

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();

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
  const [method, setMethod] = useState("COD");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [discount, setDiscount] = useState(0);
  const [final, setFinal] = useState(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Processing");

  const handleAddItem = () => {
    if (items.length >= 10) {
      toast.error("Nếu số lượng món hàng lớn hơn 10 món hãy nhập bằng file");
      return;
    }

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
    setDiscount(0);
    setFinal(0);
  };

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
      const hasAttributes =
        v.VariableAttributes && v.VariableAttributes.length > 0;

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

  const handleMethodChange = (methodName) => {
    setMethod(methodName);
  };
  const handleStatusChange = (status) => {
    setStatus(status);
  };
  const handlePaymentStatusChange = (paymentStatus) => {
    setPaymentStatus(paymentStatus);
  };

  const handleApplyCoupon = async () => {
    const dataCouponToSend = {
      amount: totalAmount,
      code: code,
    };
    try {
      const resCoupon = await couponApi.check(dataCouponToSend);
      if (resCoupon.success) {
        toast.success(resCoupon.message);
        setDiscount(resCoupon.data.discount);
        setFinal(resCoupon.data.newAmount);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalAmountToSend = final === 0 ? totalAmount : final;
    const dataToSend = {
      total_amount: totalAmount,
      status: status,
      discount_amount: discount,
      final_amount: finalAmountToSend,
      shipping_address: address,
      coupon_code: code || null,
      user_email: email,
      payment_method: method,
      payment_status: paymentStatus,
      items: items.map((item) => ({
        product_variant_id: Number(item.variantId),
        quantity: Number(item.quantity),
        price_at_purchase: Number(item.price_at_purchase),
      })),
    };
    try {
      const response = await orderApi.create(dataToSend);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        Tạo đơn hàng mới
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI (THÔNG TIN KHÁCH HÀNG & TỔNG KẾT) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
          {/* CARD: THÔNG TIN KHÁCH HÀNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="cyan">Thông tin khách hàng</TitleManagement>
            <div className="flex flex-col gap-5 mt-3">
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

          {/* CARD: MÃ GIẢM GIÁ */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="orange">
              Thanh toán & Mã giảm giá
            </TitleManagement>
            <div className="flex gap-3 items-end mt-3">
              <div className="flex-1">
                <FloatingInput
                  label="Mã giảm giá"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-[46px] px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex-shrink-0 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20"
              >
                K.tra
              </button>
            </div>
          </div>

          {/* CARD: TỔNG KẾT ĐƠN HÀNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="emerald">Tổng kết đơn hàng</TitleManagement>
            <div className="space-y-3 text-sm font-medium mt-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tạm tính:</span>
                <span className="font-mono text-slate-800 dark:text-slate-300">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Số tiền giảm:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                  -{formatCurrency(discount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 border-t pt-3 text-base font-black border-slate-200 dark:border-slate-800/80">
                <span>Tổng cuối:</span>
                <span className="font-mono px-2.5 py-0.5 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                  {discount !== 0
                    ? formatCurrency(final)
                    : formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <Submit_GoBack />
        </div>

        {/* CỘT PHẢI (THÔNG TIN ĐƠN HÀNG & DANH SÁCH MÓN HÀNG) */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* CARD: THÔNG TIN ĐƠN HÀNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 relative z-20 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="violet">Thông tin đơn hàng</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label="Phương thức thanh toán"
                  options={[
                    { id: "MOMO", name: "Ví MoMo" },
                    { id: "COD", name: "Tiền mặt" },
                  ]}
                  value={method}
                  onChange={handleMethodChange}
                />
              </div>
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label="Trạng thái đơn hàng"
                  options={[
                    { id: "Processing", name: "Chuẩn bị hàng" },
                    { id: "Shipping", name: "Đang giao" },
                    { id: "Delivered", name: "Đã giao" },
                    { id: "Cancelled", name: "Hủy" },
                    { id: "Refunded", name: "Trả hàng" },
                  ]}
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label="Trạng thái thanh toán"
                  options={[
                    { id: "Pending", name: "Chờ thanh toán" },
                    { id: "Paid", name: "Đã thanh toán" },
                    { id: "Failed", name: "Thanh toán thất bại" },
                    { id: "Refunded", name: "Hoàn tiền" },
                  ]}
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                />
              </div>
            </div>
          </div>

          {/* CARD: DANH SÁCH SẢN PHẨM MUA */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 relative z-10 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <div className="flex justify-between items-center mb-5">
              <TitleManagement color="blue">
                Danh sách sản phẩm mua
              </TitleManagement>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-150 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20 shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} /> Thêm sản phẩm
              </button>
            </div>

            {/* VÙNG SCROLL CHỨA CÁC ITEM DÒNG SẢN PHẨM */}
            <div className="flex flex-col gap-3 min-h-[500px] max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-10">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border relative transition-all duration-150 bg-slate-50/80 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800/60"
                  style={{ zIndex: items.length - index }}
                >
                  {/* Select sản phẩm */}
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
                  <div className="w-full sm:w-24 flex-shrink-0">
                    <FloatingInput
                      label="SL"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "quantity", e.target.value)
                      }
                    />
                  </div>

                  {/* Đơn giá */}
                  <div className="w-full sm:w-36 flex-shrink-0">
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

                  {/* Thành tiền từng item */}
                  <div className="w-full sm:w-[100px] text-left sm:text-right pr-2 flex-shrink-0 flex items-center sm:block">
                    <span className="text-xs font-bold font-mono px-2 py-1 rounded border bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/5 dark:text-sky-400 dark:border-sky-500/10">
                      {formatCurrency(item.quantity * item.price_at_purchase)}
                    </span>
                  </div>

                  {/* Nút xóa item */}
                  <button
                    type="button"
                    onClick={() => {
                      setItems(items.filter((i) => i.id !== item.id));
                      setDiscount(0);
                      setFinal(0);
                    }}
                    className="p-2 self-end sm:self-auto text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-150 flex-shrink-0"
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

export default CreateOrderPage;
