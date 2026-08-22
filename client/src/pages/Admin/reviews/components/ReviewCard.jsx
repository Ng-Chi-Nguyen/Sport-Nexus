import { Star, MessageSquareReply, EyeOff, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/formatters";

const parseMedia = (raw) => {
  let media = raw;
  if (typeof media === "string") {
    try {
      media = JSON.parse(media);
    } catch {
      media = [];
    }
  }
  return Array.isArray(media) ? media : [];
};

const ReviewCard = ({ review, onReply, onToggleVisibility, isMutating }) => {
  const { t } = useTranslation("translation", { keyPrefix: "review_admin" });
  const media = parseMedia(review.media_urls);
  const isHidden = Boolean(review.is_hidden);
  const hasReply = Boolean(review.reply_comment);

  return (
    <div
      className={`bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-5 shadow-xl dark:shadow-2xl backdrop-blur-md transition-all duration-200 ${
        isHidden ? "opacity-60" : ""
      }`}
    >
      {/* Header: user + badges */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 rounded-full">
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
              {review.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {review.user?.full_name || t("all")} {review.id}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: review.rating }, (_, i) => (
                <Star key={i} size={12} className="fill-amber-400" />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatDate(review.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isHidden && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
              {t("status_hidden_badge")}
            </span>
          )}
          <span
            className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
              hasReply
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
            }`}
          >
            {hasReply ? t("replied_chip") : t("unreplied_chip")}
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* Media */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {media.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${t("review_list")} ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      )}

      {/* Sản phẩm */}
      {review.product?.slug && (
        <Link
          to={`/san-pham/${review.product.slug}`}
          className="inline-block mt-3 text-xs text-sky-600 dark:text-[#4facf3] hover:underline"
        >
          {review.product.name}
        </Link>
      )}

      {/* Phản hồi hiện có */}
      {hasReply && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/[0.06] border border-emerald-100 dark:border-emerald-500/15">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {t("replied_chip")}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {review.reply_comment}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
        <button
          type="button"
          onClick={() => onToggleVisibility(review)}
          disabled={isMutating}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          {isHidden ? t("show_action") : t("hide_action")}
        </button>
        <button
          type="button"
          onClick={() => onReply(review)}
          disabled={isMutating}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:border-[#4facf3]/20 dark:bg-[#4facf3]/10 dark:text-[#4facf3] dark:hover:bg-[#4facf3]/20"
        >
          <MessageSquareReply size={14} />
          {hasReply ? t("edit_reply_action") : t("reply_action")}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
