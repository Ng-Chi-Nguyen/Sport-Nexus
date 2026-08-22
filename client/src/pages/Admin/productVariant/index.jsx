import { useState } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { queryClient } from "@/lib/react-query";
import productVariantdApi from "@/api/core/productVariantApi";

// components
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { ConfirmDelete } from "@/components/ui/confirm";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";

const VariantPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "productVariant" });
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

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    { title: t("variant_items"), route: "#" },
  ];

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

  const currentProductId = searchParams.get("product_id") || "";
  const currentStockMin = searchParams.get("stock_min") || "";
  const currentStockMax = searchParams.get("stock_max") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

  const variants = responses?.data?.variants || [];

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["product-variants"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const openConfirm = (productId, name) => {
    setDeleteTarget({ id: productId, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await productVariantdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        revalidator.revalidate();
        ShowToast("success", response.message);
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
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      <div className="my-4">
        <FilterPanel
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
          searchPlaceholder={t("search_product_placeholder")}
          addButton={
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <ExcelCrudActions
                basePath="/core/product-variant"
                title={t("import_export_variant")}
                templateFileName="template-bien-the.xlsx"
                exportFileName="bien-the.xlsx"
              />
              <BtnAdd
                route="/management/product-variants/create"
                name={t("add_variant")}
              />
            </div>
          }
        >
          <div className="flex-1 min-w-[180px]">
            <SimpleSelect
              label={t("product_label")}
              value={currentProductId}
              onChange={(val) => setFilter("product_id", val)}
              options={[
                { slug: "", name: t("all") },
                ...(responses.products || []).map((p) => ({
                  slug: String(p.id),
                  name: p.name,
                })),
              ]}
              placeholder={t("all")}
            />
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[220px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("stock_label")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={t("min_placeholder")}
                value={currentStockMin}
                onChange={(e) => setFilter("stock_min", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <span className="text-slate-400 dark:text-slate-600 shrink-0">
                –
              </span>
              <input
                type="number"
                placeholder={t("max_placeholder")}
                value={currentStockMax}
                onChange={(e) => setFilter("stock_max", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[220px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("price_range")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={t("min_placeholder")}
                value={currentPriceMin}
                onChange={(e) => setFilter("price_min", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <span className="text-slate-400 dark:text-slate-600 shrink-0">
                –
              </span>
              <input
                type="number"
                placeholder={t("max_placeholder")}
                value={currentPriceMax}
                onChange={(e) => setFilter("price_max", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
        </FilterPanel>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("variant_list_title")}
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

      <div className="mt-3 relative bg-white dark:bg-[#0D121F]/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200 min-w-[600px]">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-[#161F32] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-black text-slate-600 dark:text-slate-400 !text-start w-[6%]">
                  ID
                </th>
                <th className="px-6 py-4 font-black text-slate-600 dark:text-slate-400 !text-start">
                  {t("product_info_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("category_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("stock_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("actions_col")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {variants.length > 0 ? (
                variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/40 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {variant.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-[60px] h-[60px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#111827] flex-shrink-0 p-1">
                          <img
                            src={variant.product.thumbnail}
                            alt={variant.product.name}
                            className="w-full h-full object-contain mix-blend-screen"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 tracking-wide">
                            {variant.product.name}
                          </p>
                          <span className="text-[12px] text-slate-500 dark:text-slate-400">
                            {t("base_price_col")}{" "}
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {Number(
                                variant.product.base_price,
                              ).toLocaleString()}
                              đ
                            </span>
                          </span>
                          <div className="mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {t("sale_price_col")}{" "}
                            </span>
                            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                              {Number(variant.price).toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-center justify-center">
                        {variant.VariableAttributes?.length > 0 ? (
                          variant.VariableAttributes.map((attr) => (
                            <Badge key={attr.id} color="info">
                              {attr.attributeKey.name}: {attr.value}{" "}
                              {attr.attributeKey.unit || ""}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                            {t("no_classification")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {variant.stock > 0 ? (
                        <Badge color="success">
                          {t("in_stock_suffix")} {variant.stock}
                        </Badge>
                      ) : (
                        <Badge color="error">{t("out_of_stock")}</Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <BtnActions
                        route={`/management/product-variants/edit/${variant.id}`}
                        id={variant.id}
                        onDelete={() =>
                          openConfirm(variant.id, variant.product.name)
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                  >
                    {t("no_variants")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <ConfirmDelete
          isOpen={isConfirmOpen}
          title={t("delete_variant_title")}
          message={t("delete_variant_message", { name: deleteTarget.name })}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default VariantPage;
