import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import ShowToast from "@/components/ui/toast";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import collectionApi from "@/api/management/collectionApi";
import Pagination from "@/components/ui/pagination";
import { queryClient } from "@/lib/react-query";
import { useTranslation } from "react-i18next";

const CollectionPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "collection" });
  const responses = useLoaderData();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const currentActive = searchParams.get("is_active") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const isFirstRender = useRef(true);

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
      title: t("collection_management"),
      route: "",
    },
  ];

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

  const collections = responses?.data?.list_collections || [];
  const pagination = responses?.data?.pagination;

  const handleActiveClick = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set("is_active", value);
    else params.delete("is_active");
    setSearchParams(params);
  };

  const openConfirm = (collectionId) => {
    setDeleteTarget(collectionId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await collectionApi.delete(deleteTarget);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["collections"] });
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    setTimeout(() => revalidator.revalidate(), 0);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 relative group">
          <SearchTable
            placeholder={t("search_collection_placeholder")}
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#0D121F]/20 border border-slate-200 dark:border-slate-900/60 shadow-sm dark:shadow-none">
          {[
            { value: "", label: t("all") },
            { value: "true", label: t("active_status") },
            { value: "false", label: t("inactive_status") },
          ].map((tab) => {
            const isActive = currentActive === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleActiveClick(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <BtnAdd
          route={"/management/collections/create"}
          className="w-full md:w-[30%]"
          name={t("add_collection")}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">{t("collection_list_title")}</h2>
          <button
            onClick={handleRefresh}
            disabled={revalidator.state === "loading"}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("reload")}
          >
            <RefreshCw
              size={18}
              className={revalidator.state === "loading" ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="table-retro mb-4">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 min-w-[700px]">
              <thead>
                <tr>
                  <th scope="col">{t("collection_banner")}</th>
                  <th scope="col">{t("collection_name_column")}</th>
                  <th scope="col">{t("collection_category")}</th>
                  <th scope="col">{t("status_column")}</th>
                  <th scope="col">{t("slug_column")}</th>
                  <th scope="col">{t("actions_column")}</th>
                </tr>
              </thead>
              <tbody>
                {collections.length > 0 ? (
                  collections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="whitespace-nowrap">
                        <img
                          src={
                            collection.banner ||
                            "https://placehold.co/200x200/png?text=No+Banner"
                          }
                          alt={collection.name}
                          className="w-[70px] h-auto object-cover m-auto rounded"
                        />
                      </td>
                      <td className="text-center">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {collection.name}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {collection.category?.name || "-"}
                        </span>
                      </td>
                      <td className="text-center">
                        <Badge color={collection.is_active ? "green" : "indigo"}>
                          {collection.is_active
                            ? t("active_status")
                            : t("inactive_status")}
                        </Badge>
                      </td>
                      <td className="text-center font-mono text-slate-500 dark:text-slate-500 text-xs">
                        {collection.slug}
                      </td>
                      <td>
                        <div className="flex gap-3 justify-center">
                          <BtnEdit
                            route={`/management/collections/edit/${collection.id}`}
                            name={t("edit_btn")}
                          />
                          <BtnDelete
                            name={t("delete_btn")}
                            onClick={() => openConfirm(collection.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm"
                    >
                      {t("no_collections_found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          totalPages={pagination?.totalPages || 1}
          currentPage={pagination?.currentPage || 1}
          onPageChange={handlePageChange}
        />
      </div>

      <ConfirmDelete
        isOpen={isConfirmOpen}
        title={t("delete_collection_title")}
        message={t("delete_collection_message")}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default CollectionPage;
