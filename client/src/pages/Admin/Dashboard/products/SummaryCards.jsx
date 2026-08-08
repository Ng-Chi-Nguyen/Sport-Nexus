import {
  Package,
  CheckCircle,
  XCircle,
  ImageOff,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { KpiCard } from "@/pages/Admin/Dashboard/components/KpiCard";
import { useTranslation } from "react-i18next";

const TONES = {
  blue: "from-blue-500/10 border-blue-200 dark:from-blue-600/30 dark:border-blue-900/40",
  emerald:
    "from-emerald-500/10 border-emerald-200 dark:from-emerald-600/30 dark:border-emerald-900/40",
  amber:
    "from-amber-500/10 border-amber-200 dark:from-amber-600/30 dark:border-amber-900/40",
  rose: "from-rose-500/10 border-rose-200 dark:from-rose-600/30 dark:border-rose-900/40",
  violet:
    "from-violet-500/10 border-violet-200 dark:from-violet-600/30 dark:border-violet-900/40",
};

export const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation("translation", { keyPrefix: "dashboard" });
  const {
    totalProducts = 0,
    activeProducts = 0,
    inactiveProducts = 0,
    noImageProducts = 0,
    noVariantProducts = 0,
    totalSold = 0,
  } = summary;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-start">
      <KpiCard
        label={t("total_products")}
        value={totalProducts.toLocaleString()}
        icon={<Package size={16} />}
        tone={TONES.blue}
      />
      <KpiCard
        label={t("active_products")}
        value={activeProducts.toLocaleString()}
        icon={<CheckCircle size={16} />}
        tone={TONES.emerald}
      />
      <KpiCard
        label={t("inactive_products")}
        value={inactiveProducts.toLocaleString()}
        icon={<XCircle size={16} />}
        tone={TONES.amber}
      />
      <KpiCard
        label={t("total_sold")}
        value={totalSold.toLocaleString()}
        icon={<ShoppingBag size={16} />}
        tone={TONES.rose}
      />
      <KpiCard
        label={t("missing_image")}
        value={noImageProducts.toLocaleString()}
        icon={<ImageOff size={16} />}
        tone={TONES.rose}
      />
      <KpiCard
        label={t("missing_variant")}
        value={noVariantProducts.toLocaleString()}
        icon={<Layers size={16} />}
        tone={TONES.violet}
      />
    </div>
  );
};
