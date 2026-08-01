import { FloatingInput } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { SelectPro } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { Submit_GoBack } from "@/components/ui/button";
import FloatingTextarea from "@/components/ui/textarea";
import { TitleManagement } from "@/components/ui/title";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { getRemainingQuantity, resolveSelectedQuantity } from "./form.utils";
import stockMovementApi from "@/api/management/stockMovementApi";
import orderApi from "@/api/customer/orderApi";
import { queryClient } from "@/lib/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FormStock = (props) => {
  const { t } = useTranslation("translation", { keyPrefix: "stockMovement" });
  const navigate = useNavigate();
  const { orders, purchases } = props;

  const [orderItems, setOrderItems] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [formData, setFormData] = useState({
    type: "IN",
    quantity: 0,
    order: "",
    variant_id: "",
    reason: "",
  });

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!formData.order) {
        setOrderItems([]);
        setSelectedQuantities({});
        return;
      }

      setIsLoadingItems(true);
      try {
        let response;
        if (formData.type === "IN") {
          response = await purchaseOrderdApi.getItems(formData.order);
        } else if (formData.type === "OUT") {
          response = await orderApi.getItems(formData.order);
        }

        if (response && response.success) {
          const items = response.data || [];
          const initialSelectedQuantities = items.reduce((acc, item) => {
            const remaining = getRemainingQuantity(item);
            acc[item.id] = remaining;
            return acc;
          }, {});

          setOrderItems(items);
          setSelectedQuantities(initialSelectedQuantities);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || t("fetch_items_error"),
        );
        console.error("Lỗi fetch:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchOrderItems();
  }, [formData.order, formData.type, t]);

  const orderOptions_Purchase = useMemo(() => {
    return purchases.map((purchase) => {
      const statusLabels = {
        PENDING: t("status_pending"),
        RECEIVED: t("status_received"),
        PARTIALLY_RECEIVED: t("status_partial"),
        CANCELLED: t("status_cancelled"),
      };

      const statusText = statusLabels[purchase.status] || t("status_unknown");

      return {
        id: purchase.id,
        name: `${purchase.supplier?.name} - ${formatDate(purchase.order_date)} - ${formatDate(purchase.expected_delivery_date)} - [${statusText}]`,
      };
    });
  }, [purchases, t]);

  const orderOptions_Order = useMemo(() => {
    return orders.map((order) => ({
      id: order.id,
      name: `#${order.id} - ${order.user_email || t("walkin_customer")} - ${formatCurrency(order.final_amount)}`,
    }));
  }, [orders, t]);

  const handleTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value, order: "", reason: "" }));
  };

  const handleOrderChange = (value) => {
    setFormData((prev) => ({ ...prev, order: value }));
  };

  const handleSelectedQuantityChange = (itemId, value, max) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: resolveSelectedQuantity(value, max),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type !== "ADJUSTMENT" && !formData.order) {
      toast.error(t("select_order_error"));
      return;
    }

    const formattedItems = orderItems
      .map((item) => {
        const inputQty =
          selectedQuantities[item.id] ?? getRemainingQuantity(item);
        return {
          product_variant_id: item.product_variant?.id || item.variant_id,
          quantity: Number(inputQty),
        };
      })
      .filter((item) => item.quantity > 0);

    const finalPayload = {
      type: formData.type,
      order_id: formData.type === "ADJUSTMENT" ? null : formData.order,
      reason: formData.reason,
      items: formData.type === "ADJUSTMENT" ? [] : formattedItems,
    };

    try {
      const response =
        formData.type === "OUT"
          ? await stockMovementApi.export(finalPayload)
          : await stockMovementApi.import(finalPayload);
      if (response && response.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["orders-select"] }),
          queryClient.invalidateQueries({ queryKey: ["variants-select"] }),
          queryClient.invalidateQueries({
            queryKey: ["purchase-orders-select"],
          }),
        ]);

        toast.success(response.message || t("update_success"));
        navigate("/management/stocks");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("submit_failed"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-4 w-full items-start text-slate-800 dark:text-slate-100 transition-colors duration-200"
    >
      <div className="flex flex-col gap-4 w-full lg:w-2/5 relative z-20">
        <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-6 transition-colors duration-200">
          <div>
            <TitleManagement color="emerald">{t("movement_type_title")}</TitleManagement>
            <div className="mt-3">
              <SelectPro
                label={t("type_label")}
                value={formData.type}
                options={[
                  { id: "IN", name: t("type_in") },
                  { id: "OUT", name: t("type_out") },
                  { id: "ADJUSTMENT", name: t("type_adjustment") },
                ]}
                onChange={handleTypeChange}
              />
            </div>
          </div>

          {formData.type !== "ADJUSTMENT" && (
            <div className="border-t border-slate-200 dark:border-white/5 pt-4">
              <TitleManagement color="violet">{t("details_title")}</TitleManagement>
              <div className="mt-3">
                <SelectPro
                  label={t("order_label")}
                  value={formData.order}
                  options={
                    formData.type === "IN"
                      ? orderOptions_Purchase
                      : formData.type === "OUT"
                        ? orderOptions_Order
                        : []
                  }
                  onChange={handleOrderChange}
                />
              </div>
            </div>
          )}
        </div>

        <Submit_GoBack justify="start" />
      </div>

      <div className="w-full lg:w-3/5 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md min-h-[420px] relative z-10 transition-colors duration-200">
        {formData.type === "ADJUSTMENT" ? (
          <div className="space-y-4">
            <TitleManagement color="blue">{t("adjustment_reason_title")}</TitleManagement>
            <div className="pt-2">
              <FloatingTextarea
                id="reason_textarea"
                label={t("reason_label")}
                placeholder=" "
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                required
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <TitleManagement color="blue">
              {t("items_title_prefix")}
              {formData.type === "IN" ? t("items_title_in") : t("items_title_out")}
              {t("items_title_suffix")}
            </TitleManagement>

            <div className="mt-4 overflow-y-auto space-y-3 max-h-[500px] pr-1 custom-scrollbar">
              {isLoadingItems ? (
                <div className="py-20 text-center animate-pulse text-slate-400 dark:text-slate-500 font-medium text-sm tracking-wide">
                  {t("loading_items")}
                </div>
              ) : orderItems.length > 0 ? (
                orderItems.map((item) => {
                  const rem = getRemainingQuantity(item);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 bg-slate-50/80 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl hover:border-sky-500/30 hover:bg-slate-100 dark:hover:bg-[#161F32]/50 transition-all duration-150"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-200 text-sm truncate">
                          {item.product_variant?.product?.name ||
                            t("product_name")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          {t("current_stock")}{" "}
                          <span className="text-slate-700 dark:text-slate-400">
                            {item.product_variant?.stock ?? 0}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 justify-between sm:justify-end">
                        <div className="w-24">
                          <FloatingInput
                            label={t("quantity_label")}
                            type="number"
                            min={1}
                            max={rem}
                            value={selectedQuantities[item.id] ?? rem}
                            onChange={(e) =>
                              handleSelectedQuantityChange(
                                item.id,
                                e.target.value,
                                rem,
                              )
                            }
                          />
                        </div>

                        <div className="text-right min-w-[85px] font-medium text-xs space-y-1">
                          <p className="text-slate-500 dark:text-slate-400">
                            {t("total_order")}{" "}
                            <span className="font-mono">{item.quantity}</span>
                          </p>
                          <p className="text-amber-600 dark:text-amber-400/90 bg-amber-50 dark:bg-amber-500/5 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/10 font-semibold tracking-wide text-center">
                            {t("need")} {rem}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center text-slate-400 dark:text-slate-500 italic text-sm tracking-wide">
                  {formData.order
                    ? t("no_reference_items")
                    : t("select_order_first")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default FormStock;
