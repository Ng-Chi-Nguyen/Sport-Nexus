import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import addressData from "@/assets/data/addressVN_afterUpdate.json";
import orderApi from "@/api/customer/orderApi";
import addressApi from "@/api/customer/addressApi";
import paymentApi from "@/api/customer/paymentApi";
import useCoupon from "@/hooks/useCoupon";
import EmptyCart from "./components/EmptyCart";
import OrderSuccess from "./components/OrderSuccess";
import ContactSection from "./components/ContactSection";
import AddressSection from "./components/AddressSection";
import PaymentSection from "./components/PaymentSection";
import OrderSummary from "./components/OrderSummary";
import ConfirmModal from "./components/ConfirmModal";
import ShowToast from "@/components/ui/toast";
import { CreditCard } from "lucide-react";
import { TitleWithIcon } from "@/components/ui/title";

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
  const [paymentInfo, setPaymentInfo] = useState(null);
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

        const norm = (s = "") =>
          s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^(thanh pho|tinh|tp\.?\s*)/, "")
            .replace(/\s+/g, " ")
            .trim();

        const findProvince = () => {
          const code = loc.province?.code?.toString().padStart(2, "0");
          if (code) {
            const byCode = addressData.find((p) => p.Code === code);
            if (byCode) return byCode;
          }
          const name =
            typeof loc.province === "string"
              ? loc.province
              : loc.province?.name;
          if (name) {
            const key = norm(name);
            return addressData.find((p) => norm(p.FullName) === key);
          }
          return null;
        };

        const province = findProvince();
        if (province) setProvinceCode(province.Code);

        const wards = province?.Wards || [];
        const findWard = () => {
          const code = loc.ward?.code?.toString().padStart(5, "0");
          if (code) {
            const byCode = wards.find((w) => w.Code === code);
            if (byCode) return byCode;
          }
          const name = typeof loc.ward === "string" ? loc.ward : loc.ward?.name;
          if (name) {
            const key = norm(name);
            return wards.find((w) => norm(w.FullName) === key);
          }
          return null;
        };

        const ward = findWard();
        if (ward) setWardCode(ward.Code);
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

  const orderPayload = useMemo(
    () => ({
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
    }),
    [
      totalAmount,
      finalAmount,
      discount,
      fullAddress,
      paymentMethod,
      couponCode,
      email,
      items,
    ],
  );

  const handlePlaceOrder = useCallback(() => {
    if (couponCode && !localStorage.getItem("accessToken")) {
      ShowToast("error", "Vui lòng đăng nhập để dùng mã giảm giá");
      return;
    }
    if (!fullAddress) return;
    if (!email.trim()) return;
    setShowConfirm(true);
  }, [fullAddress, email, couponCode]);

  const handleConfirmOrder = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await orderApi.create(orderPayload);
      if (!res.success) throw new Error(res.message || "Tạo đơn thất bại");
      const order = res.data;
      setOrderResult(order);

      const isOnline = [
        "BANK_TRANSFER",
        "MOMO",
        "CREDIT_CARD",
        "VNPAY",
      ].includes(paymentMethod);
      if (!isOnline) {
        setShowConfirm(false);
        return;
      }

      const payRes = await paymentApi.createPayment(order.id, {
        method: paymentMethod,
        channel: paymentMethod,
      });
      if (payRes?.data?.checkoutUrl) {
        window.location.href = payRes.data.checkoutUrl;
      } else {
        setPaymentInfo(payRes?.data || null);
        setShowConfirm(false);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [orderPayload, paymentMethod]);

  if (!items.length) {
    return <EmptyCart />;
  }

  if (orderResult) {
    return (
      <OrderSuccess
        orderId={orderResult.id}
        paymentMethod={paymentMethod}
        paymentInfo={paymentInfo}
      />
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Thanh toán", route: "" },
          ]}
        />

        <TitleWithIcon icon={CreditCard} title="Thanh toán đơn hàng" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-6">
            <ContactSection
              email={email}
              onChange={(e) => setEmail(e.target.value)}
            />

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
