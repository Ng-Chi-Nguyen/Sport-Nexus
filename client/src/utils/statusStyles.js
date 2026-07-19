// --- Purchase Order Status ---
export const PURCHASE_STATUS_MAP = {
  PENDING: { color: "warning", label: "Đang chờ" },
  RECEIVED: { color: "success", label: "Đã nhận" },
  PARTIALLY_RECEIVED: { color: "info", label: "Nhận một phần" },
  CANCELLED: { color: "error", label: "Đã hủy" },
};

export const getPurchaseStatusDetails = (status) =>
  PURCHASE_STATUS_MAP[status] || { color: "default", label: status };

// --- Order Status ---
export const ORDER_STATUS_CLASS = {
  Processing: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Shipping: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export const getOrderStatusClass = (status) =>
  ORDER_STATUS_CLASS[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

// --- Payment Status ---
export const PAYMENT_STATUS_CLASS = {
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export const getPaymentStatusClass = (status) =>
  PAYMENT_STATUS_CLASS[status] || "bg-slate-500/10 text-slate-400 border-slate-400/20";

// --- Permission Action ---
export const ACTION_COLOR_MAP = {
  create: "success",
  read: "info",
  update: "warning",
  delete: "error",
};

export const getActionColor = (action) =>
  ACTION_COLOR_MAP[action] || "slate";

// --- Stock Badge ---
export const getStockBadgeClass = (qty) => {
  if (qty < 10)
    return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
  if (qty <= 50)
    return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
  if (qty <= 100)
    return "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
};
