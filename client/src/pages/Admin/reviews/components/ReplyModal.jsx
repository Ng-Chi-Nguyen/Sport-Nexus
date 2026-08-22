import { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ShowToast from "@/components/ui/toast";
import FloatingTextarea from "@/components/ui/textarea";

const MAX_REPLY_LENGTH = 1000;

const ReplyModal = ({ isOpen, review, onClose, onSubmit, onDelete }) => {
  const { t } = useTranslation("translation", { keyPrefix: "review_admin" });
  const modalRef = useRef();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setContent(review?.reply_comment || "");
  }, [isOpen, review]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(review?.reply_comment);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      ShowToast("error", t("reply_required"));
      return;
    }
    if (trimmed.length > MAX_REPLY_LENGTH) {
      ShowToast("error", t("reply_too_long"));
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg
                   bg-white dark:bg-[#0D121F]/90
                   border border-sky-200 dark:border-[#4facf3]/30
                   shadow-xl dark:shadow-[0_0_40px_rgba(79,172,243,0.15)]
                   rounded-2xl p-6 backdrop-blur-xl
                   animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-150"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide mb-4">
          {isEditing ? t("reply_modal_title_edit") : t("reply_modal_title_new")}
        </h3>

        <FloatingTextarea
          id="review-reply-content"
          label={t("reply_modal_label")}
          rows={5}
          maxLength={MAX_REPLY_LENGTH}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("reply_modal_hint")}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 ml-3">
            {t("char_count", { count: content.length })}
          </span>
        </div>

        <div className="flex w-full gap-3 mt-5">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl text-xs font-semibold
                         bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20
                         hover:bg-rose-600 hover:text-white hover:border-rose-600
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-150 cursor-pointer"
            >
              {t("delete_reply")}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold
                       text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200
                       dark:text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200
                       transition-all duration-150"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-white
                       bg-sky-600 hover:bg-sky-500
                       shadow-sm dark:shadow-[0_0_15px_rgba(14,165,233,0.25)]
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all duration-150 cursor-pointer"
          >
            {isSubmitting ? t("saving") : t("save_reply")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
