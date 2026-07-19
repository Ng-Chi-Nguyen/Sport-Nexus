// adminLoaders.js
import { queryClient } from "@/lib/react-query";
import LoaderPermissions from "@/loaders/management/permissionLoader";
import LoaderUser from "@/loaders/management/userLoader";
import LoaderBrand from "@/loaders/management/brandLoader";
import LoaderSupplier from "@/loaders/management/supplierLoader";
import LoaderCategory from "@/loaders/management/categoryLoader";
import LoaderProduct from "@/loaders/core/productLoader";
import LoaderAttr from "@/loaders/core/attributeKey";
import LoaderPurchase from "@/loaders/management/purchaseOrder";
import LoaderProductVariant from "@/loaders/core/productVariantLoader";
import LoaderCoupon from "@/loaders/management/couponLoadet";
import LoaderOrder from "@/loaders/customer/orderLoader";
import LoaderStock from "@/loaders/management/stockMovement";

// Hàm tiện ích bóc tách số trang từ URL
const getPage = (request) => new URL(request.url).searchParams.get("page") || 1;

export const usersLoader = async ({ request }) => {
  const usersPromise = queryClient.fetchQuery({
    queryKey: ["users", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "status"), getSearchParam(request, "is_verified"), getSearchParam(request, "role_id"), getSearchParam(request, "date_from"), getSearchParam(request, "date_to")],
    queryFn: () => LoaderUser.getAllUsers({
      page: getPage(request),
      search: getSearchParam(request, "search"),
      status: getSearchParam(request, "status"),
      is_verified: getSearchParam(request, "is_verified"),
      role_id: getSearchParam(request, "role_id"),
      date_from: getSearchParam(request, "date_from"),
      date_to: getSearchParam(request, "date_to"),
    }),
  });
  const rolesPromise = queryClient.fetchQuery({
    queryKey: ["user-roles"],
    queryFn: () => LoaderUser.getRolesDropdown(),
    staleTime: 60000,
  });
  const [users, roles] = await Promise.all([usersPromise, rolesPromise]);
  return { ...users, roles: roles?.data || [] };
};

export const userEditLoader = (args) => LoaderUser.getUserById(args);

export const userAddRoleLoader = async ({ params, request }) => {
  const [user, allPermissions] = await Promise.all([
    LoaderUser.getUserById({ params }),
    LoaderPermissions.getAllPermissions(getPage(request)),
  ]);
  return { user, allPermissions };
};

export const productsLoader = async ({ request }) => {
  const productPromise = queryClient.fetchQuery({
    queryKey: ["products", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "is_active"), getSearchParam(request, "category_id"), getSearchParam(request, "brand_id"), getSearchParam(request, "supplier_id"), getSearchParam(request, "price_min"), getSearchParam(request, "price_max")],
    queryFn: () => LoaderProduct.getAllProducts({ page: getPage(request), search: getSearchParam(request, "search"), is_active: getSearchParam(request, "is_active"), category_id: getSearchParam(request, "category_id"), brand_id: getSearchParam(request, "brand_id"), supplier_id: getSearchParam(request, "supplier_id"), price_min: getSearchParam(request, "price_min"), price_max: getSearchParam(request, "price_max") }),
  });
  const categoriesPromise = queryClient.fetchQuery({
    queryKey: ["category-dropdown"],
    queryFn: () => LoaderCategory.getCategoriesDropdown(),
    staleTime: 60000,
  });
  const brandsPromise = queryClient.fetchQuery({
    queryKey: ["brand-dropdown"],
    queryFn: () => LoaderBrand.getBrandsDropdown(),
    staleTime: 60000,
  });
  const suppliersPromise = queryClient.fetchQuery({
    queryKey: ["supplier-dropdown"],
    queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    staleTime: 60000,
  });
  const [products, categories, brands, suppliers] = await Promise.all([productPromise, categoriesPromise, brandsPromise, suppliersPromise]);
  return { ...products, categories: categories?.data || [], brands: brands?.data || [], suppliers: suppliers?.data || [] };
};

// export const productCreateLoader = async () => {
//   const [brands, suppliers, categories] = await Promise.all([
//     queryClient.fetchQuery({
//       queryKey: ["brands-select"],
//       queryFn: () => LoaderBrand.getBrandsDropdown(),
//     }),
//     queryClient.fetchQuery({
//       queryKey: ["suppliers-select"],
//       queryFn: () => LoaderSupplier.getSuppliersDropdown(),
//     }),
//     queryClient.fetchQuery({
//       queryKey: ["categories-select"],
//       queryFn: () => LoaderCategory.getCategoriesDropdown(),
//     }),
//   ]);
//   return { brands, suppliers, categories };
// };
export const productCreateLoader = async () => {
  const [brands, suppliers, categories] = await Promise.all([
    queryClient
      .fetchQuery({
        queryKey: ["brands-select"],
        queryFn: () => LoaderBrand.getBrandsDropdown(),
      })
      .catch((err) => {
        console.error(
          "❌ API Thương hiệu (Brands) bị lỗi 500:",
          err.response?.data || err.message,
        );
        return []; // Trả về mảng rỗng để không bị sập
      }),

    queryClient
      .fetchQuery({
        queryKey: ["suppliers-select"],
        queryFn: () => LoaderSupplier.getSuppliersDropdown(),
      })
      .catch((err) => {
        console.error(
          "❌ API Nhà cung cấp (Suppliers) bị lỗi 500:",
          err.response?.data || err.message,
        );
        return [];
      }),

    queryClient
      .fetchQuery({
        queryKey: ["categories-select"],
        queryFn: () => LoaderCategory.getCategoriesDropdown(),
      })
      .catch((err) => {
        console.error(
          "❌ API Danh mục (Categories) bị lỗi 500:",
          err.response?.data || err.message,
        );
        return [];
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

const getSearchParam = (request, key) => new URL(request.url).searchParams.get(key) || '';

export const ordersLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["orders", getPage(request), getSearchParam(request, "status"), getSearchParam(request, "payment_status"), getSearchParam(request, "payment_method"), getSearchParam(request, "date_from"), getSearchParam(request, "date_to"), getSearchParam(request, "amount_min"), getSearchParam(request, "amount_max"), getSearchParam(request, "search")],
    queryFn: () => LoaderOrder.getAllOrders({
      page: getPage(request),
      status: getSearchParam(request, "status"),
      payment_status: getSearchParam(request, "payment_status"),
      payment_method: getSearchParam(request, "payment_method"),
      date_from: getSearchParam(request, "date_from"),
      date_to: getSearchParam(request, "date_to"),
      amount_min: getSearchParam(request, "amount_min"),
      amount_max: getSearchParam(request, "amount_max"),
      search: getSearchParam(request, "search"),
    }),
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
    queryKey: ["brands", getPage(request), getSearchParam(request, "origin"), getSearchParam(request, "search")],
    queryFn: () => LoaderBrand.getAllBrands({ page: getPage(request), origin: getSearchParam(request, "origin"), search: getSearchParam(request, "search") }),
  });

export const brandEditLoader = (args) => LoaderBrand.getBrandById(args);

export const couponsLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["coupons", getPage(request), getSearchParam(request, "is_active"), getSearchParam(request, "search"), getSearchParam(request, "discount_type"), getSearchParam(request, "date_from"), getSearchParam(request, "date_to"), getSearchParam(request, "discount_min"), getSearchParam(request, "discount_max")],
    queryFn: () => LoaderCoupon.getAllCoupons({
      page: getPage(request),
      is_active: getSearchParam(request, "is_active"),
      search: getSearchParam(request, "search"),
      discount_type: getSearchParam(request, "discount_type"),
      date_from: getSearchParam(request, "date_from"),
      date_to: getSearchParam(request, "date_to"),
      discount_min: getSearchParam(request, "discount_min"),
      discount_max: getSearchParam(request, "discount_max"),
    }),
  });

export const couponEditLoader = ({ params }) =>
  queryClient.fetchQuery({
    queryKey: ["coupon", params.couponId],
    queryFn: () => LoaderCoupon.getCouponById(params.couponId),
    staleTime: 0,
  });

export const purchaseLoader = async ({ request }) => {
  const purchasePromise = queryClient.fetchQuery({
    queryKey: ["purchase-order", getPage(request), getSearchParam(request, "status"), getSearchParam(request, "supplier_id"), getSearchParam(request, "date_from"), getSearchParam(request, "date_to"), getSearchParam(request, "cost_min"), getSearchParam(request, "cost_max"), getSearchParam(request, "search")],
    queryFn: () => LoaderPurchase.getAllPurchases({
      page: getPage(request),
      status: getSearchParam(request, "status"),
      supplier_id: getSearchParam(request, "supplier_id"),
      date_from: getSearchParam(request, "date_from"),
      date_to: getSearchParam(request, "date_to"),
      cost_min: getSearchParam(request, "cost_min"),
      cost_max: getSearchParam(request, "cost_max"),
      search: getSearchParam(request, "search"),
    }),
  });
  const suppliersPromise = queryClient.fetchQuery({
    queryKey: ["purchase-suppliers"],
    queryFn: () => LoaderSupplier.getSuppliersDropdown(),
    staleTime: 60000,
  });
  const [purchaseOrders, suppliers] = await Promise.all([purchasePromise, suppliersPromise]);
  return { ...purchaseOrders, suppliers: suppliers?.data || [] };
};

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
  // Tự động kiểm tra xem router đang đặt tên biến là purchaseId hay id
  const purchaseId = params.purchaseId || params.id;

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
      // Truyền biến purchaseId đã kiểm tra vào đây
      queryKey: ["purchase-order", [purchaseId]],
      queryFn: () => LoaderPurchase.getPurchaseById(purchaseId),
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

export const stocksLoader = async ({ request }) => {
  const stocksPromise = queryClient.fetchQuery({
    queryKey: ["stocks", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "product_id"), getSearchParam(request, "stock_min"), getSearchParam(request, "stock_max"), getSearchParam(request, "price_min"), getSearchParam(request, "price_max")],
    queryFn: () => LoaderStock.getAllStocks({ page: getPage(request), search: getSearchParam(request, "search"), product_id: getSearchParam(request, "product_id"), stock_min: getSearchParam(request, "stock_min"), stock_max: getSearchParam(request, "stock_max"), price_min: getSearchParam(request, "price_min"), price_max: getSearchParam(request, "price_max") }),
  });
  const productsPromise = queryClient.fetchQuery({
    queryKey: ["stock-products"],
    queryFn: () => LoaderProduct.getProductsDropdown(),
    staleTime: 60000,
  });
  const [stocks, products] = await Promise.all([stocksPromise, productsPromise]);
  return { ...stocks, products: products?.data || [] };
};

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

export const suppliersLoader = async ({ request }) => {
  const supplierPromise = queryClient.fetchQuery({
    queryKey: ["suppliers", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "province")],
    queryFn: () => LoaderSupplier.getAllSupplier({ page: getPage(request), search: getSearchParam(request, "search"), province: getSearchParam(request, "province") }),
  });
  const provincesPromise = queryClient.fetchQuery({
    queryKey: ["supplier-provinces"],
    queryFn: () => LoaderSupplier.getDistinctProvinces(),
    staleTime: 60000,
  });
  const [suppliers, provinces] = await Promise.all([supplierPromise, provincesPromise]);
  return { ...suppliers, provinces: provinces?.data || [] };
};

export const supplierEditLoader = (args) =>
  LoaderSupplier.getSupplierById(args);

export const categoriesLoader = ({ request }) =>
  queryClient.fetchQuery({
    queryKey: ["categories", getPage(request), getSearchParam(request, "is_active"), getSearchParam(request, "search")],
    queryFn: () => LoaderCategory.getAllCategories({ page: getPage(request), is_active: getSearchParam(request, "is_active"), search: getSearchParam(request, "search") }),
  });

export const categoryEditLoader = (args) =>
  LoaderCategory.getCategoryById(args);

export const productVariantsLoader = async ({ request }) => {
  const variantsPromise = queryClient.fetchQuery({
    queryKey: ["product-variants", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "product_id"), getSearchParam(request, "stock_min"), getSearchParam(request, "stock_max"), getSearchParam(request, "price_min"), getSearchParam(request, "price_max")],
    queryFn: () => LoaderProductVariant.getAllProducstVariants({ page: getPage(request), search: getSearchParam(request, "search"), product_id: getSearchParam(request, "product_id"), stock_min: getSearchParam(request, "stock_min"), stock_max: getSearchParam(request, "stock_max"), price_min: getSearchParam(request, "price_min"), price_max: getSearchParam(request, "price_max") }),
  });
  const productsPromise = queryClient.fetchQuery({
    queryKey: ["product-variant-products"],
    queryFn: () => LoaderProduct.getProductsDropdown(),
    staleTime: 60000,
  });
  const [variants, products] = await Promise.all([variantsPromise, productsPromise]);
  return { ...variants, products: products?.data || [] };
};

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
    queryKey: ["attribute-keys", getPage(request), getSearchParam(request, "search"), getSearchParam(request, "unit")],
    queryFn: () => LoaderAttr.getAllAttrs({ page: getPage(request), search: getSearchParam(request, "search"), unit: getSearchParam(request, "unit") }),
  });

export const attributeKeyEditLoader = ({ params }) =>
  queryClient.fetchQuery({
    queryKey: ["attribute-keys", params.attrId],
    queryFn: () => LoaderAttr.getAttrById(params.attrId),
  });
