import { useState, useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Breadcrumbs from "@/components/ui/breadcrumbs";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import VariantSelector from "./components/VariantSelector";
import ActionBar from "./components/ActionBar";
import CouponInput from "./components/CouponInput";
import ProductTabs from "./components/ProductTabs";
import ReviewList from "./components/ReviewList";

const ProductDetail = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);

  if (!loaderData?.success || !loaderData?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    );
  }

  const product = loaderData.data;
  const variants = product.ProductVariants || [];
  const ratings = product.Reviews || [];
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
    attrKeys.forEach((attr) => {
      const otherSelected = Object.entries(selectedAttrs).filter(([k]) => k !== attr.name);
      if (otherSelected.length === 0) {
        result[attr.name] = new Set(attr.values.map((v) => v.value));
        return;
      }
      const matching = variants.filter((v) =>
        otherSelected.every(([key, val]) =>
          (v.VariableAttributes || []).some(
            (va) => va.attributeKey.name === key && va.value === val,
          ),
        ),
      );
      result[attr.name] = new Set(
        matching.flatMap((v) =>
          (v.VariableAttributes || [])
            .filter((va) => va.attributeKey.name === attr.name)
            .map((va) => va.value),
        ),
      );
    });
    return result;
  }, [selectedAttrs, variants, attrKeys]);

  const hasAttrs = attrKeys.length > 0;
  const allAttrsSelected = hasAttrs && Object.keys(selectedAttrs).length >= attrKeys.length;

  const selectedVariant = useMemo(() => {
    const entries = Object.entries(selectedAttrs);
    if (entries.length === 0 || entries.length < attrKeys.length) return undefined;
    return variants.find((v) =>
      entries.every(([key, val]) =>
        (v.VariableAttributes || []).some(
          (va) => va.attributeKey.name === key && va.value === val,
        ),
      ),
    );
  }, [selectedAttrs, variants, attrKeys.length]);

  const currentPrice = Number(
    selectedVariant
      ? selectedVariant.price
      : variants.length > 0
        ? Math.min(...variants.map((v) => Number(v.price)))
        : product.base_price,
  );

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const currentStock = useMemo(() => {
    const entries = Object.entries(selectedAttrs);
    if (entries.length === 0) return totalStock || null;

    const matching = variants.filter((v) =>
      entries.every(([key, val]) =>
        (v.VariableAttributes || []).some(
          (va) => va.attributeKey.name === key && va.value === val,
        ),
      ),
    );

    if (matching.length === 0) return 0;
    if (allAttrsSelected) return selectedVariant ? selectedVariant.stock : 0;
    return matching.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [selectedAttrs, variants, totalStock, allAttrsSelected, selectedVariant]);

  const maxStock = currentStock ?? (totalStock || 999);

  return (
    <div className="min-h-screen py-2 md:py-6">
      <div className="mx-auto max-w-5xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
        <ProductImages
          thumbnail={product.thumbnail}
          images={product.ProductImages}
        />

        <div className="space-y-4">
          <ProductInfo
            product={product}
            avgRating={avgRating}
            totalReviews={ratings.length}
            currentPrice={currentPrice}
          />

          <VariantSelector
            attrKeys={attrKeys}
            selectedAttrs={selectedAttrs}
            availableValues={availableValues}
            onSelect={(key, value) => {
              setSelectedAttrs((prev) => ({ ...prev, [key]: value }));
              setQuantity(1);
            }}
          />

          <ActionBar
            quantity={quantity}
            maxStock={maxStock}
            onQtyChange={setQuantity}
            wishlisted={wishlisted}
            onWishlist={() => setWishlisted((p) => !p)}
            onShare={async () => {
              const url = window.location.href;
              if (navigator.share)
                await navigator.share({ title: product.name, url });
              else await navigator.clipboard.writeText(url);
            }}
            currentStock={currentStock}
            onAddToCart={() => {}}
            onBuyNow={() => {}}
          />

          <CouponInput
            couponCode={couponCode}
            onCodeChange={setCouponCode}
            onApply={() => {
              if (!couponCode.trim()) return;
              setCouponMsg({
                type: "success",
                text: "Mã giảm giá không hợp lệ (demo)",
              });
            }}
            message={couponMsg}
          />
        </div>
      </div>

      <ProductTabs description={product.description} />
      <ReviewList reviews={ratings} />
    </div>
    </div>
  );
};

export default ProductDetail;
