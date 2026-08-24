import { useState, useMemo } from "react";
import { LayoutDashboard, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
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
import { useTranslation } from "react-i18next";

const EditOrderPage = () => {
  const navigate = useNavigate();
  const response = useLoaderData();
  const orderData = response.order.data;
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [completingRefund, setCompletingRefund] = useState(false);

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("business_management"), route: "" },
    { title: t("order_management"), route: "/management/orders" },
    { title: t("edit_order_breadcrumb"), route: "#" },
  ];

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
      const hasAttributes =
        Array.isArray(v.VariableAttributes) && v.VariableAttributes.length > 0;

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

  const handleItemChange = (itemId, field, value) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
    setDiscount(0);
    setFinal(0);
  };

  const handleApplyCoupon = async () => {
    try {
      const resCoupon = await couponApi.check({
        amount: totalAmount,
        code: code,
      });
      if (resCoupon.success) {
        ShowToast("success", resCoupon.message);
        setDiscount(resCoupon.data.discount);
        setFinal(resCoupon.data.newAmount);
      }
    } catch (error) {
      ShowToast(
        "error",
        error.response?.data?.message || t("coupon_check_error"),
      );
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
        ShowToast("success", res.message);
        navigate("/management/orders");
      }
    } catch (error) {
      console.error(error.message);
      ShowToast("error", error.response?.data?.message || t("update_failed"));
    }
  };

  const handleCompleteRefund = async () => {
    setCompletingRefund(true);
    try {
      const res = await orderApi.completeRefund(orderData.id);
      if (res.success) {
        await queryClient.resetQueries({ queryKey: ["orders"] });
        await queryClient.invalidateQueries({ queryKey: ["order", orderData.id] });
        ShowToast("success", res.message);
        window.location.reload();
      }
    } catch (error) {
      ShowToast("error", error.response?.data?.message || t("update_failed"));
    } finally {
      setCompletingRefund(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* KHỐI TIÊU ĐỀ ĐƠN HÀNG */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 my-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide">
          {t("edit_order_title")} #{orderData.id}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {t("created_date")} {formatFullDateTime(orderData.created_at)}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 items-start w-full"
      >
        {/* CỘT TRÁI */}
        <div className="w-full lg:w-[33%] flex-shrink-0 flex flex-col gap-4">
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="cyan">{t("customer_card")}</TitleManagement>
            <div className="flex flex-col gap-5 mt-3">
              <FloatingInput
                label={t("email_label")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FloatingInput
                label={t("address_label")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="orange">{t("promo_card")}</TitleManagement>
            <div className="flex gap-3 items-end mt-3">
              <div className="flex-1">
                <FloatingInput
                  label={t("coupon_label")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-[46px] px-4 rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex-shrink-0 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20 cursor-pointer"
              >
                {t("check_btn")}
              </button>
            </div>
          </div>

          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="emerald">
              {t("payment_card")}
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

          {/* CARD: THÔNG TIN HOÀN TIỀN */}
          {orderData.status === "Cancelled" && orderData.refund_method && (
            <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
              <TitleManagement color="red">
                {t("refund_info_title", "Thông tin hoàn tiền")}
              </TitleManagement>
              <div className="space-y-3 text-sm mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">{t("refund_method_label", "Phương thức")}</span>
                  <span className={`font-bold px-2.5 py-1 rounded-md border ${
                    orderData.refund_method === "coins"
                      ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                      : "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                  }`}>
                    {orderData.refund_method === "coins" ? t("refund_coins_label", "Đổi thành xu") : t("refund_bank_label", "Chuyển khoản ngân hàng")}
                  </span>
                </div>
                {orderData.refund_method === "bank_transfer" && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">{t("refund_status_label", "Trạng thái")}</span>
                    <span className={`font-bold px-2.5 py-1 rounded-md border ${
                      orderData.refund_status === "completed"
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                        : "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"
                    }`}>
                      {orderData.refund_status === "completed" ? t("refund_completed", "Đã hoàn thành") : t("refund_pending", "Chờ xử lý")}
                    </span>
                  </div>
                )}
                {orderData.refunded_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t("refund_date_label", "Ngày yêu cầu")}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{formatFullDateTime(orderData.refunded_at)}</span>
                  </div>
                )}
                {orderData.refund_note && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{t("refund_note_label", "Ghi chú từ khách")}</span>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {orderData.refund_note}
                    </p>
                  </div>
                )}
                {orderData.refund_method === "bank_transfer" && orderData.refund_status === "pending" && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleCompleteRefund}
                      disabled={completingRefund}
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completingRefund ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {t("refund_mark_completed", "Đã chuyển khoản hoàn tiền")}
                    </button>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 italic text-center">
                      {t("refund_bank_reminder", "Xác nhận đã chuyển khoản hoàn tiền về tài khoản khách hàng.")}
                    </p>
                  </div>
                )}
                {orderData.refund_method === "bank_transfer" && orderData.refund_status === "completed" && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("refund_completed_message", "Đã xử lý hoàn tiền chuyển khoản")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Submit_GoBack name={t("submit_edit")} />
        </div>

        {/* CỘT PHẢI */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 relative z-20 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <TitleManagement color="violet">
              {t("system_status_title")}
            </TitleManagement>
            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <div className="flex-1">
                <SelectPro
                  label={t("method_label")}
                  options={[
                    { id: "MOMO", name: "MoMo" },
                    { id: "COD", name: t("cash") },
                  ]}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <div className="flex-1">
                <SelectPro
                  label={t("order_short")}
                  options={[
                    { id: "Processing", name: t("status_processing_short") },
                    { id: "Shipping", name: t("status_shipping_short") },
                    { id: "Delivered", name: t("status_delivered_short") },
                  ]}
                  value={status}
                  onChange={setStatus}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
              {t(
                "payment_status_readonly_note",
                "Trạng thái thanh toán được cập nhật tự động bởi cổng thanh toán.",
              )}
            </p>
          </div>

          {/* CARD: DANH SÁCH SẢN PHẨM MUA */}
          <div className="rounded-xl p-5 shadow-xl backdrop-blur-md border transition-colors duration-200 relative z-10 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
              <TitleManagement color="blue">
                {t("product_list_count")} ({items.length})
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
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 border bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 dark:hover:bg-sky-500/20 shadow-sm cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} /> {t("add_item")}
              </button>
            </div>

            {/* DANH SÁCH DÒNG SẢN PHẨM MUA - TỐI ƯU MOBILE */}
            <div className="flex flex-col gap-3 min-h-[500px] max-h-[500px] overflow-y-auto pr-1 custom-scrollbar pb-10">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl border relative transition-all duration-150 bg-slate-50/80 border-slate-200 dark:bg-[#111827]/40 dark:border-slate-800/60"
                  style={{ zIndex: items.length - index }}
                >
                  {/* Dòng 1: Biến thể sản phẩm */}
                  <div className="w-full min-w-0">
                    <SelectPro
                      value={item.variantId}
                      options={variantsOptions}
                      onChange={(val) =>
                        handleItemChange(item.id, "variantId", val)
                      }
                      label={t("product_label")}
                    />
                  </div>

                  {/* Dòng 2: Số lượng, Đơn giá, Thành tiền và Nút xóa */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
                    <div className="flex-1">
                      <FloatingInput
                        label={t("quantity")}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1 sm:w-36">
                      <FloatingInput
                        label={t("price_label")}
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

                    <div className="col-span-2 sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                      <span className="text-xs font-bold font-mono px-2.5 py-2 rounded-lg border bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/5 dark:text-sky-400 dark:border-sky-500/10 text-center">
                        {formatCurrency(item.quantity * item.price_at_purchase)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setItems(items.filter((i) => i.id !== item.id))
                        }
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-150 cursor-pointer"
                        title={t("delete")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
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
