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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Xác nhận đơn hàng</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-50 rounded p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-800 font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ</span>
              <span className="text-slate-800 font-medium text-right max-w-[60%]">{fullAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thanh toán</span>
              <span className="text-slate-800 font-medium">{STATUS_PAYMENT[paymentMethod] || paymentMethod}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mã giảm giá</span>
                <span className="text-slate-800 font-medium">{couponCode}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700">Sản phẩm</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm bg-slate-50 rounded p-2">
                  <div className="flex-1">
                    <span className="text-slate-700">{item.name || `SP #${item.product_variant_id}`}</span>
                    <span className="text-slate-400 ml-1">x{item.quantity}</span>
                  </div>
                  <span className="text-slate-800 font-medium">{formatCurrency(item.price_at_purchase * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-base font-bold text-slate-800">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatCurrency(finalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-sm hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
