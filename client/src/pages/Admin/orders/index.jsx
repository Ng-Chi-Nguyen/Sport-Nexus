import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useMemo } from "react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { queryClient } from "@/lib/react-query";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import { formatFullDateTime, formatCurrency } from "@/utils/formatters";
import { SimpleSelect } from "@/components/ui/select";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

// IMPORT các hằng số từ file constants.js cùng cấp
import {
  STATUS_OPTIONS,
  PAYMENT_OPTIONS,
  METHOD_OPTIONS,
} from "@/constants/order";

import {
  getOrderStatusClass,
  getPaymentStatusClass,
} from "@/utils/statusStyles";

// --- COMPONENT CHÍNH ---
const OrderPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "order" });
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
  const orders = responses?.data?.orders || [];

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("business_management"), route: "" },
    { title: t("order_management"), route: "/management/orders" },
  ];

  // Đọc dữ liệu từ URL params
  const currentStatus = searchParams.get("status") || "";
  const currentPaymentStatus = searchParams.get("payment_status") || "";
  const currentPaymentMethod = searchParams.get("payment_method") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";
  const currentAmountMin = searchParams.get("amount_min") || "";
  const currentAmountMax = searchParams.get("amount_max") || "";

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  // Chuyển đổi định dạng danh sách options từ label/value sang slug/name cho SimpleSelect
  const statusOptionsMapped = useMemo(
    () =>
      STATUS_OPTIONS.map((opt) => ({
        slug: opt.value,
        name: t(`status_${opt.value.toLowerCase()}`),
      })),
    [t],
  );

  const paymentOptionsMapped = useMemo(
    () =>
      PAYMENT_OPTIONS.map((opt) => ({
        slug: opt.value,
        name: t(`pay_${opt.value.toLowerCase()}`),
      })),
    [t],
  );

  const methodOptionsMapped = useMemo(
    () =>
      METHOD_OPTIONS.map((opt) => ({
        slug: opt.value,
        name: t(`method_${opt.value.toLowerCase()}`),
      })),
    [t],
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & THAO TÁC NÚT BỘ LỌC */}
      <div className="my-4">
        <FilterPanel
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          searchPlaceholder={t("search_order_placeholder")}
          addButton={
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <ExcelCrudActions
                basePath="/customer/order"
                title={t("import_export_order")}
                templateFileName="template-don-hang.xlsx"
                exportFileName="don-hang.xlsx"
                sheetNote="Workbook gồm 2 sheet: Orders và OrderItems"
              />
              <BtnAdd
                route={"/management/orders/create"}
                name={t("add_order")}
              />
            </div>
          }
        >
          {/* 1. Dropdown Vận chuyển */}
            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label={t("shipping_label")}
                options={statusOptionsMapped}
                value={currentStatus}
                onChange={(val) => setFilter("status", val)}
                placeholder={t("all_status")}
              />
            </div>

            {/* 2. Dropdown Thanh toán */}
            <div className="flex-1 min-w-[150px]">
              <SimpleSelect
                label={t("payment_label")}
                options={paymentOptionsMapped}
                value={currentPaymentStatus}
                onChange={(val) =>
                  setFilter("payment_status", val)
                }
                placeholder={t("all_payment_status")}
              />
            </div>

            {/* 3. Dropdown Phương thức */}
            <div className="flex-1 min-w-[160px]">
              <SimpleSelect
                label={t("method_label")}
                options={methodOptionsMapped}
                value={currentPaymentMethod}
                onChange={(val) =>
                  setFilter("payment_method", val)
                }
                placeholder={t("all_methods")}
              />
            </div>

            {/* 4. Lọc thời gian từ ngày */}
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("from_date")}
              </label>
              <input
                type="date"
                value={currentDateFrom}
                onChange={(e) =>
                  setFilter("date_from", e.target.value)
                }
                className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* 5. Lọc thời gian đến ngày */}
            <div className="flex-1 min-w-[130px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("to_date")}
              </label>
              <input
                type="date"
                value={currentDateTo}
                onChange={(e) =>
                  setFilter("date_to", e.target.value)
                }
                className="w-full h-10 px-2.5 text-sm rounded-lg outline-none transition-colors duration-150 bg-white border border-slate-300 text-slate-800 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:focus:border-sky-500/50 dark:focus:ring-1 dark:focus:ring-sky-500/20"
              />
            </div>

            {/* 6. Lọc khoảng giá trị đơn hàng */}
            <div className="w-[180px] shrink-0">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t("order_value")}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder={t("amount_from")}
                  value={currentAmountMin}
                  onChange={(e) =>
                    setFilter("amount_min", e.target.value)
                  }
                  className="w-full h-10 px-2 text-xs rounded-lg outline-none font-mono transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
                />
                <span className="text-slate-400 dark:text-slate-600 shrink-0">
                  –
                </span>
                <input
                  type="number"
                  placeholder={t("amount_to")}
                  value={currentAmountMax}
                  onChange={(e) =>
                    setFilter("amount_max", e.target.value)
                  }
                  className="w-full h-10 px-2 text-xs rounded-lg outline-none font-mono transition-colors duration-150 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500 dark:bg-[#111827]/40 dark:border-slate-800 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-sky-500/50"
                />
              </div>
            </div>
        </FilterPanel>
      </div>

      {/* KHỐI BẢNG CONTAINER */}
      <div className="rounded-2xl p-6 shadow-xl backdrop-blur-md border transition-colors duration-200 bg-white border-slate-200 dark:bg-[#0D121F]/40 dark:border-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t("order_list_title")}
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

        {/* BẢNG ĐƠN HÀNG */}
        <div className="table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th scope="col" className="px-6 py-4 w-[32%] !text-start">
                    {t("customer_info")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[28%] text-center">
                    {t("order_value_col")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[28%] !text-start">
                    {t("status_time")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[12%] text-center">
                    {t("actions_col")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {orders.length > 0 &&
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge color="nexus">{t("email_badge")}</Badge>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide">
                              {order.user_email || t("guest_customer")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Badge color="nexus">{t("address_badge")}</Badge>
                            <span
                              className="truncate max-w-[240px] text-xs text-slate-600 dark:text-slate-400"
                              title={order.shipping_address}
                            >
                              {order.shipping_address || t("pickup_at_store")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <Badge color="nexus">{t("payment_badge")}</Badge>
                            <span className="text-slate-700 dark:text-slate-300 font-medium font-mono uppercase bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800/60">
                              {order.payment_method}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPaymentStatusClass(
                                order.payment_status,
                              )}`}
                            >
                              {t(
                                `pay_${String(order.payment_status).toLowerCase()}`,
                                { defaultValue: order.payment_status },
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center justify-center gap-2 w-full">
                          <div className="flex items-center gap-2 w-fit">
                            <Badge color="slate">{t("original")}</Badge>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 line-through tracking-wide">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                          {Number(order.discount_amount) > 0 ? (
                            <div className="flex items-center gap-2 w-fit">
                              <Badge color="error">{t("discount")}</Badge>
                              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                                -{formatCurrency(order.discount_amount)}
                              </span>
                            </div>
                          ) : (
                            <div className="h-[20px]"></div>
                          )}
                          <div className="flex items-center gap-2 w-fit mt-0.5">
                            <Badge color="success">{t("final_amount")}</Badge>
                            <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wide bg-emerald-50 dark:bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                              {formatCurrency(order.final_amount)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Badge color="nexus">{t("history_badge")}</Badge>
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {formatFullDateTime(order.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge color="nexus">{t("shipping_badge")}</Badge>
                            <span
                              className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${getOrderStatusClass(
                                order.status,
                              )}`}
                            >
                              {t(
                                `status_${String(order.status).toLowerCase()}`,
                                {
                                  defaultValue: order.status,
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge color="nexus">{t("promo_badge")}</Badge>
                            {order.coupon_code ? (
                              <span className="text-[11px] font-mono font-semibold text-purple-600 dark:text-violet-400 bg-purple-50 dark:bg-violet-500/5 px-2 py-0.5 rounded border border-purple-200 dark:border-violet-500/10">
                                {order.coupon_code}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">
                                {t("no_coupon")}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <BtnActions
                          id={order.id}
                          route={`/management/orders/edit/${order.id}`}
                          onDelete={(id) => console.log("Xóa đơn hàng:", id)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trạng thái trống */}
        {orders.length === 0 && (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm">
            {t("no_orders")}
          </div>
        )}
        {/* PHÂN TRANG */}
        <div className="mt-6 border-t pt-4 border-slate-200 dark:border-slate-800/60">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
