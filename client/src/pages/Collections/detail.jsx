import { useLoaderData, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ui/card";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";

const CollectionDetailPage = () => {
  const { t } = useTranslation();
  const collection = useLoaderData();

  if (!collection) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] font-sans antialiased flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 dark:text-slate-500 text-lg font-medium">
            {t("collections_not_found")}
          </p>
          <Link
            to="/bo-suu-tap"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-sky-600 dark:text-sky-400"
          >
            <ArrowLeft size={16} />
            {t("collections_back")}
          </Link>
        </div>
      </div>
    );
  }

  const products = collection?.products || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 mt-12">
          <Breadcrumbs
            data={[
              { title: t("breadcrumb_home"), route: "/" },
              { title: t("collections_title"), route: "/bo-suu-tap" },
              { title: collection.name, route: "" },
            ]}
          />
        </div>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 mb-8">
          <div className="aspect-[21/9] max-h-72 overflow-hidden bg-slate-800 dark:bg-[#0D121F]">
            {collection.banner ? (
              <img
                src={collection.banner}
                alt={collection.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-sky-800">
                <span className="text-white text-3xl font-black">
                  {collection.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 bg-gradient-to-t from-slate-900 to-transparent">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {collection.name}
            </h1>
            {collection.category && (
              <p className="text-sm text-sky-300 mt-1">
                {collection.category.name}
              </p>
            )}
            {collection.description && (
              <p className="text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t("collections_products", { count: products.length })}
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 dark:text-slate-500 text-lg font-medium">
              {t("collections_products_empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;
