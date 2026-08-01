import { useState } from "react";
import { BtnAdd, BtnDelete, BtnEdit } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import FilterPanel from "@/components/ui/FilterPanel";
import RangeInput from "@/components/ui/RangeInput";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import {
  formatDate,
  formatCurrency,
  formatFullDateTime,
} from "@/utils/formatters";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/ui/confirm";
import purchaseOrderdApi from "@/api/management/purchaseOrderApi";
import { queryClient } from "@/lib/react-query";
import useTableFilters from "@/hooks/useTableFilters";
import { PURCHASE_STATUS_OPTIONS } from "@/constants/management/purchaseOrder";
import { getPurchaseStatusDetails } from "@/utils/statusStyles";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

const PurchaseOrderPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "purchaseOrder" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const responses = useLoaderData();

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("supply_chain"), route: "" },
    { title: t("purchase_title"), route: "" },
  ];

  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

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

  const currentStatus = searchParams.get("status") || "";
  const currentSupplierId = searchParams.get("supplier_id") || "";
  const currentDateFrom = searchParams.get("date_from") || "";
  const currentDateTo = searchParams.get("date_to") || "";
  const currentCostMin = searchParams.get("cost_min") || "";
  const currentCostMax = searchParams.get("cost_max") || "";

  const purchases = responses.data?.purchaseOrders || [];

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (purchaseId) => {
    setDeleteTarget({ id: purchaseId });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await purchaseOrderdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
        revalidator.revalidate();
        toast.success(response.message);
      }
      setIsConfirmOpen(false);
    } catch (error) {
      setIsConfirmOpen(false);
      toast.error(
        error.message ||
          error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          t("error_occurred"),
      );
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
        addButton={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ExcelCrudActions
              basePath="/management/purchase-order"
              title={t("import_export_title")}
              templateFileName="template-nhap-hang.xlsx"
              exportFileName="nhap-hang.xlsx"
              sheetNote="Workbook gồm 2 sheet: PurchaseOrders và PurchaseOrderItems"
            />
            <BtnAdd
              route={"/management/purchase/create"}
              name={t("add_purchase")}
            />
          </div>
        }
      >
        <SimpleSelect
          label={t("status_label")}
          value={currentStatus}
          onChange={(val) => setFilter("status", val)}
          options={PURCHASE_STATUS_OPTIONS.map((o) => ({
            slug: o.slug,
            name: tc(o.name),
          }))}
          placeholder={t("all")}
        />
        <SimpleSelect
          label={t("supplier_label")}
          value={currentSupplierId}
          onChange={(val) => setFilter("supplier_id", val)}
          options={[
            { slug: "", name: t("all") },
            ...(responses.suppliers || []).map((s) => ({
              slug: String(s.id),
              name: s.name,
            })),
          ]}
          placeholder={t("all")}
        />
        <RangeInput
          label={t("order_date_label")}
          type="date"
          minValue={currentDateFrom}
          maxValue={currentDateTo}
          onMinChange={(v) => setFilter("date_from", v)}
          onMaxChange={(v) => setFilter("date_to", v)}
        />
        <RangeInput
          label={t("total_cost_label")}
          type="number"
          minValue={currentCostMin}
          maxValue={currentCostMax}
          onMinChange={(v) => setFilter("cost_min", v)}
          onMaxChange={(v) => setFilter("cost_max", v)}
          placeholderMin={t("min_placeholder")}
          placeholderMax={t("max_placeholder")}
        />
      </FilterPanel>

      <div className="flex items-center justify-between my-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("list_title")}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={revalidator.state === "loading"}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("reload")}
        >
          <RefreshCw
            size={18}
            className={revalidator.state === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
        <div className="table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("purchase_code_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("order_date_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("expected_date_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("price_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("items_count_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("status_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("actions_col")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {purchases.length > 0 ? (
                  purchases.map((purchase, index) => (
                    <tr
                      key={purchase.id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-center font-bold">
                        <p className="text-sky-600 dark:text-sky-400 text-sm">
                          #PO-{purchase.id}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center text-xs">
                        {formatFullDateTime(purchase.order_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center text-xs">
                        {formatDate(purchase.expected_delivery_date)}
                      </td>
                      <td className="px-6 py-4 font-black text-rose-600 dark:text-rose-400 text-center font-mono text-xs">
                        {formatCurrency(purchase.total_cost)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge color="blue">
                          {purchase.PurchaseOrderItems.length} {t("items_suffix")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          color={
                            getPurchaseStatusDetails(purchase.status).color
                          }
                        >
                          {getPurchaseStatusDetails(purchase.status).label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <BtnEdit
                            route={`/management/purchase/edit/${purchase.id}`}
                            name={t("edit_btn")}
                          />
                          <BtnDelete
                            name={t("delete_btn")}
                            onClick={() => openConfirm(purchase.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm"
                    >
                      {t("no_purchases")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title={t("delete_title")}
          message={t("delete_message")}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
