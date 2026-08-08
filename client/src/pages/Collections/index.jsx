import { useLoaderData, Link } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
import { TitleWithIcon } from "@/components/ui/title";

const CollectionsPage = () => {
  const { t } = useTranslation();
  const data = useLoaderData() || { collections: [] };
  const collections = data?.collections || [];
  console.log(data);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 mt-12">
          <Breadcrumbs
            data={[
              { title: t("breadcrumb_home"), route: "/" },
              { title: t("collections_title"), route: "" },
            ]}
          />
        </div>

        <div className="mb-8">
          <TitleWithIcon icon={LayoutGrid} title={t("collections_title")} />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("collections_subtitle")}
          </p>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/bo-suu-tap/${collection.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[16/9] overflow-hidden bg-slate-800 dark:bg-[#0D121F]">
                  {collection.banner ? (
                    <img
                      src={collection.banner}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-sky-800">
                      <span className="text-white font-black text-lg">
                        {collection.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      {collection.name}
                    </h2>
                    <ArrowRight
                      size={18}
                      className="text-sky-400 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                  {collection.category && (
                    <p className="text-xs text-slate-400 mt-1">
                      {collection.category.name}
                    </p>
                  )}
                  {collection.description && (
                    <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 dark:text-slate-500 text-lg font-medium">
              {t("collections_empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
