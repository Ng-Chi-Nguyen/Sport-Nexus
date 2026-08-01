import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
// api
import supplierdApi from "@/api/management/supplierApi";
import Pagination from "@/components/ui/pagination";
//lib
import { queryClient } from "@/lib/react-query";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

const SupplierPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "supplier" });
  const response = useLoaderData();

  const breadcrumbData = [
    { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
    { title: t("supply_chain"), route: "" },
    { title: t("suppliers_title"), route: "#" },
  ];

  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentSearch = searchParams.get("search") || "";
  const currentProvince = searchParams.get("province") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1");
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const hasAllClear = currentProvince !== "";

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleProvinceChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("province", value);
    else params.delete("province");
    setSearchParams(params);
  };

  const suppliers = response?.data?.supplier || [];
  const pagination = response?.data?.pagination || [];

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const openConfirm = (supplierId) => {
    setDeleteTarget(supplierId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await supplierdApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        revalidator.revalidate();
        toast.success(response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("error_occurred");
      toast.error(errorMessage);
    }
  };

  const renderAddress = (locationData) => {
    if (!locationData)
      return (
        <span className="text-slate-400 dark:text-slate-500 italic">
          {t("not_updated")}
        </span>
      );

    try {
      const loc =
        typeof locationData === "string"
          ? JSON.parse(locationData)
          : locationData;

      const addressParts = [loc.detail, loc.ward, loc.province].filter(Boolean);
      return addressParts.join(", ");
    } catch (error) {
      return (
        <span className="text-rose-600 dark:text-rose-400">
          {t("address_format_error")}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* THANH TÌM KIẾM & NÚT THÊM */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder={t("search_placeholder")}
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>
        <div className="w-[180px]">
          <SimpleSelect
            placeholder={t("all_provinces")}
            value={currentProvince}
            onChange={(val) => handleProvinceChange(val)}
            options={[
              { slug: "", name: t("all") },
              ...(response.provinces || []).map((p) => ({ slug: p, name: p })),
            ]}
          />
        </div>

        {hasAllClear && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-2.5 py-1.5 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0"
          >
            {t("clear_filter")}
          </button>
        )}

        <ExcelCrudActions
          basePath="/management/supplier"
          title={t("import_export_title")}
          templateFileName="template-nha-cung-cap.xlsx"
          exportFileName="nha-cung-cap.xlsx"
        />

        <BtnAdd
          route={"/management/suppliers/create"}
          name={t("add_supplier")}
        />
      </div>

      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">{t("list_title")}</h2>
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

        {/* BẢNG CHUYỂN ĐỔI SANG LAYOUT 5 CỘT TÁCH BIỆT */}
        <div className="table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[30%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("supplier_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[25%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("address_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[18%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("email_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[15%] text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("phone_col")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 w-[12%] text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("actions_col")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      {/* CỘT 1: LOGO + TÊN + ĐẠI DIỆN */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 p-1.5 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                            <img
                              src={
                                supplier.logo_url ||
                                "https://placehold.co/200x200/png?text=No+Logo"
                              }
                              alt={supplier.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5 pt-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-wide">
                              {supplier.name}
                            </p>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">
                              <span className="text-slate-400 dark:text-slate-500">
                                {t("representative")}
                              </span>{" "}
                              <span className="text-emerald-600 dark:text-green-300 font-medium">
                                {supplier.contact_person}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 2: ĐỊA CHỈ CHI TIẾT */}
                      <td
                        className="px-6 py-4 text-slate-600 dark:text-slate-300 align-top"
                        title={renderAddress(supplier.location_data)}
                      >
                        <div className="line-clamp-3 whitespace-normal break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {renderAddress(supplier.location_data)}
                        </div>
                      </td>

                      {/* CỘT 3: EMAIL */}
                      <td className="px-6 py-4 align-top text-xs font-mono text-sky-600 dark:text-sky-400 break-all">
                        {supplier.email}
                      </td>

                      {/* CỘT 4: SỐ ĐIỆN THOẠI */}
                      <td className="px-6 py-4 align-top text-xs font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {supplier.phone}
                      </td>

                      {/* CỘT 5: HÀNH ĐỘNG HỆ THỐNG */}
                      <td className="px-6 py-4 text-center align-top">
                        <BtnActions
                          route={`/management/suppliers/edit/${supplier.id}`}
                          id={supplier.id}
                          onDelete={() => openConfirm(supplier.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                    >
                      {t("no_suppliers")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDelete
          isOpen={isConfirmOpen}
          title={t("delete_title")}
          message={t("delete_message")}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplierPage;
