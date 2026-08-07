import { useState } from "react";
import { Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import reviewApi from "@/api/customer/reviewApi";
import MultiFileUpload from "@/components/ui/MultiFileUpload";
import ShowToast from "@/components/ui/toast";

const parseMedia = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const buildEntries = (order) => {
  const reviewByProduct = new Map(
    (order?.Reviews || []).map((r) => [r.product_id, r]),
  );
  const items = order?.OrderItems || [];
  return items.map((item) => {
    const productId = item.product_variant?.product_id;
    const existing = reviewByProduct.get(productId);
    return {
      itemId: item.id,
      productId,
      productName: item.product_variant?.product?.name,
      reviewId: existing?.id || null,
      rating: existing?.rating || 0,
      comment: existing?.comment || "",
      files: [],
      keptMedia: parseMedia(existing?.media_urls),
    };
  });
};

const ReviewModal = ({ order, onClose, onSuccess }) => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
  const [entries, setEntries] = useState(() => buildEntries(order));
  const [submitting, setSubmitting] = useState(false);

  const hasExistingReview = entries.some((e) => e.reviewId);

  const updateEntry = (index, patch) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    );
  };

  const handleSubmit = async () => {
    const pending = entries.filter((e) => e.rating > 0);
    if (pending.length === 0) {
      ShowToast(
        "warning",
        t("review_rating_required", "Vui lòng chọn số sao cho ít nhất một sản phẩm"),
      );
      return;
    }
    setSubmitting(true);
    const errors = [];
    for (const entry of pending) {
      try {
        const formData = new FormData();
        formData.append("rating", String(entry.rating));
        formData.append("comment", entry.comment || "");
        formData.append("product_id", String(entry.productId));
        entry.files.forEach((file) => formData.append("media_urls", file));

        if (entry.reviewId) {
          formData.append("existing_media", JSON.stringify(entry.keptMedia));
          await reviewApi.update(entry.reviewId, formData);
        } else {
          formData.append("order_id", String(order.id));
          await reviewApi.create(formData);
        }
      } catch (error) {
        errors.push(
          error.response?.data?.message || error.message || "Lỗi khi gửi đánh giá",
        );
      }
    }
    setSubmitting(false);

    if (errors.length === 0) {
      ShowToast(
        "success",
        hasExistingReview
          ? t("review_updated", "Cập nhật đánh giá thành công")
          : t("review_success", "Gửi đánh giá thành công"),
      );
      onSuccess?.();
      onClose();
    } else {
      ShowToast("error", errors[0]);
    }
  };

  const canSubmit = entries.some((e) => e.rating > 0) && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0D121F] shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0D121F] z-10">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {hasExistingReview
              ? t("review_edit_title", "Chỉnh sửa đánh giá")
              : t("review_title", "Đánh giá sản phẩm")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              {t("review_all_done", "Bạn đã đánh giá tất cả sản phẩm trong đơn")}
            </p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.itemId}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3"
              >
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {entry.productName || t("default_product_name", "Sản phẩm")}
                </p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateEntry(index, { rating: star })}
                      className="cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={
                          star <= entry.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={entry.comment}
                  onChange={(e) =>
                    updateEntry(index, { comment: e.target.value })
                  }
                  placeholder={t(
                    "review_comment_placeholder",
                    "Chia sẻ cảm nhận của bạn về sản phẩm...",
                  )}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827]/40 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
                />

                {entry.keptMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.keptMedia.map((url, i) => (
                      <div
                        key={i}
                        className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={url}
                          alt={`review ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(index, {
                              keptMedia: entry.keptMedia.filter(
                                (_, j) => j !== i,
                              ),
                            })
                          }
                          className="absolute top-1 right-1 p-0.5 bg-rose-500/90 hover:bg-rose-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <MultiFileUpload
                  label={t("review_media_label", "Hình ảnh (tối đa 3)")}
                  value={entry.files}
                  onChange={(files) => updateEntry(index, { files })}
                  maxFiles={3}
                />
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-[#0D121F]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
          >
            {t("review_cancel", "Hủy")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? t("review_submitting", "Đang gửi...")
              : hasExistingReview
                ? t("review_update_submit", "Cập nhật đánh giá")
                : t("review_submit", "Gửi đánh giá")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
