import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";
import { Link } from "react-router-dom";
import { Confirm } from "@/components/ui/confirm";
import { useTranslation } from "react-i18next";
import { AnimatedCheckbox } from "@/components/ui/ckeckbox";

const CartItem = ({
  item,
  onUpdateQty,
  onRemove,
  selected,
  onToggleSelect,
}) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const price = item.variant?.price || item.product?.base_price || 0;
  const memberPercent = useMemberDiscount();
  const memberPrice = getMemberPrice(price, memberPercent);
  const subtotal = memberPrice * item.quantity;
  const attributes = item.variant?.VariableAttributes || [];

  return (
    <>
      {/* Đổi thành flex-col trên mobile, flex-row trên sm trở lên */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-sm transition-colors duration-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* PHẦN 1: Checkbox + Ảnh + Thông tin (Luôn nằm ngang) */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div className="pt-1 sm:pt-0 shrink-0">
            <AnimatedCheckbox
              id={`cart-item-${item.product_variant_id}`}
              checked={selected}
              onChange={() => onToggleSelect(item.product_variant_id)}
            />
          </div>

          <Link to={`/san-pham/${item.product?.slug}`} className="shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden rounded-md">
              {item.product?.thumbnail ? (
                <img
                  src={item.product.thumbnail}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold text-xs">
                  {item.product?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <Link
              to={`/san-pham/${item.product?.slug}`}
              className="text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-2 leading-snug"
            >
              {item.product?.name || t("product_default")}
            </Link>

            {attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {attributes.map((a, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60"
                  >
                    {a.attributeKey?.name}: {a.value}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1.5 text-xs sm:text-sm flex flex-wrap items-center gap-1.5">
              {memberPercent > 0 && memberPrice < Number(price) ? (
                <>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(memberPrice)}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                    {formatCurrency(price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PHẦN 2: Cụm Số lượng & Xóa (Mobile rớt xuống dòng dưới, PC nằm cùng dòng) */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-[28px] sm:pl-0 mt-1 sm:mt-0">
          {/* Bộ điều chỉnh số lượng */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-slate-50 dark:bg-[#111827]/40 shrink-0 h-8 sm:h-9">
            <button
              type="button"
              onClick={() =>
                onUpdateQty(
                  item.product_variant_id,
                  Math.max(1, item.quantity - 1),
                )
              }
              className="px-2 h-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-[13px] sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateQty(item.product_variant_id, item.quantity + 1)
              }
              className="px-2 h-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Thành tiền trên màn hình lớn */}
          <div className="text-right shrink-0 w-24 hidden sm:block">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Nút xóa sản phẩm */}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
            title={t("delete_product_title")}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <Confirm
        isOpen={showConfirm}
        title={t("delete_product_title")}
        message={t("delete_product_confirm_msg", {
          name: item.product?.name || "sản phẩm",
        })}
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
