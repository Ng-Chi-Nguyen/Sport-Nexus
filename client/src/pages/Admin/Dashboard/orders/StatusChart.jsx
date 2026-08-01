import { Card } from "@/pages/Admin/Dashboard/components/Card";
import { CreditCard, BarChart3 } from "lucide-react";

const STATUS_COLORS = {
  Processing: "bg-amber-500 dark:bg-amber-400",
  Shipping: "bg-sky-500 dark:bg-sky-400",
  Delivered: "bg-emerald-500 dark:bg-emerald-400",
  Cancelled: "bg-rose-500 dark:bg-red-400",
  Refunded: "bg-purple-500 dark:bg-violet-400",
};

export const StatusChart = ({ data = [] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <Card title="Trạng thái đơn hàng" icon={<BarChart3 size={16} />}>
      {data.length ? (
        <div className="space-y-2.5">
          {data.map((d) => (
            <div key={d.status} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {d.status}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {d.count.toLocaleString()}
                </span>
              </div>
              {/* Rãnh chứa thanh tiến trình */}
              <div
                className="h-3 rounded-full border overflow-hidden p-[1px] transition-colors duration-200
                              bg-slate-100 border-slate-200 
                              dark:bg-slate-900/80 dark:border-slate-800"
              >
                <div
                  className={`h-full rounded-full ${
                    STATUS_COLORS[d.status] || "bg-slate-400 dark:bg-slate-500"
                  } transition-all duration-300 shadow-sm`}
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          Chưa có dữ liệu
        </div>
      )}
    </Card>
  );
};

const PMT_COLORS = {
  COD: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent",
  BANK_TRANSFER:
    "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent",
  MOMO: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-transparent",
  VNPAY:
    "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-transparent",
  CREDIT_CARD:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent",
};

export const PaymentMethodChart = ({ data = [] }) => (
  <Card title="Phương thức thanh toán" icon={<CreditCard size={16} />}>
    {data.length ? (
      <div className="space-y-2.5">
        {data.map((d) => (
          <div
            key={d.method}
            className="flex items-center justify-between rounded-xl border p-2.5 transition-colors duration-200
                       bg-white border-slate-200 
                       dark:bg-[#08101E] dark:border-slate-800"
          >
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                PMT_COLORS[d.method] ||
                "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-transparent"
              }`}
            >
              {d.method}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {d.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        Chưa có dữ liệu
      </div>
    )}
  </Card>
);
