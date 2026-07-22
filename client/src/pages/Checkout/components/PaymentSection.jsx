import { CreditCard, Truck, Building, Smartphone, Wallet } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng", icon: Truck },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: Building },
  { value: "MOMO", label: "Ví MoMo", icon: Smartphone },
  { value: "VNPAY", label: "VNPay", icon: Wallet },
];

const PaymentSection = ({ value, onChange }) => (
  <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
      <CreditCard size={16} />
      Phương thức thanh toán
    </h2>
    <div className="space-y-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        return (
          <label
            key={method.value}
            className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
              value === method.value
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={value === method.value}
              onChange={(e) => onChange(e.target.value)}
              className="accent-blue-600"
            />
            <Icon size={18} className="text-slate-500" />
            <span className="text-sm text-slate-700">{method.label}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export default PaymentSection;
