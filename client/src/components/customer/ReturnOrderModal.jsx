import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatters";
import orderApi from "@/api/customer/orderApi";
import ShowToast from "@/components/ui/toast";

const ReturnOrderModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (orderItemId) => {
    setSelectedItems(prev =>
      prev.includes(orderItemId)
        ? prev.filter(id => id !== orderItemId)
        : [...prev, orderItemId]
    );
  };

  const handleReturn = async () => {
    if (selectedItems.length === 0) {
      ShowToast.error(t("return_select_items", "Vui lòng chọn ít nhất một sản phẩm để trả"));
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.returnOrder(order.id, {
        items: selectedItems.map(id => ({ order_item_id: id })),
        reason: reason || null
      });
      ShowToast("success", t("return_success", "Yêu cầu trả hàng thành công"));
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || t("return_error", "Không thể xử lý yêu cầu trả hàng");
      ShowToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors duration-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("return_title", "Trả hàng hoàn tiền")}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("return_description", "Chọn các sản phẩm bạn muốn trả hàng. Số tiền hoàn lại sẽ được xử lý trong 3-5 ngày làm việc.")}
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("return_select_products", "Chọn sản phẩm trả")}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {order.OrderItems?.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedItems.includes(item.id)
                      ? "bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30"
                      : "bg-slate-50 dark:bg-[#111827]/40 border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    disabled={submitting}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_variant?.product?.name}</p>
                    <p className="text-xs text-slate-500">x{item.quantity} - {formatCurrency(item.price_at_purchase)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("return_reason", "Lý do trả hàng")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("return_reason_placeholder", "Nhập lý do trả hàng (không bắt buộc)...")}
              disabled={submitting}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#111827]/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer rounded-md"
          >
            {t("cancel_button", "Hủy")}
          </button>
          <button
            type="button"
            onClick={handleReturn}
            disabled={submitting || selectedItems.length === 0}
            className="flex-1 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer rounded-md"
          >
            {submitting ? (
              <span>{t("return_submitting", "Đang xử lý...")}</span>
            ) : (
              <>
                <RotateCcw size={16} />
                <span>{t("return_submit", "Trả hàng")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderModal;
