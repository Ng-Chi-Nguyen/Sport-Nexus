import { Star } from "lucide-react";
import { formatDate } from "@/utils/formatters";

const ReviewItem = ({ review }) => (
  <div className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
        {review.user?.avatar ? (
          <img
            src={review.user.avatar}
            alt={review.user.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-300 dark:bg-slate-700">
            {review.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {review.user?.full_name || "Người dùng"}
        </p>
        <div className="flex items-center gap-2">
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
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-300 pl-11 leading-relaxed">
      {review.comment}
    </p>
  </div>
);

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div
      id="reviews"
      className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-6 text-slate-800 dark:text-slate-100 transition-colors duration-200"
    >
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
        Đánh giá ({reviews.length})
      </h2>
      <div className="space-y-4 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md">
        {reviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
