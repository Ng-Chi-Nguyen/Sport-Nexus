import { CreditCard, Truck, Building, Smartphone, Wallet } from "lucide-react";

export const PAYMENT_METHODS = [
  { value: "COD", labelKey: "cod_payment", icon: Truck },
  {
    value: "BANK_TRANSFER",
    labelKey: "bank_transfer_payment",
    icon: Building,
    manual: true,
  },
  // { value: "MOMO", labelKey: "momo_payment", icon: Smartphone },
  // { value: "CREDIT_CARD", labelKey: "credit_card_payment", icon: CreditCard },
  // { value: "VNPAY", labelKey: "vnpay_payment", icon: Wallet },
];

export const PAYMENT_METHOD_KEYS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.labelKey]),
);

export const ONLINE_METHODS = ["BANK_TRANSFER", "MOMO", "CREDIT_CARD", "VNPAY"];

export const PAYMENT_STATUS_KEYS = {
  Pending: "payment_pending_status",
  Paid: "payment_success_status",
  Failed: "payment_failed_status",
  Refunded: "payment_refunded_status",
};
