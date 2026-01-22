import { lazy } from "react";
// Loader
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
// lib
import { queryClient } from "@/lib/react-query";

// Lazy load các trang để giảm dung lượng file ban đầu
// User
const UserPage = lazy(() => import("@/pages/Admin/users"));
const CreateUserPage = lazy(() => import("@/pages/Admin/users/create"));
const EditUserPage = lazy(() => import("@/pages/Admin/users/edit"));
const AddRolePermissionPage = lazy(
  () => import("@/pages/Admin/users/addRolePermission"),
);

const Dashboard = lazy(() => import("@/pages/Admin/Dashboard/dashboard"));
// product
const ProductPage = lazy(() => import("@/pages/Admin/products"));
const CreateProductPage = lazy(() => import("@/pages/Admin/products/create"));
const EditProductPage = lazy(() => import("@/pages/Admin/products/edit"));
// Brands
const BrandPage = lazy(() => import("@/pages/Admin/brands"));
const CreateBrandPage = lazy(() => import("@/pages/Admin/brands/create"));
const EditBrandPage = lazy(() => import("@/pages/Admin/brands/edit"));

const CartPage = lazy(() => import("@/pages/Admin/Carts"));
const CouponPage = lazy(() => import("@/pages/Admin/coupons"));
const CreateCouponPage = lazy(() => import("@/pages/Admin/coupons/create"));
const EditCouponPage = lazy(() => import("@/pages/Admin/coupons/edit"));
const OrderPage = lazy(() => import("@/pages/Admin/orders"));
const PurchaseOrderItemPage = lazy(
  () => import("@/pages/Admin/purchaseorderitems"),
);
const PurchaseOrderPage = lazy(() => import("@/pages/Admin/purchaseorders"));
const EditPurchaseOrderPage = lazy(
  () => import("@/pages/Admin/purchaseorders/edit"),
);
const CreatePurchaseOrderPage = lazy(
  () => import("@/pages/Admin/purchaseorders/create"),
);
const StockPage = lazy(() => import("@/pages/Admin/stockmovements"));
// Supplier
const SupplierPage = lazy(() => import("@/pages/Admin/suppliers"));
const CreateSupplierPage = lazy(() => import("@/pages/Admin/suppliers/create"));
const EditSupplierPage = lazy(() => import("@/pages/Admin/suppliers/edit"));
// End Supplier
const LogPage = lazy(() => import("@/pages/Admin/systemlogs"));
const AddressPage = lazy(() => import("@/pages/Admin/useraddresses"));
// Role
const PermissionPage = lazy(() => import("@/pages/Admin/permissions"));
const CreatePermissionPage = lazy(
  () => import("@/pages/Admin/permissions/create"),
);
const EditPermissionPage = lazy(() => import("@/pages/Admin/permissions/edit"));
// Category
const Category = lazy(() => import("@/pages/Admin/categories"));
const CreateCategoryPage = lazy(
  () => import("@/pages/Admin/categories/create"),
);
const EditCategoryPage = lazy(() => import("@/pages/Admin/categories/edit"));

const Review = lazy(() => import("@/pages/Admin/reviews"));
const Variant = lazy(() => import("@/pages/Admin/productVariant"));
const EditVariant = lazy(() => import("@/pages/Admin/productVariant/edit"));
const CreateVariant = lazy(() => import("@/pages/Admin/productVariant/create"));

const AttributeKey = lazy(() => import("@/pages/Admin/attributeKey"));
const CreateAttributeKey = lazy(
  () => import("@/pages/Admin/attributeKey/create"),
);
const EditAttributeKey = lazy(() => import("@/pages/Admin/attributeKey/edit"));

export const adminRoutes = {
  path: "management", // Tiền tố chung
  children: [
    { path: "dashboard", element: <Dashboard /> },
    // User
    {
      path: "users",
      element: <UserPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["users", page],
          queryFn: () => LoaderUser.getAllUsers(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    {
      path: "users/create",
      element: <CreateUserPage />,
    },
    {
      path: "users/edit/:userId",
      element: <EditUserPage />,
      loader: LoaderUser.getUserById,
    },
    // End User
    {
      path: "users/add-role/:userId",
      element: <AddRolePermissionPage />,
      loader: async ({ params }) => {
        const [user, allPermissions] = await Promise.all([
          // 2. Phải GỌI hàm () và TRUYỀN { params } vào
          LoaderUser.getUserById({ params }),
          LoaderPermissions.getAllPermissions(),
        ]);

        // console.log("Dữ liệu user:", user);
        return { user, allPermissions };
      },
    },

    // products
    {
      path: "products",
      element: <ProductPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["products", page],
          queryFn: () => LoaderProduct.getAllProducst(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    {
      path: "products/create",
      element: <CreateProductPage />,
      loader: async () => {
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
      },
    },
    {
      path: "products/edit/:productId",
      element: <EditProductPage />,
      loader: async ({ params }) => {
        const { productId } = params;
        // console.log(productId);
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
            queryKey: ["product", productId],
            queryFn: () => LoaderProduct.getProductById(productId),
          }),
        ]);
        return { brands, suppliers, categories, product };
      },
    },
    // orders
    { path: "orders", element: <OrderPage /> },
    // Brands
    {
      path: "brands",
      element: <BrandPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["brands", page],
          queryFn: () => LoaderBrand.getAllBrands(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    { path: "brands/create", element: <CreateBrandPage /> },
    {
      path: "brands/edit/:brandId",
      element: <EditBrandPage />,
      loader: LoaderBrand.getBrandById,
    },
    // End Brands
    { path: "carts", element: <CartPage /> },
    // coupons
    {
      path: "coupons",
      element: <CouponPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          queryKey: ["coupons", page],
          queryFn: () => LoaderCoupon.getAllCoupons(page),
        });
      },
    },
    { path: "coupons/create", element: <CreateCouponPage /> },
    { path: "coupons/edit/:id", element: <EditCouponPage /> },
    // end coupons
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    // purchase
    {
      path: "purchase",
      element: <PurchaseOrderPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          queryKey: ["purchase-order", page],
          queryFn: () => LoaderPurchase.getAllPurchases(page),
        });
      },
    },
    {
      path: "purchase/edit/:purchaseId",
      element: <EditPurchaseOrderPage />,
      loader: async ({ params }) => {
        const { purchaseId } = params;

        // Sửa 'products' thành 'productVariants' ở đây
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
            queryKey: ["purchase-order", [purchaseId]],
            queryFn: () => LoaderPurchase.getPurchaseById(purchaseId),
          }),
        ]);

        // Bây giờ productVariants đã tồn tại để return
        return { suppliers, productVariants, purchase };
      },
    },
    {
      path: "purchase/create",
      element: <CreatePurchaseOrderPage />,
      loader: async () => {
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
      },
    },
    // permissions
    {
      path: "permissions",
      element: <PermissionPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["permissions", page],
          queryFn: () => LoaderPermissions.getGroups(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    {
      path: "permissions/create",
      element: <CreatePermissionPage />,
    },
    {
      path: `permissions/edit/:slug`,
      element: <EditPermissionPage />,
      loader: LoaderPermissions.getBySlug,
    },
    // End permissions
    { path: "stocks", element: <StockPage /> },
    // suppliers
    {
      path: "suppliers",
      element: <SupplierPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["suppliers", page],
          queryFn: () => LoaderSupplier.getAllSupplier(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    { path: "suppliers/create", element: <CreateSupplierPage /> },
    {
      path: "suppliers/edit/:supplierId",
      element: <EditSupplierPage />,
      loader: LoaderSupplier.getSupplierById,
    },
    // End suppliers
    { path: "logs", element: <LogPage /> },
    { path: "addresses", element: <AddressPage /> },
    // categories
    {
      path: "categories",
      element: <Category />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1; // Trích xuất ?page= từ URL
        // Sử dụng fetchQuery để quản lý bộ nhớ đệm
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["categories", page],
          queryFn: () => LoaderCategory.getAllCategories(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    { path: "categories/create", element: <CreateCategoryPage /> },
    {
      path: "categories/edit/:catrgoryId",
      element: <EditCategoryPage />,
      loader: LoaderCategory.getCategoryById,
    },
    // End categories

    { path: "reviews", element: <Review /> },
    // product-variants
    {
      path: "product-variants",
      element: <Variant />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["product-variants", page],
          queryFn: () => LoaderProductVariant.getAllProducstVariants(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    {
      path: "product-variants/edit/:variantId",
      element: <EditVariant />,
      loader: async ({ params }) => {
        const { variantId } = params;
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
            queryKey: ["product-variant", [variantId]],
            queryFn: () =>
              LoaderProductVariant.getProductVariantById(variantId),
          }),
        ]);
        return { attributeKeys, products, product_variant };
      },
    },
    {
      path: "product-variants/create",
      element: <CreateVariant />,
      loader: async () => {
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
      },
    },
    // end product-variants
    // attribute key
    {
      path: "attribute-key",
      element: <AttributeKey />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["attribute-keys", page],
          queryFn: () => LoaderAttr.getAllAttrs(page),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    { path: "attribute-key/create", element: <CreateAttributeKey /> },
    {
      path: "attribute-key/edit/:attrId",
      element: <EditAttributeKey />,
      loader: async ({ params }) => {
        const { attrId } = params;
        return await queryClient.fetchQuery({
          // queryKey phải chứa 'page' để phân biệt cache của trang 1, trang 2...
          queryKey: ["attribute-keys", attrId],
          queryFn: () => LoaderAttr.getAttrById(attrId),
          // Cấu trúc này đảm bảo nếu quay lại trang 1, nó sẽ lấy từ cache
        });
      },
    },
    // End attribute key
  ],
};
