import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { LayoutDashboard, RefreshCw, Gift } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { useState } from "react";
import { queryClient } from "@/lib/react-query";
import ShowToast from "@/components/ui/toast";
import couponApi from "@/api/management/couponApi";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import GiftCouponModal from "@/components/admin/GiftCouponModal";
import { SimpleSelect } from "@/components/ui/select";
import {
  ACTIVE_TABS,
  DISCOUNT_TYPE_OPTIONS,
} from "@/constants/management/coupon";
import { useTranslation } from "react-i18next";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";

const CouponPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "coupon_admin" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const {
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    setFilter,
    clearAllFilters,
  } = useTableFilters();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [giftCoupon, setGiftCoupon] = useState(null);

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("business_management"), route: "" },
    { title: t("coupon_management"), route: "/management/coupons" },
  ];

  const isActive = searchParams.get("is_active") ?? "";
  const discountType = searchParams.get("discount_type") || "";
  const dateFrom = searchParams.get("date_from") || "";
  const dateTo = searchParams.get("date_to") || "";
  const discountMin = searchParams.get("discount_min") || "";
  const discountMax = searchParams.get("discount_max") || "";

  const coupons = responses?.data?.list_coupons || [];
  const pagination = responses?.data?.pagination || {};

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const openConfirm = (id) => {
    setDeleteTarget(id);
    setIsConfirmOpen(true);
  };

  const openGift = (coupon) => {
    setGiftCoupon(coupon);
  };

  const handleDelete = async () => {
    try {
      const response = await couponApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        revalidator.revalidate();
        ShowToast("success", response.message || t("delete_success"));
        setIsConfirmOpen(false);
      }
    } catch (error) {
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      ShowToast("error", errorMessage);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="my-4">
        <FilterPanel
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          searchPlaceholder={t("search_placeholder")}
          addButton={
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <ExcelCrudActions
                basePath="/management/coupon"
                title={t("import_export_title")}
                templateFileName="template-ma-giam-gia.xlsx"
                exportFileName="ma-giam-gia.xlsx"
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["coupons"] });
                  revalidator.revalidate();
                }}
              />
              <BtnAdd
                route="/management/coupons/create"
                name={t("add_coupon_btn")}
              />
            </div>
          }
        >
          <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[230px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("status_label")}
            </label>
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg h-10 border transition-colors duration-200 bg-slate-100 border-slate-200 dark:bg-[#111827]/60 dark:border-slate-800">
              {ACTIVE_TABS.map((tab) => {
                // Ép kiểu về String để so sánh an toàn tuyệt đối
                const isTabActive = String(isActive) === String(tab.value);

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter("is_active", tab.value)}
                    className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                      isTabActive
                        ? "bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    {tc(tab.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <SimpleSelect
              label={t("discount_type_label")}
              options={DISCOUNT_TYPE_OPTIONS.map((o) => ({
                slug: o.slug,
                name: tc(o.name),
              }))}
              value={discountType}
              onChange={(val) => setFilter("discount_type", val)}
              placeholder={t("all_placeholder")}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("date_from_label")}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setFilter("date_from", e.target.value)}
              className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("date_to_label")}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setFilter("date_to", e.target.value)}
              className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
            />
          </div>

          <div className="w-[180px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("discount_value_label")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={t("min_placeholder")}
                value={discountMin}
                onChange={(e) => setFilter("discount_min", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
              />
              <span className="text-slate-400 dark:text-slate-600 shrink-0">
                –
              </span>
              <input
                type="number"
                placeholder={t("max_placeholder")}
                value={discountMax}
                onChange={(e) => setFilter("discount_max", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
              />
            </div>
          </div>
        </FilterPanel>
      </div>

      {/* TIÊU ĐỀ & NÚT REFRESH */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {t("coupon_list_title")}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={revalidator.state === "loading"}
          className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("reload")}
        >
          <RefreshCw
            size={18}
            className={revalidator.state === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* KHỐI BẢNG CONTAINER */}
      <div className="mt-3 relative rounded-2xl shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-800 dark:text-slate-200 min-w-[600px]">
            <thead className="text-xs uppercase border-b transition-colors duration-200 bg-slate-100 border-slate-200 dark:bg-[#161F32] dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  {t("table_code")}
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  {t("table_validity")}
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  {t("table_order_limit")}
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  {t("table_usage")}
                </th>
                <th className="px-6 py-4 font-bold text-center text-slate-500 dark:text-slate-400">
                  {t("table_actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/40 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-center font-bold text-sky-600 dark:text-sky-400">
                      <Badge color={coupon.is_active ? "blue" : "red"}>
                        Code: {coupon.code}
                      </Badge>
                      {!coupon.is_active && (
                        <div className="mt-1">
                          <Badge color="red">{t("expired_badge")}</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <span className="font-bold text-[12px] text-slate-600 dark:text-slate-300">
                          {coupon.discount_type === "CASH"
                            ? t("cash_type")
                            : t("percentage_type")}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {coupon.discount_type === "CASH"
                            ? formatCurrency(coupon.discount_value)
                            : `${coupon.discount_value}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[12px]">
                      <div className="text-slate-500 dark:text-slate-400">
                        {t("from_date")} {formatDate(coupon.start_date)}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400 font-medium">
                        {t("to_date")} {formatDate(coupon.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[12px]">
                      <div className="text-slate-500 dark:text-slate-400 italic">
                        {t("min_order")}{" "}
                        {formatCurrency(coupon.min_order_value)}
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t("max_discount")}{" "}
                        {formatCurrency(coupon.max_discount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color="green">
                        {coupon.usage_count} / {coupon.usage_limit}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => openGift(coupon)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                        >
                          <Gift size={14} />
                          {t("gift_btn")}
                        </button>
                        <BtnEdit
                          route={`/management/coupons/edit/${coupon.id}`}
                          name={t("edit_btn")}
                        />
                        <BtnDelete
                          name={t("delete_btn")}
                          onClick={() => openConfirm(coupon.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 italic"
                  >
                    {t("no_coupons_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title={t("delete_modal_title")}
          message={t("delete_modal_message")}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <GiftCouponModal
          isOpen={!!giftCoupon}
          coupon={giftCoupon}
          onClose={() => setGiftCoupon(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
          }}
        />
      </div>
    </div>
  );
};

export default CouponPage;
