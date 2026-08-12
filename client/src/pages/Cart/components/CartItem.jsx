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
      <div className="p-3 sm:p-4 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 shadow-sm transition-colors duration-200 flex items-center gap-3">
        {/* Cụm Checkbox tùy chỉnh gọn gàng kết hợp hình ảnh sản phẩm */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AnimatedCheckbox
            id={`cart-item-${item.product_variant_id}`}
            checked={selected}
            onChange={() => onToggleSelect(item.product_variant_id)}
          />
          <Link to={`/san-pham/${item.product?.slug}`}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
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
        </div>

        {/* Thông tin chi tiết sản phẩm tối ưu không gian hiển thị tên */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/san-pham/${item.product?.slug}`}
            className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-2"
          >
            {item.product?.name || t("product_default")}
          </Link>

          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {attributes.map((a, i) => (
                <span
                  key={i}
                  className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.2 border border-slate-200/60 dark:border-slate-700/60"
                >
                  {a.attributeKey?.name}: {a.value}
                </span>
              ))}
            </div>
          )}

          <div className="mt-1 text-xs sm:text-sm">
            {memberPercent > 0 && memberPrice < Number(price) ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 line-through mr-1">
                  {formatCurrency(price)}
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(memberPrice)}
                </span>
              </>
            ) : (
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>

        {/* Bộ điều chỉnh số lượng */}
        <div className="flex items-center border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#111827]/40 shrink-0">
          <button
            type="button"
            onClick={() =>
              onUpdateQty(
                item.product_variant_id,
                Math.max(1, item.quantity - 1),
              )
            }
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
            disabled={item.quantity <= 1}
          >
            <Minus size={12} />
          </button>
          <span className="w-6 sm:w-8 text-center text-xs font-semibold text-slate-800 dark:text-slate-200">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdateQty(item.product_variant_id, item.quantity + 1)
            }
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Thành tiền trên màn hình lớn */}
        <div className="text-right shrink-0 w-24 hidden sm:block">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Nút xóa sản phẩm */}
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
          title={t("delete_product_title")}
        >
          <Trash2 size={16} />
        </button>
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
