// adminLoaders.js
import { queryClient } from "@/lib/react-query";
import LoaderPermissions from "@/loaders/permissionLoader";
import LoaderUser from "@/loaders/userLoader";
import LoaderBrand from "@/loaders/brandLoader";
import LoaderSupplier from "@/loaders/supplierLoader";
import LoaderCategory from "@/loaders/categoryLoader";
import LoaderProduct from "@/loaders/productLoader";
import LoaderAttr from "@/loaders/attributeKey";
import LoaderPurchase from "@/loaders/purchaseOrder";
import LoaderProductVariant from "@/loaders/productVariantLoader";
import LoaderCoupon from "@/loaders/couponLoadet";
import LoaderOrder from "@/loaders/customer/orderLoader";
import LoaderStock from "@/loaders/management/stockMovement";

// Hàm tiện ích bóc tách số trang từ URL
const getPage = (request) => new URL(request.url).searchParams.get("page") || 1;

export const usersLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["users", getPage(request)],
    queryFn: () => LoaderUser.getAllUsers(getPage(request)),
  });

export const userEditLoader = (args) => LoaderUser.getUserById(args);

export const userAddRoleLoader = async ({ params, request }) => {
  const [user, allPermissions] = await Promise.all([
    LoaderUser.getUserById({ params }),
    LoaderPermissions.getAllPermissions(getPage(request)),
  ]);
  return { user, allPermissions };
};

export const productsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["products", getPage(request)],
    queryFn: () => LoaderProduct.getAllProducst(getPage(request)),
  });

export const productCreateLoader = async () => {
  const [brands, suppliers, categories] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["brands-select"],
      queryFn: () => LoaderBrand.getBrandsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["suppliers-select"],
      queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["categories-select"],
      queryFn: () => LoaderCategory.getCategoriesDropdown(),
    }),
  ]);
  return { brands, suppliers, categories };
};

export const productEditLoader = async ({ params }) => {
  const [brands, suppliers, categories, product] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["brands-select"],
      queryFn: () => LoaderBrand.getBrandsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["suppliers-select"],
      queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["categories-select"],
      queryFn: () => LoaderCategory.getCategoriesDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["product", params.productId],
      queryFn: () => LoaderProduct.getProductById(params.productId),
    }),
  ]);
  return { brands, suppliers, categories, product };
};

export const ordersLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["orders", getPage(request)],
    queryFn: () => LoaderOrder.getAllOrders(getPage(request)),
  });

export const orderCreateLoader = async () => ({
  productVariants: await queryClient.fetchQuery({
    queryKey: ["variants-select"],
    queryFn: () => LoaderProductVariant.getProductVariantsDropdown(),
  }),
});

export const orderEditLoader = async ({ params }) => {
  const [productVariants, order] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["variants-select"],
      queryFn: () => LoaderProductVariant.getProductVariantsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["order", params.orderId],
      queryFn: () => LoaderOrder.getOrderById(params.orderId),
      staleTime: 0,
    }),
  ]);
  return { productVariants, order };
};

export const brandsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["brands", getPage(request)],
    queryFn: () => LoaderBrand.getAllBrands(getPage(request)),
  });

export const brandEditLoader = (args) => LoaderBrand.getBrandById(args);

export const couponsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["coupons", getPage(request)],
    queryFn: () => LoaderCoupon.getAllCoupons(getPage(request)),
  });

export const couponEditLoader = ({ params }) =>
  queryClient.fetchQuery({
    queryKey: ["coupon", params.couponId],
    queryFn: () => LoaderCoupon.getCouponById(params.couponId),
    staleTime: 0,
  });

export const purchaseLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["purchase-order", getPage(request)],
    queryFn: () => LoaderPurchase.getAllPurchases(getPage(request)),
  });

export const purchaseCreateLoader = async () => {
  const [suppliers, productVariants] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["suppliers-select"],
      queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["variants-select"],
      queryFn: () => LoaderProductVariant.getProductVariantsDropdown(),
    }),
  ]);
  return { suppliers, productVariants };
};

export const purchaseEditLoader = async ({ params }) => {
  const [suppliers, productVariants, purchase] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["suppliers-select"],
      queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["variants-select"],
      queryFn: () => LoaderProductVariant.getProductVariantsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["purchase-order", [params.purchaseId]],
      queryFn: () => LoaderPurchase.getPurchaseById(params.purchaseId),
    }),
  ]);
  return { suppliers, productVariants, purchase };
};

export const permissionsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["permissions", getPage(request)],
    queryFn: () => LoaderPermissions.getGroups(getPage(request)),
  });

export const permissionEditLoader = (args) => LoaderPermissions.getBySlug(args);

export const stocksLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["stocks", getPage(request)],
    queryFn: () => LoaderStock.getAllStocks(getPage(request)),
  });

export const stockCreateLoader = async () => {
  const [orders, variants, purchases] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["orders-select"],
      queryFn: () => LoaderOrder.getOrderDropdowns(),
    }),
    queryClient.fetchQuery({
      queryKey: ["variants-select"],
      queryFn: () => LoaderProductVariant.getProductVariantsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["purchase-orders-select"],
      queryFn: () => LoaderPurchase.getPurchasesDropdown(),
    }),
  ]);
  return { orders, variants, purchases };
};

export const suppliersLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["suppliers", getPage(request)],
    queryFn: () => LoaderSupplier.getAllSupplier(getPage(request)),
  });

export const supplierEditLoader = (args) =>
  LoaderSupplier.getSupplierById(args);

export const categoriesLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["categories", getPage(request)],
    queryFn: () => LoaderCategory.getAllCategories(getPage(request)),
  });

export const categoryEditLoader = (args) =>
  LoaderCategory.getCategoryById(args);

export const productVariantsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["product-variants", getPage(request)],
    queryFn: () =>
      LoaderProductVariant.getAllProducstVariants(getPage(request)),
  });

export const variantCreateLoader = async () => {
  const [attributeKeys, products] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["attribute-key-all"],
      queryFn: () => LoaderAttr.getAllAttributesDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["products-dropdown"],
      queryFn: () => LoaderProduct.getProductsDropdown(),
    }),
  ]);
  return { attributeKeys, products };
};

export const variantEditLoader = async ({ params }) => {
  const [attributeKeys, products, product_variant] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ["attribute-key-all"],
      queryFn: () => LoaderAttr.getAllAttributesDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["products-dropdown"],
      queryFn: () => LoaderProduct.getProductsDropdown(),
    }),
    queryClient.fetchQuery({
      queryKey: ["product-variant", [params.variantId]],
      queryFn: () =>
        LoaderProductVariant.getProductVariantById(params.variantId),
    }),
  ]);
  return { attributeKeys, products, product_variant };
};

export const attributeKeyLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["attribute-keys", getPage(request)],
    queryFn: () => LoaderAttr.getAllAttrs(getPage(request)),
  });

export const attributeKeyEditLoader = ({ params }) =>
  queryClient.fetchQuery({
    queryKey: ["attribute-keys", params.attrId],
    queryFn: () => LoaderAttr.getAttrById(params.attrId),
  });
