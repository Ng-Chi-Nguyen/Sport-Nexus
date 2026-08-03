const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  shipping: "bg-purple-50 text-purple-600 border-purple-200",
  done: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};

export { statusStyles, statusLabels };
