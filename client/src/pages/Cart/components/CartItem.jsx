import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Link } from "react-router-dom";
import { Confirm } from "@/components/ui/confirm";

const CartItem = ({ item, onUpdateQty, onRemove, selected, onToggleSelect }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const price = item.variant?.price || item.product?.base_price || 0;
    const subtotal = price * item.quantity;
    const attributes = item.variant?.VariableAttributes || [];

    return (
        <>
            <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-sm">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(item.product_variant_id)}
                    className="mt-1 shrink-0"
                />
                <Link to={`/san-pham/${item.product?.slug}`} className="shrink-0">
                    <div className="w-20 h-20 bg-[#F8F8F8] border border-slate-100 rounded-sm overflow-hidden">
                        {item.product?.thumbnail ? (
                            <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                                {item.product?.name?.charAt(0) || "?"}
                            </div>
                        )}
                    </div>
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        to={`/san-pham/${item.product?.slug}`}
                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                        {item.product?.name || "Sản phẩm"}
                    </Link>
                    {attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {attributes.map((a, i) => (
                                <span key={i} className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {a.attributeKey?.name}: {a.value}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-sm font-bold text-red-600 mt-1">{formatCurrency(price)}</p>
                </div>
                <div className="flex items-center border border-slate-300 rounded-sm overflow-hidden shrink-0">
                    <button
                        onClick={() => onUpdateQty(item.product_variant_id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQty(item.product_variant_id, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <p className="text-sm font-bold text-slate-800 w-24 text-right shrink-0">{formatCurrency(subtotal)}</p>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <Confirm
                isOpen={showConfirm}
                title="Xóa sản phẩm"
                message={`Bạn có chắc muốn xóa "${item.product?.name || "sản phẩm"}" khỏi giỏ hàng?`}
                onConfirm={() => {
                    onRemove(item.product_variant_id);
                    setShowConfirm(false);
                }}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
};

export default CartItem;
