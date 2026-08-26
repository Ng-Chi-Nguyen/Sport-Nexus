import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd, BtnActions } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import Badge from "@/components/ui/badge";
import { SimpleSelect } from "@/components/ui/select";
import { ConfirmDelete } from "@/components/ui/confirm";
import attributeKeyApi from "@/api/core/attributrKeyApi";
import LoaderAttr from "@/loaders/core/attributeKey";
import { queryClient } from "@/lib/react-query";
import ShowToast from "@/components/ui/toast";
import Pagination from "@/components/ui/pagination";
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
import { useTranslation } from "react-i18next";

const AttributeKey = () => {
  const { t } = useTranslation();
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: "", name: "" });
  const [units, setUnits] = useState([]);

  const breadcrumbData = [
    { title: <LayoutDashboard size={20} />, route: "" },
    {
      title: t("attributeKey.product_warehouse_management"),
      route: "",
    },
    { title: t("attributeKey.product_attributes"), route: "" },
  ];

  const currentSearch = searchParams.get("search") || "";
  const currentUnit = searchParams.get("unit") || "";

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

  useEffect(() => {
    LoaderAttr.getDistinctUnits().then((res) => {
      if (res?.data) setUnits(res.data);
    });
  }, []);

  const attributes = responses?.data?.attribute || [];

  const openConfirm = (id, name) => {
    setDeleteTarget({ id, name });
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await attributeKeyApi.delete(deleteTarget.id);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
        revalidator.revalidate();
        ShowToast("success", response.message);
        setIsConfirmOpen(false);
      }
    } catch (error) {
      setIsConfirmOpen(false);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        t("attributeKey.error_occurred");
      ShowToast("error", errorMessage);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["attribute-keys"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  const handleUnitClick = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("unit", value);
    else params.delete("unit");
    setSearchParams(params);
  };

  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs data={breadcrumbData} />

      {/* TỐI ƯU MOBILE: Thay đổi cấu trúc thành flex-col trên điện thoại để không bị bóp méo giao diện */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative group">
            <SearchTable
              placeholder={t("attributeKey.search_placeholder")}
              value={searchInput}
              onChange={(val) => setSearchInput(val)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <SimpleSelect
              placeholder={t("attributeKey.all_units")}
              value={currentUnit}
              onChange={(val) => handleUnitClick(val)}
              options={[
                { slug: "", name: t("attributeKey.all") },
                ...units.map((u) => ({
                  slug: u || "null",
                  name: u || t("attributeKey.none"),
                })),
              ]}
            />
          </div>
          {/* Cụm nút Excel và Thêm mới: Dàn ngang cuộn hoặc căn chỉnh gọn gàng trên mobile */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ExcelCrudActions
              basePath="/core/variant-attribute-key"
              title={t("attributeKey.import_export")}
              templateFileName="template-thuoc-tinh.xlsx"
              exportFileName="thuoc-tinh.xlsx"
            />

            <BtnAdd
              route={"/management/attribute-key/create"}
              className="w-full sm:w-auto"
              name={t("attributeKey.add_attribute")}
            />
          </div>
        </div>
      </div>

      <div className="shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">{t("attributeKey.title")}</h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("attributeKey.reload")}
          >
            <RefreshCw
              size={18}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />
          </button>
        </div>
        <div className="table-retro">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-[6%]"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("attributeKey.attribute_name")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("attributeKey.unit")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("attributeKey.used_count")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {t("attributeKey.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {attributes.length > 0 ? (
                  attributes.map((attr) => (
                    <tr
                      key={attr.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {attr.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
                        {attr.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge color="blue">
                          {attr.unit || t("attributeKey.none")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                        20 {t("attributeKey.products_suffix")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <BtnActions
                          route={`/management/attribute-key/edit/${attr.id}`}
                          id={attr.id}
                          onDelete={() => openConfirm(attr.id, attr.name)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm"
                    >
                      {t("attributeKey.no_attributes")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <Pagination
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      <ConfirmDelete
        isOpen={isConfirmOpen}
        title={t("attributeKey.confirm_delete_title")}
        message={t("attributeKey.confirm_delete_message", {
          name: deleteTarget.name,
        })}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default AttributeKey;
