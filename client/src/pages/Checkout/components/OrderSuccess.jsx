import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Loader2,
  Copy,
  Check,
  QrCode,
  Building,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import paymentApi from "@/api/customer/paymentApi";
import { ONLINE_METHODS, PAYMENT_STATUS_KEYS } from "@/constants/payment";
import { useTranslation } from "react-i18next";

const OrderSuccess = ({
  orderId,
  paymentMethod,
  paymentInfo,
  trackingCode,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId || !ONLINE_METHODS.includes(paymentMethod)) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await paymentApi.getOrderStatus(orderId);
        if (!cancelled) setPaymentStatus(res.data?.payment_status || null);
        if (!cancelled && res.data?.payment_status === "Pending") {
          setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) setTimeout(poll, 5000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentMethod]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = ONLINE_METHODS.includes(paymentMethod);
  const isManualBankTransfer =
    paymentMethod === "BANK_TRANSFER" && paymentInfo?.bankAccount;
  const showSpinner = isOnline && paymentStatus !== "Paid";

  const statusLabel = t(PAYMENT_STATUS_KEYS[paymentStatus] || "payment_pending_status");

  return (
    <div className="max-w-lg mx-auto my-20 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md text-center space-y-5 transition-colors duration-200 my-8">
      <div
        className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("order_success_heading")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("order_id_label")}{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            #{orderId}
          </span>
        </p>
        {trackingCode && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("tracking_code_label")}{" "}
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
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <QrCode size={18} className="text-sky-600" />
            {t("scan_qr_heading")}
          </div>

          {paymentInfo.qrImageUrl && (
            <div className="bg-white p-3 shadow-sm border border-slate-200 flex justify-center">
              <img
                src={paymentInfo.qrImageUrl}
                alt="VietQR"
                className="w-52 h-52 object-contain"
              />
            </div>
          )}

          {paymentInfo.bankAccount && (
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
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
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">
                {t("transfer_content_label")}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
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

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("bank_transfer_instruction")}
          </p>
        </div>
      )}

      {ONLINE_METHODS.includes(paymentMethod) && !isManualBankTransfer && (
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {statusLabel}
        </p>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("thank_you_message")}
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-medium transition-colors cursor-pointer shadow-sm"
        >
          {t("continue_shopping_btn")}
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
