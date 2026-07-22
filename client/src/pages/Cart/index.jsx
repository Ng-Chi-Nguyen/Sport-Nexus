import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCart from "./components/EmptyCart";

const CartPage = () => {
    const { items, updateQty, removeItem, count } = useCart();
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState(new Set());

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.product_variant_id)));
        }
    };

    const selectedItems = items.filter((i) => selectedIds.has(i.product_variant_id));

    if (!items.length) return <EmptyCart />;

    return (
        <div className="min-h-screen py-4 md:py-8">
            <div className="mx-auto max-w-5xl">
                <Breadcrumbs
                    data={[
                        { title: "Trang chủ", route: "/" },
                        { title: "Giỏ hàng", route: "" },
                    ]}
                />
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-6">
                    Giỏ hàng ({count} sản phẩm)
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                    <div className="md:col-span-3 space-y-3">
                        <div className="flex items-center gap-3 px-1 py-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="shrink-0"
                            />
                            <span className="text-sm text-slate-600">
                                Chọn tất cả ({items.length} sản phẩm)
                            </span>
                        </div>
                        {items.map((item) => (
                            <CartItem
                                key={item.product_variant_id}
                                item={item}
                                selected={selectedIds.has(item.product_variant_id)}
                                onToggleSelect={toggleSelect}
                                onUpdateQty={updateQty}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                    <div className="md:col-span-2 sticky top-4">
                        <CartSummary
                            selectedItems={selectedItems}
                            onCheckout={(selItems) => {
                                const checkoutItems = selItems.map((i) => ({
                                    product_variant_id: i.product_variant_id,
                                    quantity: i.quantity,
                                    price_at_purchase: i.variant?.price || i.product?.base_price || 0,
                                    name: i.product?.name || "",
                                    attributes: (i.variant?.VariableAttributes || []).map((va) => ({
                                        name: va.attributeKey?.name,
                                        value: va.value,
                                    })),
                                }));
                                navigate("/thanh-toan", { state: { items: checkoutItems, email: "" } });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
