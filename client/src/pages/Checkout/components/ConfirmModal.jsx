import { Check, X } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const STATUS_PAYMENT = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  VNPAY: "VNPay",
};

const ConfirmModal = ({ open, onClose, onConfirm, data, submitting }) => {
  if (!open) return null;

  const {
    items,
    totalAmount,
    discount,
    finalAmount,
    email,
    fullAddress,
    paymentMethod,
    couponCode,
  } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Xác nhận đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Địa chỉ
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium text-right max-w-[60%]">
                {fullAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Thanh toán
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {STATUS_PAYMENT[paymentMethod] || paymentMethod}
              </span>
            </div>
            {couponCode && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Mã giảm giá
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {couponCode}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Sản phẩm
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/60 p-2.5 items-center"
                >
                  <div className="flex-1 pr-2">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {item.name || `SP #${item.product_variant_id}`}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    {formatCurrency(item.price_at_purchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tạm tính</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Giảm giá</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <hr className="border-slate-200 dark:border-slate-800 my-1" />
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100">
              <span>Tổng cộng</span>
              <span className="text-rose-600 dark:text-rose-400">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {submitting ? (
              "Đang xử lý..."
            ) : (
              <>
                <Check size={16} />
                Xác nhận đặt hàng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
