import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  Mail,
  Truck,
  ChevronLeft,
  Home,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { AddressSelector } from "@/components/ui/select";
import CouponInput from "@/pages/ProductDetail/components/CouponInput";
import { formatCurrency } from "@/utils/formatters";
import orderApi from "@/api/customer/orderApi";
import useCoupon from "@/hooks/useCoupon";

const PAYMENT_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: CreditCard },
  { value: "MOMO", label: "Ví MoMo", icon: CreditCard },
  { value: "VNPAY", label: "VNPay", icon: CreditCard },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = location.state?.items || [];

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [detailAddress, setDetailAddress] = useState("");
  const [addressParts, setAddressParts] = useState({ province: "", ward: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading: couponLoading,
    applyCoupon,
    clearCoupon,
  } = useCoupon();

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price_at_purchase * item.quantity,
        0,
      ),
    [items],
  );

  const discount = couponData?.discount ?? 0;
  const finalAmount = couponData?.newAmount ?? totalAmount;

  const fullAddress = [detailAddress, addressParts.ward, addressParts.province]
    .filter(Boolean)
    .join(", ");

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20">
        <ShoppingBag size={64} className="text-slate-300" />
        <p className="text-slate-500 text-lg">Giỏ hàng trống</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
        >
          Mua sắm ngay
        </button>
      </div>
    );
  }

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <ShoppingBag size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Đặt hàng thành công!
        </h2>
        <p className="text-slate-500">
          Mã đơn hàng:{" "}
          <span className="font-semibold text-slate-700">
            #{orderResult.id}
          </span>
        </p>
        <p className="text-slate-400 text-sm">
          Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm nhất.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!fullAddress) return;
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await orderApi.create({
        total_amount: totalAmount,
        final_amount: finalAmount,
        discount_amount: discount,
        shipping_address: fullAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        user_email: email || null,
        items: items.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
        })),
      });
      if (res.success) {
        setOrderResult(res.data);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Thanh toán", route: "" },
          ]}
        />

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-6">
          Thanh toán đơn hàng
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          {/* LEFT: Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Email */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                <Mail size={16} />
                Thông tin liên hệ
              </h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Shipping address */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                <MapPin size={16} />
                Địa chỉ giao hàng
              </h2>

              <AddressSelector
                initialProvince={user?.address || ""}
                initialWard={user?.address || ""}
                onAddressChange={({ province, ward }) =>
                  setAddressParts({ province, ward })
                }
              />

              <div className="relative">
                <Home
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="Số nhà, tên đường"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                <CreditCard size={16} />
                Phương thức thanh toán
              </h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                        paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-blue-600"
                      />
                      <Icon size={18} className="text-slate-500" />
                      <span className="text-sm text-slate-700">
                        {method.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="md:col-span-2 space-y-4 sticky top-4">
            <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                <ShoppingBag size={16} />
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 truncate">
                        {item.name || `SP #${item.product_variant_id}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        SL: {item.quantity}
                      </p>
                    </div>
                    <p className="text-slate-700 font-medium ml-2 shrink-0">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-slate-200" />

              <CouponInput
                couponCode={couponCode}
                onCodeChange={setCouponCode}
                onApply={() => applyCoupon(totalAmount, couponCode)}
                onClear={clearCoupon}
                message={couponMsg}
                loading={couponLoading}
                discount={couponData?.discount ?? null}
                oldAmount={couponData?.oldAmount ?? null}
                newAmount={couponData?.newAmount ?? null}
              />

              <hr className="border-slate-200" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <hr className="border-slate-200" />
                <div className="flex justify-between text-base font-bold text-slate-800">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !fullAddress || !email.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-1 w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft size={14} />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
