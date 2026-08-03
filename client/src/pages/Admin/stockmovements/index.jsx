import { useState } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { SimpleSelect } from "@/components/ui/select";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useRevalidator } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
import { Download, Loader2 } from "lucide-react";
import { getStockBadgeClass } from "@/utils/statusStyles";
import excelCrudImportApi from "@/api/management/excelCrudImportApi";
import { useTranslation } from "react-i18next";
import FilterPanel from "@/components/ui/FilterPanel";
import useTableFilters from "@/hooks/useTableFilters";

const StockPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "stockMovement" });
  const response = useLoaderData() || {};

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("product_warehouse_management"), route: "" },
    { title: t("stock_title"), route: "#" },
  ];

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

  const currentProductId = searchParams.get("product_id") || "";
  const currentStockMin = searchParams.get("stock_min") || "";
  const currentStockMax = searchParams.get("stock_max") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";

  const queryClient = useQueryClient();

  const [exportLoading, setExportLoading] = useState(false);

  const stocks = response?.data?.list_stocks || [];
  const paginationInfo = response?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await excelCrudImportApi.export("/management/stock");
      const url = window.URL.createObjectURL(res);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ton-kho.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      ShowToast("success", t("export_success"));
    } catch (err) {
      ShowToast("error", err?.message || t("export_failed"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["stocks"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
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
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {exportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {exportLoading ? t("exporting") : t("export_btn")}
            </button>
            <BtnAdd
              route={"/management/stocks/create"}
              name={t("add_movement")}
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
              ...(response.products || []).map((p) => ({
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

      {/* KHỐI NỀN TỔNG - Hỗ trợ sáng/tối */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
        {/* HEADER TIÊU ĐỀ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-wide">
                {t("movement_title")}
              </h2>
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

            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#111827]/60 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-900/60 w-fit">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                {t("legend")}
              </span>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                <span>{t("danger_legend")}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                <span>{t("warning_legend")}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></div>
                <span>{t("stable_legend")}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span>{t("safe_legend")}</span>
              </div>
            </div>
          </div>

          <div className="text-xs bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-medium h-fit self-end">
            {t("total_items")}{" "}
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              {paginationInfo.totalItems || stocks.length}
            </span>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="mb-2 table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-4 w-[12%]">
                    {t("id_col")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[40%] !text-start">
                    {t("product_col")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[28%] text-center">
                    {t("attributes_col")}
                  </th>
                  <th scope="col" className="px-6 py-4 w-[20%] text-center">
                    {t("stock_qty_col")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stocks.length > 0 ? (
                  stocks.map((stock) => {
                    const product = stock.product;
                    const thumbnail = product?.thumbnail;
                    const productName = product?.name || t("unknown_product");
                    const price = stock.price ? Number(stock.price) : 0;
                    const currentStock = stock.stock ?? 0;

                    return (
                      <tr key={stock.id}>
                        {/* Cột ID biến thể */}
                        <td className="px-6 py-5 font-mono text-xs text-slate-500 dark:text-slate-400 text-center">
                          #VAR-{stock.id}
                        </td>

                        {/* Cột Chi tiết sản phẩm */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111827] overflow-hidden flex-shrink-0 p-0.5">
                              <img
                                crossOrigin="anonymous"
                                src={thumbnail || "https://placehold.co/50"}
                                alt={productName}
                                className="w-full h-full object-contain mix-blend-screen"
                                onError={(e) => {
                                  e.target.src = "https://placehold.co/50";
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 max-w-[400px] tracking-wide">
                                {productName}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {t("base_price")}{" "}
                                <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {Number(price).toLocaleString()}
                                </span>{" "}
                                đ
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột Thuộc tính biến thể */}
                        <td className="px-6 py-5 text-center">
                          {stock.VariableAttributes?.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {stock.VariableAttributes.map((attr) => (
                                <span
                                  key={attr.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111827]/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                                >
                                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                                    {attr.attributeKey.name}:
                                  </span>
                                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                                    {attr.value} {" - "}
                                    {attr.attributeKey.unit || ""}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                              {t("default_attr")}
                            </span>
                          )}
                        </td>

                        {/* Cột hiển thị Số lượng */}
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[50px] px-3 py-1 rounded-lg text-sm font-bold border ${getStockBadgeClass(currentStock)}`}
                            >
                              {currentStock}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                    >
                      {t("no_data")}
                    </td>{" "}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
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

export default StockPage;
