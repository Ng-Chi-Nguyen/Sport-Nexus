import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axiosClient";
import { useWishlist } from "@/contexts/WishlistContext";
import { getRecentViewIds } from "@/lib/viewHistory";
import { ProductCard } from "@/components/ui/card";
import { TitleWithIcon } from "@/components/ui/title";
import { Boxes } from "lucide-react";

const Group = ({ title, products, loading, indexOffset = 0 }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-sky-500" />
      </div>
    );
  }
  if (!products || products.length === 0) return null;
  return (
    <section>
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {products.map((p, idx) => (
          <ProductCard key={p.id} product={p} index={indexOffset + idx} />
        ))}
      </div>
    </section>
  );
};

const RelatedProducts = ({ productId }) => {
  const { t } = useTranslation();
  const { ids } = useWishlist();

  const [similar, setSimilar] = useState({ loading: true, products: [] });
  const [liked, setLiked] = useState({ loading: true, products: [] });
  const [viewed, setViewed] = useState({ loading: true, products: [] });

  useEffect(() => {
    let active = true;
    setSimilar({ loading: true, products: [] });
    axiosClient
      .get(`/home/product/related/${productId}`)
      .then((res) => {
        if (!active) return;
        setSimilar({
          loading: false,
          products: (res.data?.products || []).filter(
            (p) => p.id !== productId,
          ),
        });
      })
      .catch(() => {
        if (active) setSimilar({ loading: false, products: [] });
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const fetchByIds = (idsToFetch, setter) => {
    if (!idsToFetch || idsToFetch.length === 0) {
      setter({ loading: false, products: [] });
      return;
    }
    setter({ loading: true, products: [] });
    axiosClient
      .get(`/home/product/by-ids?ids=${idsToFetch.join(",")}`)
      .then((res) => {
        setter({
          loading: false,
          products: (res.data?.products || []).filter(
            (p) => p.id !== productId,
          ),
        });
      })
      .catch(() => setter({ loading: false, products: [] }));
  };

  useEffect(() => {
    fetchByIds(
      ids.filter((id) => id !== productId),
      setLiked,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, productId]);

  useEffect(() => {
    const recent = getRecentViewIds().filter((id) => id !== productId);
    fetchByIds(recent, setViewed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const showAny =
    !similar.loading &&
    !liked.loading &&
    !viewed.loading &&
    (similar.products.length > 0 ||
      liked.products.length > 0 ||
      viewed.products.length > 0);

  if (!showAny) return null;

  return (
    <div className="mt-8 space-y-8">
      <TitleWithIcon icon={Boxes} title={t("related_title")} />
      <Group
        title={t("related_similar")}
        products={similar.products}
        loading={similar.loading}
      />
      <Group
        title={t("related_liked")}
        products={liked.products}
        loading={liked.loading}
        indexOffset={similar.products.length}
      />
      <Group
        title={t("related_viewed")}
        products={viewed.products}
        loading={viewed.loading}
        indexOffset={similar.products.length + liked.products.length}
      />
    </div>
  );
};

export default RelatedProducts;
