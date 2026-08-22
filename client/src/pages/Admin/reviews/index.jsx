import { useState } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FilterPanel from "@/components/ui/FilterPanel";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import ShowToast from "@/components/ui/toast";
import { SimpleSelect } from "@/components/ui/select";
import useTableFilters from "@/hooks/useTableFilters";
import reviewApi from "@/api/management/reviewApi";
import ReviewCard from "./components/ReviewCard";
import ReplyModal from "./components/ReplyModal";
import { useTranslation } from "react-i18next";

const RATING_OPTIONS = ["5", "4", "3", "2", "1"];

const ReviewPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "review_admin" });
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const { data, products } = responses || {};
  const { reviews, pagination } = data || {};

  const [replyTarget, setReplyTarget] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const breadcrumbData = [
    {
      title: <LayoutDashboard size={18} strokeWidth={1.5} />,
      route: "",
    },
    { title: t("management"), route: "" },
  ];

  const paginationInfo = pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handleRefresh = () => {
    if (revalidator.state === "idle") refreshData();
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const handleSubmitReply = async (replyComment) => {
    setIsMutating(true);
    try {
      const response = await reviewApi.reply(replyTarget.id, {
        reply_comment: replyComment,
      });
      if (response.success) {
        setReplyTarget(null);
        await refreshData();
        ShowToast("success", response.message || t("reply_success"));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteReply = async () => {
    setIsMutating(true);
    try {
      const response = await reviewApi.deleteReply(replyTarget.id);
      if (response.success) {
        setReplyTarget(null);
        await refreshData();
        ShowToast("success", response.message || t("delete_reply_success"));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleVisibility = async (review) => {
    setIsMutating(true);
    try {
      const nextHidden = !review.is_hidden;
      const response = await reviewApi.setVisibility(review.id, nextHidden);
      if (response.success) {
        await refreshData();
        ShowToast(
          "success",
          response.message ||
            (nextHidden
              ? t("visibility_hidden_success")
              : t("visibility_visible_success")),
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        error.message ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <FilterPanel
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        searchPlaceholder={t("search_placeholder")}
      >
        <SimpleSelect
          label={t("filter_product")}
          placeholder={t("all")}
          value={searchParams.get("product_id") || ""}
          onChange={(val) => setFilter("product_id", val)}
          options={[
            { slug: "", name: t("all") },
            ...(products || []).map((p) => ({
              slug: String(p.id),
              name: p.name,
            })),
          ]}
        />
        <SimpleSelect
          label={t("filter_rating")}
          placeholder={t("all")}
          value={searchParams.get("rating") || ""}
          onChange={(val) => setFilter("rating", val)}
          options={[
            { slug: "", name: t("all") },
            ...RATING_OPTIONS.map((r) => ({
              slug: r,
              name: t("rating_stars", { count: r }),
            })),
          ]}
        />
        <SimpleSelect
          label={t("filter_status")}
          placeholder={t("all")}
          value={searchParams.get("status") || ""}
          onChange={(val) => setFilter("status", val)}
          options={[
            { slug: "", name: t("all") },
            { slug: "visible", name: t("status_visible") },
            { slug: "hidden", name: t("status_hidden_badge") },
          ]}
        />
        <SimpleSelect
          label={t("filter_reply")}
          placeholder={t("all")}
          value={searchParams.get("reply") || ""}
          onChange={(val) => setFilter("reply", val)}
          options={[
            { slug: "", name: t("all") },
            { slug: "replied", name: t("replied_chip") },
            { slug: "unreplied", name: t("unreplied_chip") },
          ]}
        />
      </FilterPanel>

      <div className="">
        <div className="flex items-center gap-3 justify-between">
          <h2 className="section-title mb-3">{t("review_list")}</h2>
          <div className="flex items-center gap-3">
            {(reviews?.length || 0) > 0 && (
              <Badge>
                {paginationInfo.totalItems} {t("reviews_suffix")}
              </Badge>
            )}
            <button
              onClick={handleRefresh}
              disabled={revalidator.state === "loading"}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("reload")}
            >
              <RefreshCw
                size={18}
                className={
                  revalidator.state === "loading" ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </div>

        {reviews?.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isMutating={isMutating}
                onReply={setReplyTarget}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4 opacity-30">⭐</div>
            <p className="text-slate-400 dark:text-slate-500 italic text-sm">
              {t("no_reviews_found")}
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 dark:border-white/[0.03] pt-4">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ReplyModal
        isOpen={Boolean(replyTarget)}
        review={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSubmit={handleSubmitReply}
        onDelete={handleDeleteReply}
      />
    </div>
  );
};

export default ReviewPage;
