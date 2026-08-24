import { useState } from "react";
import { X, AlertTriangle, Coins, Building2, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import orderApi from "@/api/customer/orderApi";
import ShowToast from "@/components/ui/toast";

const CancelOrderModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [submitting, setSubmitting] = useState(false);
  const [refundMethod, setRefundMethod] = useState(null);
  const [refundNote, setRefundNote] = useState("");

  const isPaidOrder = order.payment_status === "Paid";

  const handleCancel = async () => {
    if (isPaidOrder && !refundMethod) {
      ShowToast("error", t("select_refund_method", "Vui lòng chọn phương thức hoàn tiền"));
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.cancel(order.id, { refund_method: refundMethod, refund_note: refundNote });
      ShowToast("success", t("cancel_success", "Hủy đơn hàng thành công"));
      onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || t("cancel_error", "Không thể hủy đơn hàng");
      ShowToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl w-full max-w-md text-slate-800 dark:text-slate-100 transition-colors duration-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t("cancel_title", "Xác nhận hủy đơn")}
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
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-md">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t("cancel_warning", "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.")}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 p-3 space-y-2 text-sm rounded-md">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t("order_code")}</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{t("total_amount")}</span>
              <span className="font-medium">{order.final_amount?.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Refund Method Selection for Paid Orders */}
          {isPaidOrder && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("select_refund_method", "Chọn phương thức hoàn tiền")}
              </p>
              
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    refundMethod === "coins"
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_method"
                    value="coins"
                    checked={refundMethod === "coins"}
                    onChange={() => setRefundMethod("coins")}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Coins size={18} className="text-amber-500" />
                      <span className="font-medium text-sm">{t("refund_coins", "Đổi thành xu")}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("refund_coins_desc", "Nhận {{amount}} xu tương đương số tiền hoàn. Có thể sử dụng cho đơn hàng sau.", { amount: order.final_amount?.toLocaleString() })}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                    refundMethod === "bank_transfer"
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_method"
                    value="bank_transfer"
                    checked={refundMethod === "bank_transfer"}
                    onChange={() => setRefundMethod("bank_transfer")}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-blue-500" />
                      <span className="font-medium text-sm">{t("refund_bank", "Chuyển khoản ngân hàng")}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("refund_bank_desc", "Yêu cầu hoàn tiền về tài khoản ngân hàng. Nhân viên sẽ xử lý trong vòng 1-3 ngày làm việc.")}
                    </p>
                  </div>
                </label>
              </div>

              {/* Note for bank transfer */}
              {refundMethod === "bank_transfer" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MessageSquare size={14} />
                    <span>{t("refund_note_label", "Ghi chú (tùy chọn)")}</span>
                  </div>
                  <textarea
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder={t("refund_note_placeholder", "Nhập thông tin tài khoản ngân hàng hoặc ghi chú khác...")}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer rounded-md"
          >
            {t("cancel_button", "Giữ đơn")}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || (isPaidOrder && !refundMethod)}
            className="flex-1 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer rounded-md"
          >
            {submitting ? (
              <span>{t("cancelling", "Đang hủy...")}</span>
            ) : (
              <span>{t("confirm_cancel", "Hủy đơn hàng")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
