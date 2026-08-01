import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { ProgressBar } from "@/pages/Admin/Dashboard/components/ProgressBar";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const PAYMENT_CFG = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  VNPAY: "Cổng VNPay",
  CREDIT_CARD: "Thẻ tín dụng",
};

export const PaymentBreakdown = ({ revenueByPaymentMethod = {} }) => {
  const rows = Object.entries(revenueByPaymentMethod);
  const maxVal = Math.max(...rows.map(([, v]) => Number(v)), 1);

  return (
    <Card title="Phương thức thanh toán" icon={<CreditCard size={16} />}>
      <div className="space-y-3 py-1">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
            Chưa có dữ liệu thanh toán
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
