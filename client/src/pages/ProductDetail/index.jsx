import { useState, useEffect, useMemo, useCallback } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { addToViewHistory } from "@/lib/viewHistory";
import {
  addToSearchHistory,
  clearLastSearchTerm,
  getLastSearchTerm,
} from "@/lib/searchHistory";

import Breadcrumbs from "@/components/ui/breadcrumbs";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import VariantSelector from "./components/VariantSelector";
import ActionBar from "./components/ActionBar";
import ProductTabs from "./components/ProductTabs";
import ReviewList from "./components/ReviewList";
import RelatedProducts from "./components/RelatedProducts";

const ProductDetail = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const { addItem } = useCart();

  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const term = getLastSearchTerm();
    if (!term) return;
    const timer = setTimeout(() => {
      addToSearchHistory(term);
      clearLastSearchTerm();
    }, 120000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaderData?.success && loaderData.data?.id) {
      addToViewHistory(loaderData.data.id);
    }
  }, [loaderData]);

  const product = loaderData?.success ? loaderData.data : null;
  const { isLiked, toggleLike } = useWishlist();
  const wishlisted = product ? isLiked(product.id) : false;
  const variants = product?.ProductVariants || [];
  const ratings = product?.Reviews || [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length
      : 0;

  const attrKeys = useMemo(() => {
    const map = {};
    variants.forEach((v) =>
      (v.VariableAttributes || []).forEach((va) => {
        const kn = va.attributeKey.name;
        if (!map[kn]) map[kn] = { ...va.attributeKey, values: [] };
        if (!map[kn].values.find((x) => x.value === va.value))
          map[kn].values.push({ value: va.value, vaId: va.id });
      }),
    );
    return Object.values(map);
  }, [variants]);

  const availableValues = useMemo(() => {
    const result = {};
    attrKeys.forEach((k) => {
      result[k.name] = new Set();
    });
    const entries = Object.entries(selectedAttrs);
    attrKeys.forEach((attr) => {
      const others = entries.filter(([k]) => k !== attr.name);
      variants.forEach((v) => {
        if (Number(v.stock || 0) <= 0) return;
        const attrs = v.VariableAttributes || [];
        const matchesOthers = others.every(([k, val]) =>
          attrs.some((va) => va.attributeKey.name === k && va.value === val),
        );
        if (!matchesOthers) return;
        const va = attrs.find((a) => a.attributeKey.name === attr.name);
        if (va) result[attr.name].add(va.value);
      });
    });
    return result;
  }, [variants, selectedAttrs, attrKeys]);

  const selectedVariant = useMemo(() => {
    const entries = Object.entries(selectedAttrs);
    if (entries.length === 0 || entries.length < attrKeys.length) return null;
    return (
      variants.find((v) =>
        entries.every(([key, val]) =>
          (v.VariableAttributes || []).some(
            (va) => va.attributeKey.name === key && va.value === val,
          ),
        ),
      ) || null
    );
  }, [selectedAttrs, variants, attrKeys.length]);

  const currentPrice = selectedVariant
    ? Number(selectedVariant.price)
    : variants.length > 0
      ? Math.min(...variants.map((v) => Number(v.price)))
      : product
        ? Number(product.base_price)
        : 0;

  const currentStock = useMemo(() => {
    if (selectedVariant) return Number(selectedVariant.stock ?? 0);
    if (variants.length === 0) return null;
    const entries = Object.entries(selectedAttrs);
    let pool = variants;
    for (const [key, val] of entries) {
      pool = pool.filter((v) =>
        (v.VariableAttributes || []).some(
          (va) => va.attributeKey.name === key && va.value === val,
        ),
      );
    }
    if (pool.length === 0) {
      return entries.length >= attrKeys.length ? 0 : null;
    }
    return pool.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  }, [selectedVariant, selectedAttrs, variants, attrKeys.length]);

  const maxStock = currentStock ?? 999;

  const handleAddToCart = useCallback(() => {
    if (attrKeys.length > 0 && !selectedVariant) {
      ShowToast("warning", "Vui lòng chọn đầy đủ phân loại");
      return;
    }
    const variantId = selectedVariant?.id || variants[0]?.id;
    if (!variantId) {
      ShowToast("error", "Sản phẩm không có biến thể");
      return;
    }
    addItem(variantId, quantity, product, selectedVariant || variants[0]);
  }, [attrKeys.length, selectedVariant, variants, quantity, addItem, product]);

  const handleBuyNow = useCallback(() => {
    if (attrKeys.length > 0 && !selectedVariant) {
      ShowToast("warning", "Vui lòng chọn đầy đủ phân loại");
      return;
    }
    const variantId = selectedVariant?.id || variants[0]?.id;
    if (!variantId) {
      ShowToast("error", "Sản phẩm không có biến thể");
      return;
    }
    const variant = selectedVariant || variants[0];
    navigate("/thanh-toan", {
      state: {
        items: [
          {
            product_variant_id: variantId,
            quantity,
            price_at_purchase: Number(variant.price),
            product,
            variant,
          },
        ],
      },
    });
  }, [attrKeys.length, selectedVariant, variants, quantity, product, navigate]);

  if (!loaderData?.success || !loaderData?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-800 dark:text-slate-100">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Không tìm thấy sản phẩm
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 mt-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            ...(product.category
              ? [
                  {
                    title: product.category.name,
                    route: `/products?category=${product.category.slug || product.category.id}`,
                  },
                ]
              : []),
            { title: product.name, route: "" },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6">
          <ProductImages
            thumbnail={product.thumbnail}
            images={product.ProductImages}
          />

          <div className="relative z-10 space-y-6 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
            <ProductInfo
              product={product}
              avgRating={avgRating}
              totalReviews={ratings.length}
              currentPrice={currentPrice}
              quantity={quantity}
            />

            <VariantSelector
              attrKeys={attrKeys}
              selectedAttrs={selectedAttrs}
              availableValues={availableValues}
              onSelect={(key, value) => {
                setSelectedAttrs((prev) => {
                  const next = { ...prev };
                  if (value === "") delete next[key];
                  else next[key] = value;
                  return next;
                });
                setQuantity(1);
              }}
            />

            <ActionBar
              quantity={quantity}
              maxStock={maxStock}
              onQtyChange={setQuantity}
              wishlisted={wishlisted}
              onWishlist={() => product && toggleLike(product.id)}
              onShare={async () => {
                const url = window.location.href;
                if (navigator.share)
                  await navigator.share({ title: product.name, url });
                else await navigator.clipboard.writeText(url);
              }}
              currentStock={currentStock}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <ProductTabs description={product.description} />
          <ReviewList reviews={ratings} />
        </div>

        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
