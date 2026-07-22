import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import addressData from "@/assets/data/addressVN_afterUpdate.json";
import orderApi from "@/api/customer/orderApi";
import addressApi from "@/api/customer/addressApi";
import useCoupon from "@/hooks/useCoupon";
import EmptyCart from "./components/EmptyCart";
import OrderSuccess from "./components/OrderSuccess";
import ContactSection from "./components/ContactSection";
import AddressSection from "./components/AddressSection";
import PaymentSection from "./components/PaymentSection";
import OrderSummary from "./components/OrderSummary";
import ConfirmModal from "./components/ConfirmModal";

const Checkout = () => {
  const location = useLocation();
  const items = location.state?.items || [];

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [detailAddress, setDetailAddress] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    addressApi
      .getAll(user.id)
      .then((res) => {
        const list = res?.data;
        if (!Array.isArray(list) || list.length === 0) return;
        const addr = list.find((a) => a.is_default) || list[0];
        const loc = addr.location_data || {};
        const pCode = loc.province?.code?.toString().padStart(2, "0");
        const wCode = loc.ward?.code?.toString().padStart(5, "0");
        if (pCode) setProvinceCode(pCode);
        if (wCode) setWardCode(wCode);
        if (addr.detail_address) setDetailAddress(addr.detail_address);
      })
      .catch(() => {});
  }, [user?.id]);

  const {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading: couponLoading,
    applyCoupon,
    clearCoupon,
  } = useCoupon();

  const selectedProvince = useMemo(
    () => addressData.find((p) => p.Code === provinceCode),
    [provinceCode],
  );

  const wards = useMemo(
    () =>
      selectedProvince?.Districts?.length
        ? selectedProvince.Districts
        : selectedProvince?.Wards || [],
    [selectedProvince],
  );

  const selectedWardName =
    wards.find((w) => w.Code === wardCode)?.FullName || "";
  const selectedProvinceName = selectedProvince?.FullName || "";

  const fullAddress = [detailAddress, selectedWardName, selectedProvinceName]
    .filter(Boolean)
    .join(", ");

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

  const orderPayload = useMemo(() => ({
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
  }), [totalAmount, finalAmount, discount, fullAddress, paymentMethod, couponCode, items]);

  const handlePlaceOrder = useCallback(() => {
    if (!fullAddress) return;
    if (!email.trim()) return;
    setShowConfirm(true);
  }, [fullAddress, email]);

  const handleConfirmOrder = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await orderApi.create(orderPayload);
      if (res.success) {
        setOrderResult(res.data);
        setShowConfirm(false);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [orderPayload]);

  if (!items.length) {
    return <EmptyCart />;
  }

  if (orderResult) {
    return <OrderSuccess orderId={orderResult.id} />;
  }

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
          <div className="md:col-span-3 space-y-6">
            <ContactSection email={email} onChange={(e) => setEmail(e.target.value)} />

            <AddressSection
              provinces={addressData}
              provinceCode={provinceCode}
              onProvinceChange={(code) => {
                setProvinceCode(code);
                setWardCode("");
              }}
              wards={wards}
              wardCode={wardCode}
              onWardChange={setWardCode}
              detailAddress={detailAddress}
              onDetailAddressChange={(e) => setDetailAddress(e.target.value)}
            />

            <PaymentSection value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <div className="md:col-span-2 space-y-4 sticky top-4">
            <OrderSummary
              items={items}
              totalAmount={totalAmount}
              discount={discount}
              finalAmount={finalAmount}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              onApplyCoupon={() => applyCoupon(totalAmount, couponCode)}
              onClearCoupon={clearCoupon}
              couponMsg={couponMsg}
              couponLoading={couponLoading}
              couponData={couponData}
              submitting={submitting}
              fullAddress={fullAddress}
              email={email}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmOrder}
        submitting={submitting}
        data={{
          items,
          totalAmount,
          discount,
          finalAmount,
          email,
          fullAddress,
          paymentMethod,
          couponCode,
        }}
      />
    </div>
  );
};

export default Checkout;
