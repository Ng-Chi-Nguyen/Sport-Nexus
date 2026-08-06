import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCart from "./components/EmptyCart";
import { TitleWithIcon } from "@/components/ui/title";
import { ShoppingBag } from "lucide-react";
import { CarouselPagination } from "@/components/ui/pagination";
import { useTranslation } from "react-i18next";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";

const CartPage = () => {
  const { t } = useTranslation();
  const { items, updateQty, removeItem, count } = useCart();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

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

  const selectedItems = items.filter((i) =>
    selectedIds.has(i.product_variant_id),
  );

  if (!items.length) return <EmptyCart />;

  const isAllSelected = selectedIds.size === items.length && items.length > 0;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const safeIndex = Math.min(currentIndex, Math.max(0, totalPages - 1));
  const displayedItems = items.slice(
    safeIndex * itemsPerPage,
    (safeIndex + 1) * itemsPerPage,
  );

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-[30px]">
        <Breadcrumbs
          data={[
            { title: t("breadcrumb_home"), route: "/" },
            { title: t("breadcrumb_cart"), route: "" },
          ]}
        />
        <TitleWithIcon icon={ShoppingBag} title={t("page_heading")} />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center gap-3 px-1 py-2">
              <AnimatedCheckbox
                id="select-all-cart-items"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                label={t("select_all_label", { count: items.length })}
              />
            </div>
            {displayedItems.map((item) => (
              <CartItem
                key={item.product_variant_id}
                item={item}
                selected={selectedIds.has(item.product_variant_id)}
                onToggleSelect={toggleSelect}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            ))}

            {totalPages > 1 && (
              <CarouselPagination
                className="pt-1"
                totalPages={totalPages}
                current={safeIndex}
                onChange={setCurrentIndex}
              />
            )}
          </div>
          <div className="md:col-span-2 sticky top-4">
            <CartSummary
              selectedItems={selectedItems}
              onCheckout={(selItems) => {
                const checkoutItems = selItems.map((i) => ({
                  product_variant_id: i.product_variant_id,
                  quantity: i.quantity,
                  price_at_purchase:
                    i.variant?.price || i.product?.base_price || 0,
                  name: i.product?.name || "",
                  attributes: (i.variant?.VariableAttributes || []).map(
                    (va) => ({
                      name: va.attributeKey?.name,
                      value: va.value,
                    }),
                  ),
                }));
                navigate("/thanh-toan", {
                  state: { items: checkoutItems, email: "" },
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
