import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { ProductCard } from "@/components/ui/card";
import { TitleWithIcon } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 12;

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, page],
    queryFn: () => searchApi.searchProducts({ q, limit: ITEMS_PER_PAGE, page }),
    enabled: !!q,
  });

  const products = data?.success ? data.data.products : [];
  const pagination = data?.success ? data.data.pagination : null;

  const handlePageChange = (newPage) => {
    setSearchParams({ q, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!q) {
    return (
      <div className="min-h-screen py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="mx-auto max-w-5xl text-center py-20 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md px-6">
          <Search
            size={48}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
          />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("search_page_title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("search_page_prompt")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-5xl mt-6 md:mt-8 px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: t("breadcrumb_home"), route: "/" },
            { title: t("search_breadcrumb_title", { query: q }), route: "" },
          ]}
        />

        <TitleWithIcon
          icon={Search}
          title={t("search_results_heading", { query: q })}
        />
        {pagination && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            {t("search_results_count", { count: pagination.totalItems })}
          </p>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md px-6">
            <Search
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t("search_no_results_title")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("search_no_results_desc")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                >
                  {t("pagination_prev")}
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3.5 py-2 text-sm rounded-xl border transition-colors shadow-sm cursor-pointer ${
                      p === page
                        ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                >
                  {t("pagination_next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
