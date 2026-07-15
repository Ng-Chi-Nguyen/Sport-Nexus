// Cấu trúc class CSS đồng bộ cho các ô dropdown select
export const DROPDOWN_SELECT_CLASS =
  "px-3 py-2 rounded-xl text-xs bg-[#111827]/80 text-slate-300 border border-slate-800/80 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/20 transition-all duration-150 cursor-pointer min-w-[150px]";

// Nhãn Tiếng Việt dịch trạng thái vận chuyển
export const STATUS_LABELS = {
  Processing: "Chuẩn bị hàng",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
  Refunded: "Hoàn tiền",
};

// Nhãn Tiếng Việt dịch trạng thái thanh toán
export const STATUS_PAYMENT = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Failed: "Thất bại",
  Refunded: "Hoàn tiền",
};

// Danh sách Option cho dropdown Vận chuyển
export const STATUS_OPTIONS = [
  { value: "Processing", label: "Chuẩn bị hàng" },
  { value: "Shipping", label: "Đang giao" },
  { value: "Delivered", label: "Đã giao" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Refunded", label: "Hoàn tiền" },
];

// Danh sách Option cho dropdown Thanh toán
export const PAYMENT_OPTIONS = [
  { value: "Pending", label: "Chờ thanh toán" },
  { value: "Paid", label: "Đã thanh toán" },
  { value: "Failed", label: "Thất bại" },
  { value: "Refunded", label: "Hoàn tiền" },
];

// Danh sách Option cho dropdown Phương thức thanh toán
export const METHOD_OPTIONS = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "MOMO", label: "Ví MoMo" },
  { value: "VNPAY", label: "Cổng VNPay" },
  { value: "CREDIT_CARD", label: "Thẻ tín dụng" },
];
