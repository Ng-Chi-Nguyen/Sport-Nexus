import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Loader2,
  Copy,
  Check,
  QrCode,
  Building,
  XCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import paymentApi from "@/api/customer/paymentApi";
import orderApi from "@/api/customer/orderApi";
import { ONLINE_METHODS, PAYMENT_STATUS_KEYS } from "@/constants/payment";
import { useTranslation } from "react-i18next";

const OrderSuccess = ({
  orderId,
  paymentMethod,
  paymentInfo,
  trackingCode,
  orderCode,
  providerStatus,
  cancelled,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  useEffect(() => {
    if (!cancelled || cancelDone) return;
    const email = JSON.parse(localStorage.getItem("user"))?.email || "";
    orderApi
      .cancelPending(orderId, email)
      .then(() => setCancelDone(true))
      .catch(() => setCancelDone(true));
  }, [cancelled, orderId, cancelDone]);

  useEffect(() => {
    if (
      !orderCode ||
      providerStatus !== "PAID" ||
      paymentMethod !== "BANK_TRANSFER" ||
      cancelled
    ) {
      return;
    }

    paymentApi
      .syncPayosPayment(orderCode)
      .then((res) => {
        if (res?.data?.status === "Paid") setPaymentStatus("Paid");
      })
      .catch(() => {});
  }, [orderCode, providerStatus, paymentMethod, cancelled]);

  useEffect(() => {
    if (!orderId || !ONLINE_METHODS.includes(paymentMethod) || cancelled)
      return;
    let stopped = false;
    const poll = async () => {
      try {
        const res = await paymentApi.getOrderStatus(orderId);
        if (!stopped) setPaymentStatus(res.data?.payment_status || null);
        if (!stopped && res.data?.payment_status === "Pending") {
          setTimeout(poll, 3000);
        }
      } catch {
        if (!stopped) setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      stopped = true;
    };
  }, [orderId, paymentMethod, cancelled]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (cancelled) {
    return (
      <div className="max-w-lg mx-4 sm:mx-auto mt-24 mb-10 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-xl p-5 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md text-center space-y-5 transition-colors duration-200">
        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto shrink-0 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">
          <XCircle size={32} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase">
            {t("order_cancelled_heading", "ĐÃ HỦY THANH TOÁN")}
          </h2>
          <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t(
              "order_cancelled_message",
              "Bạn đã hủy thanh toán. Đơn hàng đã được hủy.",
            )}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white text-[13px] sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            {t("continue_shopping_btn", "Tiếp tục mua sắm")}
          </button>
        </div>
      </div>
    );
  }

  const isOnline = ONLINE_METHODS.includes(paymentMethod);
  const isManualBankTransfer =
    paymentMethod === "BANK_TRANSFER" && paymentInfo?.bankAccount;
  const showSpinner =
    isOnline && !isManualBankTransfer && paymentStatus !== "Paid";

  const statusLabel = t(
    PAYMENT_STATUS_KEYS[paymentStatus] || "payment_pending_status",
  );

  const heading = showSpinner
    ? t("order_pending_heading", "ĐANG XÁC NHẬN THANH TOÁN...")
    : t("order_success_heading", "ĐẶT HÀNG THÀNH CÔNG!");

  return (
    <div className="max-w-lg mx-4 sm:mx-auto mt-24 mb-10 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-xl p-5 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md text-center space-y-5 transition-colors duration-200">
      <div
        className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto shrink-0 ${
          !showSpinner
            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
            : "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20"
        }`}
      >
        {showSpinner ? (
          <Loader2
            size={32}
            className="text-sky-600 dark:text-sky-400 animate-spin"
          />
        ) : (
          <ShoppingBag
            size={32}
            className="text-emerald-600 dark:text-emerald-400"
          />
        )}
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase">
          {heading}
        </h2>
        <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t("order_id_label", "Mã đơn hàng của bạn:")}{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            #{orderId}
          </span>
        </p>
        {trackingCode && (
          <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("tracking_code_label", "Mã vận đơn:")}{" "}
            <Link
              to={`/tra-cuu-don?code=${trackingCode}`}
              className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              {trackingCode}
            </Link>
          </p>
        )}
      </div>

      {isManualBankTransfer && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-left space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <QrCode size={18} className="text-sky-600" />
            {t("scan_qr_heading")}
          </div>

          {paymentInfo.qrImageUrl && (
            <div className="bg-white p-3 shadow-sm border border-slate-200 rounded-md flex justify-center">
              <img
                src={paymentInfo.qrImageUrl}
                alt="VietQR"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            </div>
          )}

          {paymentInfo.bankAccount && (
            <div className="flex items-start gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-slate-300">
              <Building size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-200">
                  {paymentInfo.bankAccount.bankName} •{" "}
                  {paymentInfo.bankAccount.accountNo}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {paymentInfo.bankAccount.accountName}
                </div>
              </div>
            </div>
          )}

          {paymentInfo.transferContent && (
            <div className="flex items-center gap-2 text-[13px] sm:text-sm text-slate-600 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">
                {t("transfer_content_label")}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {paymentInfo.transferContent}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(paymentInfo.transferContent)}
                className="text-sky-600 hover:text-sky-700 cursor-pointer shrink-0"
                aria-label={t("copy_content_aria")}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("bank_transfer_instruction")}
          </p>
        </div>
      )}

      {ONLINE_METHODS.includes(paymentMethod) && !isManualBankTransfer && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {statusLabel}
        </p>
      )}

      <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 pt-2">
        {t("thank_you_message", "Cảm ơn bạn đã mua hàng.")}
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white text-[13px] sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
        >
          {t("continue_shopping_btn", "Tiếp tục mua sắm")}
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
