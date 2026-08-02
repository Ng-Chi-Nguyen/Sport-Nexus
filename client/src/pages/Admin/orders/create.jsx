import { useState, useMemo } from "react";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
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
import { useTranslation } from "react-i18next";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();
  const { t } = useTranslation("translation", { keyPrefix: "order" });

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("business_management"), route: "" },
    { title: t("order_management"), route: "/management/orders" },
    { title: t("add_order_breadcrumb"), route: "#" },
  ];

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
      ShowToast("error", t("many_items_error"));
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
        name: `${v.product?.name || t("unknown_product")}${variantLabel}`,
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
        ShowToast("success", resCoupon.message);
        setDiscount(resCoupon.data.discount);
        setFinal(resCoupon.data.newAmount);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      ShowToast("error", errorMessage);
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
        ShowToast("success", response.message);
        navigate(-1);
      }
    } catch (error) {
      console.log(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
        {t("create_order_title")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI (THÔNG TIN KHÁCH HÀNG & TỔNG KẾT) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4">
          {/* CARD: THÔNG TIN KHÁCH HÀNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="cyan">
              {t("customer_info_title")}
            </TitleManagement>
            <div className="flex flex-col gap-5 mt-3">
              <FloatingInput
                label={t("customer_email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                label={t("shipping_address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* CARD: MÃ GIẢM GIÁ */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="orange">
              {t("payment_coupon")}
            </TitleManagement>
            <div className="flex gap-3 items-end mt-3">
              <div className="flex-1">
                <FloatingInput
                  label={t("coupon_code")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-[46px] px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex-shrink-0 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20"
              >
                {t("check_btn")}
              </button>
            </div>
          </div>

          {/* CARD: TỔNG KẾT ĐƠN HÀNG */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="emerald">
              {t("order_summary")}
            </TitleManagement>
            <div className="space-y-3 text-sm font-medium mt-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t("subtotal")}</span>
                <span className="font-mono text-slate-800 dark:text-slate-300">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t("discount_amount")}</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                  -{formatCurrency(discount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 border-t pt-3 text-base font-black border-slate-200 dark:border-slate-800/80">
                <span>{t("final_total")}</span>
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
            <TitleManagement color="violet">{t("order_info")}</TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label={t("payment_method")}
                  options={[
                    { id: "MOMO", name: t("momo_wallet") },
                    { id: "COD", name: t("cash") },
                  ]}
                  value={method}
                  onChange={handleMethodChange}
                />
              </div>
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label={t("order_status")}
                  options={[
                    { id: "Processing", name: t("status_processing") },
                    { id: "Shipping", name: t("status_shipping") },
                    { id: "Delivered", name: t("status_delivered") },
                    { id: "Cancelled", name: t("status_cancelled") },
                    { id: "Refunded", name: t("status_refunded") },
                  ]}
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>
              <div className="w-full sm:w-1/3">
                <SelectPro
                  label={t("payment_status")}
                  options={[
                    { id: "Pending", name: t("pay_pending") },
                    { id: "Paid", name: t("pay_paid") },
                    { id: "Failed", name: t("pay_failed") },
                    { id: "Refunded", name: t("pay_refunded") },
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
                {t("product_list_title")}
              </TitleManagement>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-150 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20 shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} /> {t("add_product")}
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
                      label={t("product_label")}
                    />
                  </div>

                  {/* Số lượng */}
                  <div className="w-full sm:w-24 flex-shrink-0">
                    <FloatingInput
                      label={t("quantity")}
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
                      label={t("unit_price")}
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
