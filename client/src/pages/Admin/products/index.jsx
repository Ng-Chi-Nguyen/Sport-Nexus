import { useState } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnDelete, BtnEdit, BtnAdd } from "@/components/ui/button";
import { SimpleSelect } from "@/components/ui/select";
import {
  LayoutDashboard,
  PackageCheck,
  PackageX,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useLoaderData, useRevalidator } from "react-router-dom";
import Badge from "@/components/ui/badge";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import productdApi from "@/api/core/productApi";
import ShowToast from "@/components/ui/toast";
import { queryClient } from "@/lib/react-query";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

const ProductPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "product" });
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
    {
      title: <LayoutDashboard size={20} />,
      route: "",
    },
    {
      title: t("product_warehouse_management"),
      route: "",
    },
    {
      title: t("product_management"),
      route: "",
    },
  ];

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });

  const currentIsActive = searchParams.get("is_active") || "";
  const currentCategory = searchParams.get("category_id") || "";
  const currentBrand = searchParams.get("brand_id") || "";
  const currentSupplier = searchParams.get("supplier_id") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

  const products = responses?.data?.list_products || [];

  const openConfirm = (productId, name) => {
    setDeleteTarget({ id: productId, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await productdApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["products"] });
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
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
                basePath="/core/product"
                title={t("import_export_product")}
                templateFileName="template-san-pham.xlsx"
                exportFileName="san-pham.xlsx"
              />
              <BtnAdd
                route="/management/products/create"
                name={t("add_product")}
              />
            </div>
          }
        >
          <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[230px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("status")}
            </label>
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-[#111827]/60 border border-slate-200 dark:border-slate-800 rounded-lg h-10">
              {[
                { value: "", label: t("all") },
                { value: "true", label: t("in_stock") },
                { value: "false", label: t("out_of_stock") },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter("is_active", tab.value)}
                  className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors h-full ${
                    currentIsActive === tab.value
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/20"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <SimpleSelect
              label={t("category_label")}
              value={currentCategory}
              onChange={(val) => setFilter("category_id", val)}
              options={[
                { slug: "", name: t("all") },
                ...(responses.categories || []).map((c) => ({
                  slug: String(c.id),
                  name: c.name,
                })),
              ]}
              placeholder={t("all")}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <SimpleSelect
              label={t("brand_label")}
              value={currentBrand}
              onChange={(val) => setFilter("brand_id", val)}
              options={[
                { slug: "", name: t("all") },
                ...(responses.brands || []).map((b) => ({
                  slug: String(b.id),
                  name: b.name,
                })),
              ]}
              placeholder={t("all")}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <SimpleSelect
              label={t("supplier_label")}
              value={currentSupplier}
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
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px] lg:w-[220px] shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {t("price_range")}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={t("min_price_placeholder")}
                value={currentPriceMin}
                onChange={(e) => setFilter("price_min", e.target.value)}
                className="w-full h-10 px-2 text-xs rounded-lg bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <span className="text-slate-400 dark:text-slate-600 shrink-0">
                –
              </span>
              <input
                type="number"
                placeholder={t("max_price_placeholder")}
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
          {t("product_list_title")}
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
                <th className="px-6 py-4 font-black text-slate-600 dark:text-slate-400 !text-start">
                  {t("product_info_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("category_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("status_col")}
                </th>
                <th className="px-6 py-4 font-black text-center text-slate-600 dark:text-slate-400">
                  {t("actions_col")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161F32]/40 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-slate-100 dark:bg-[#161F32] flex-shrink-0">
                          <img
                            src={
                              product.thumbnail ||
                              "https://placehold.co/60x60/png?text=No+Img"
                            }
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge color="blue">{product.category.name}</Badge>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">
                              {formatCurrency(product.base_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge color="purple">
                          {t("brand_col")}: {product.brand.name}
                        </Badge>
                        <Badge color="pink">
                          {t("supplier_col")}: {product.supplier.name}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.is_active ? (
                        <Badge color="green">
                          <PackageCheck size={14} />{" "}
                          <span className="ml-1">{t("in_stock")}</span>
                        </Badge>
                      ) : (
                        <Badge color="red">
                          <PackageX size={14} />
                          <span className="ml-1">{t("out_of_stock")}</span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <BtnEdit
                          route={`/management/products/edit/${product.id}`}
                          name={t("edit_btn")}
                        />
                        <BtnDelete
                          name={t("delete_btn")}
                          onClick={() => openConfirm(product.id, product.name)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-400 dark:text-slate-500 italic"
                  >
                    {t("no_products")}
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
          title={t("delete_product_title")}
          message={t("delete_product_message", {
            name: deleteTarget.name,
          })}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProductPage;
