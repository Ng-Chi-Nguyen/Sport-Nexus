import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import addressData from "@/assets/data/addressVN_afterUpdate.json";
import orderApi from "@/api/customer/orderApi";
import addressApi from "@/api/customer/addressApi";
import { resolveLocation } from "@/utils/location";
import paymentApi from "@/api/customer/paymentApi";
import useCoupon from "@/hooks/useCoupon";
import loyaltyApi from "@/api/customer/loyaltyApi";
import useMemberDiscount from "@/hooks/useMemberDiscount";
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
import { useTranslation } from "react-i18next";

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const items = useMemo(() => {
    const rawItems = location.state?.items || [];
    return rawItems.map((item) => ({
      ...item,
      name: item.name || item.product?.name || "",
      attributes:
        item.attributes?.length > 0
          ? item.attributes
          : (item.variant?.VariableAttributes || []).map((va) => ({
              name: va.attributeKey?.name,
              value: va.value,
            })),
    }));
  }, [location.state?.items]);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [email, setEmail] = useState(user?.email || "");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  const memberPercent = useMemberDiscount();

  const handleApplyPoints = async (points) => {
    setPointsLoading(true);
    try {
      const res = await loyaltyApi.applyPoints(points);
      setPointsDiscount(res?.data?.discount || 0);
      ShowToast("success", res?.message || "Áp dụng điểm thành công");
    } catch (err) {
      ShowToast(
        "error",
        err?.response?.data?.message || "Áp dụng điểm thất bại",
      );
    } finally {
      setPointsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    addressApi
      .getAll(user.id)
      .then((res) => {
        const list = res?.data;
        if (!Array.isArray(list) || list.length === 0) return;
        const addr = list.find((a) => a.is_default) || list[0];
        const loc = addr.location_data || {};

        const { provinceCode, wardCode } = resolveLocation(loc);

        if (provinceCode) setProvinceCode(provinceCode);
        if (wardCode) setWardCode(wardCode);
        if (addr.detail_address) setDetailAddress(addr.detail_address);
        if (addr.recipient_name) setRecipientName(addr.recipient_name);
        if (addr.recipient_phone) setRecipientPhone(addr.recipient_phone);
        if (user?.email) setEmail(user.email);
      })
      .catch(() => {});
  }, [user?.id, user?.email]);

  const {
    couponCode,
    setCouponCode,
    couponMsg,
    couponData,
    loading: couponLoading,
    applyCoupon,
    clearCoupon,
  } = useCoupon();

  const carriedCoupon = location.state?.couponCode || "";

  useEffect(() => {
    if (!carriedCoupon || couponCode || totalAmount <= 0) return;
    setCouponCode(carriedCoupon);
    applyCoupon(totalAmount, carriedCoupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const tierDiscount = Math.round((totalAmount * memberPercent) / 100);
  const finalAmount =
    (couponData?.newAmount ?? totalAmount) - tierDiscount - pointsDiscount;

  const grandTotal = finalAmount;

  const orderPayload = useMemo(
    () => ({
      total_amount: totalAmount,
      final_amount: grandTotal,
      discount_amount: discount + tierDiscount + pointsDiscount,
      points_discount_amount: pointsDiscount,
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
      grandTotal,
      discount,
      tierDiscount,
      pointsDiscount,
      fullAddress,
      paymentMethod,
      couponCode,
      email,
      items,
    ],
  );

  const handlePlaceOrder = useCallback(() => {
    if (couponCode && !localStorage.getItem("accessToken")) {
      ShowToast("error", t("toast_login_required_coupon"));
      return;
    }
    if (!fullAddress) return;
    if (!email.trim()) return;
    if (!recipientName.trim() || !recipientPhone.trim()) {
      ShowToast("error", t("toast_recipient_info_required"));
      return;
    }
    setShowConfirm(true);
  }, [fullAddress, email, couponCode, recipientName, recipientPhone, t]);

  const handleConfirmOrder = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await orderApi.create(orderPayload);
      if (!res.success) throw new Error(res.message || t("error_create_order"));
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
        error.response?.data?.message || error.message || t("error_generic");
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [orderPayload, paymentMethod, t]);

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
        <div className="mt-10">
          <Breadcrumbs
            data={[
              { title: t("breadcrumb_home"), route: "/" },
              { title: t("detail_product"), route: "-1" },
              { title: t("breadcrumb_checkout"), route: "" },
            ]}
          />
        </div>

        <TitleWithIcon icon={CreditCard} title={t("breadcrumb_checkout")} />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-6">
            <ContactSection
              email={email}
              name={recipientName}
              phone={recipientPhone}
              onChange={(key, value) => {
                if (key === "email") setEmail(value);
                else if (key === "name") setRecipientName(value);
                else if (key === "phone") setRecipientPhone(value);
              }}
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
              recipientName={recipientName}
              recipientPhone={recipientPhone}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              onApplyCoupon={(code) =>
                applyCoupon(totalAmount, code || couponCode)
              }
              onClearCoupon={clearCoupon}
              couponMsg={couponMsg}
              couponLoading={couponLoading}
              couponData={couponData}
              submitting={submitting}
              fullAddress={fullAddress}
              email={email}
              onPlaceOrder={handlePlaceOrder}
              pointsDiscount={pointsDiscount}
              onApplyPoints={handleApplyPoints}
              pointsLoading={pointsLoading}
              tierDiscount={tierDiscount}
              tierPercent={memberPercent}
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
          tierDiscount,
          tierPercent: memberPercent,
        }}
      />
    </div>
  );
};

export default Checkout;
