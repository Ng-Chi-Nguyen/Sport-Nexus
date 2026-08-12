import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatters";
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";

const MemberPrice = ({
  price,
  discountPercent,
  memberClassName = "",
  originalClassName = "text-slate-400 dark:text-slate-500",
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const hookPercent = useMemberDiscount();
  const pct = discountPercent ?? hookPercent;
  const memberPrice = getMemberPrice(price, pct);

  if (pct <= 0 || memberPrice >= Number(price)) {
    return <span>{formatCurrency(price)}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`text-xs line-through ${originalClassName}`}>
        {formatCurrency(price)}
      </span>
      <span className={`font-bold text-primary ${memberClassName}`}>
        {formatCurrency(memberPrice)}
      </span>
      {showLabel && (
        <span className="text-[10px] font-semibold text-primary/80">
          {t("loyalty.member_price_label")}
        </span>
      )}
    </span>
  );
};

export default MemberPrice;
