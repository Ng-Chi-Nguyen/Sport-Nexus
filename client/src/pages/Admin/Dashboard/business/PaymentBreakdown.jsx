import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useTranslation } from "react-i18next";

export const PaymentBreakdown = ({ revenueByPaymentMethod = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const PAYMENT_CFG = {
    COD: t("pay_cod"),
    BANK_TRANSFER: t("pay_bank_transfer"),
    MOMO: t("pay_momo"),
    VNPAY: t("pay_vnpay"),
    CREDIT_CARD: t("pay_credit_card"),
  };

  const rows = Object.entries(revenueByPaymentMethod);
  const maxVal = Math.max(...rows.map(([, v]) => Number(v)), 1);

  return (
    <Card title={t("payment_methods")} icon={<CreditCard size={16} />}>
      <div className="space-y-3 py-1">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            {t("no_payment_data")}
          </p>
        ) : (
          rows.map(([method, val]) => {
            const num = Number(val || 0);
            return (
              <ProgressBar
                key={method}
                label={PAYMENT_CFG[method] || method}
                valueText={formatCurrency(num)}
                color="from-cyan-500 to-blue-500"
                percent={Math.max((num / maxVal) * 100, num > 0 ? 6 : 0)}
              />
            );
          })
        )}
      </div>
    </Card>
  );
};
