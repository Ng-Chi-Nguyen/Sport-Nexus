import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import addressData from "@/assets/data/addressVN_afterUpdate.json";
import orderApi from "@/api/customer/orderApi";
import addressApi from "@/api/customer/addressApi";
import { resolveLocation } from "@/utils/location";
import paymentApi from "@/api/customer/paymentApi";
import shippingApi from "@/api/customer/shippingApi";
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
  const [shippingEstimate, setShippingEstimate] = useState(null);

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

  const defaultWeight = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 1) * 500, 0),
    [items],
  );

  useEffect(() => {
    if (!selectedProvinceName || items.length === 0) return;
    let cancelled = false;
    shippingApi
      .calculate({
        province_name: selectedProvinceName,
        weight_grams: defaultWeight,
        service_type: "FAST",
        cod_amount: paymentMethod === "COD" ? finalAmount : 0,
        item_value: totalAmount,
      })
      .then((res) => {
        if (!cancelled) setShippingEstimate(res.data || null);
      })
      .catch(() => {
        if (!cancelled) setShippingEstimate(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    selectedProvinceName,
    items,
    defaultWeight,
    paymentMethod,
    finalAmount,
    totalAmount,
  ]);

  const hasShippingAddress = Boolean(selectedProvinceName && items.length > 0);
  const shippingFee = hasShippingAddress ? shippingEstimate?.totalFee || 0 : 0;
  const grandTotal = finalAmount + shippingFee;

  const orderPayload = useMemo(
    () => ({
      total_amount: totalAmount,
      final_amount: grandTotal,
      discount_amount: discount,
      shipping_address: fullAddress,
      payment_method: paymentMethod,
      coupon_code: couponCode || null,
      user_email: email || null,
      shipping_name: recipientName.trim() || null,
      shipping_phone: recipientPhone.trim() || null,
      province_name: selectedProvinceName || null,
      ward_name: selectedWardName || null,
      weight_grams: defaultWeight,
      service_type: "FAST",
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
      fullAddress,
      paymentMethod,
      couponCode,
      email,
      items,
      recipientName,
      recipientPhone,
      selectedProvinceName,
      selectedWardName,
      defaultWeight,
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
        trackingCode={orderResult?.shipment?.tracking_code}
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
              { title: t("breadcrumb_checkout"), route: "" },
            ]}
          />
        </div>

        <TitleWithIcon icon={CreditCard} title={t("page_heading")} />

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
              shippingFee={shippingFee}
              shippingEstimate={shippingEstimate}
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
          shippingFee,
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
