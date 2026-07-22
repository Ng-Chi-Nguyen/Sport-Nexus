import useCoupon from "@/hooks/useCoupon";
import { formatCurrency } from "@/utils/formatters";

const CartSummary = ({ selectedItems, onCheckout }) => {
    const { couponCode, setCouponCode, couponMsg, couponData, loading: couponLoading, applyCoupon, clearCoupon } = useCoupon();

    const subtotal = selectedItems.reduce((s, i) => {
        const price = i.variant?.price || i.product?.base_price || 0;
        return s + Number(price) * i.quantity;
    }, 0);
    const discount = couponData?.discount ?? 0;
    const finalAmount = couponData?.newAmount ?? subtotal;
    const shipping = subtotal >= 500000 ? 0 : 30000;

    return (
        <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tổng cộng</h3>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Mã giảm giá"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400"
                />
                <button
                    onClick={() => applyCoupon(subtotal, couponCode)}
                    disabled={couponLoading || !couponCode}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    Áp dụng
                </button>
            </div>
            {couponMsg && (
                <p className={`text-xs ${couponMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {couponMsg.text}
                </p>
            )}
            {couponData && (
                <button onClick={clearCoupon} className="text-xs text-blue-600 hover:underline">Xóa mã</button>
            )}

            <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-2">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatCurrency(finalAmount + shipping)}</span>
                </div>
            </div>

            <button
                onClick={() => onCheckout(selectedItems)}
                disabled={selectedItems.length === 0}
                className="w-full py-3 bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Tiến hành thanh toán ({selectedItems.length} sản phẩm)
            </button>
        </div>
    );
};

export default CartSummary;
