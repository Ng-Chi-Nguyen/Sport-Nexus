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
            <div className="p-4 bg-white border border-slate-200 rounded-sm">
                {/* Row 1: checkbox + image + info + delete */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(item.product_variant_id)}
                        className="mt-1 shrink-0"
                    />
                    <Link to={`/san-pham/${item.product?.slug}`} className="shrink-0">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#F8F8F8] border border-slate-100 rounded-sm overflow-hidden">
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
                        {/* Subtotal visible on mobile only, next to price */}
                        <p className="text-xs text-slate-500 mt-0.5 sm:hidden">
                            Thành tiền: {formatCurrency(subtotal)}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0 self-start"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Row 2: quantity + subtotal (mobile row) */}
                <div className="flex items-center justify-between mt-3 sm:mt-0 sm:ml-9 sm:pl-0">
                    <div className="flex items-center border border-slate-300 rounded-sm overflow-hidden">
                        <button
                            onClick={() => onUpdateQty(item.product_variant_id, Math.max(1, item.quantity - 1))}
                            className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 sm:w-10 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQty(item.product_variant_id, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 hidden sm:block">{formatCurrency(subtotal)}</p>
                </div>
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
