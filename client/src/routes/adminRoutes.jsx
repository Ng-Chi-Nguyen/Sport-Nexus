import { lazy } from "react";
import * as RouteLoaders from "./adminLoader.jsx";

// ─── 1. KHAI BÁO LAZY LOAD TƯỜNG MINH (ĐỒNG BỘ 100% CẤU TRÚC THƯ MỤC THỰC TẾ) ───
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard/dashboard.jsx"));

// Hệ thống User (Thư mục)
const UserPage = lazy(() => import("@/pages/Admin/users/index.jsx"));
const CreateUserPage = lazy(() => import("@/pages/Admin/users/create.jsx"));
const EditUserPage = lazy(() => import("@/pages/Admin/users/edit.jsx"));
const AddRolePermissionPage = lazy(
  () => import("@/pages/Admin/users/addRolePermission.jsx"),
);

// Catalog & Sản phẩm (Thư mục)
const ProductPage = lazy(() => import("@/pages/Admin/products/index.jsx"));
const CreateProductPage = lazy(
  () => import("@/pages/Admin/products/create.jsx"),
);
const EditProductPage = lazy(() => import("@/pages/Admin/products/edit.jsx"));

// Thương hiệu (Thư mục)
const BrandPage = lazy(() => import("@/pages/Admin/brands/index.jsx"));
const CreateBrandPage = lazy(() => import("@/pages/Admin/brands/create.jsx"));
const EditBrandPage = lazy(() => import("@/pages/Admin/brands/edit.jsx"));

// 🌟 ĐÃ SỬA: Chuyển toàn bộ nhóm này từ file đơn sang trỏ đúng file index.jsx trong thư mục con
const CartPage = lazy(() => import("@/pages/Admin/carts/index.jsx"));
const Review = lazy(() => import("@/pages/Admin/reviews/index.jsx"));
const LogPage = lazy(() => import("@/pages/Admin/systemlogs/index.jsx"));
const AddressPage = lazy(() => import("@/pages/Admin/useraddresses/index.jsx"));

// Khuyến mãi (Thư mục)
const CouponPage = lazy(() => import("@/pages/Admin/coupons/index.jsx"));
const CreateCouponPage = lazy(() => import("@/pages/Admin/coupons/create.jsx"));
const EditCouponPage = lazy(() => import("@/pages/Admin/coupons/edit.jsx"));

// Đơn hàng (Thư mục)
const OrderPage = lazy(() => import("@/pages/Admin/orders/index.jsx"));
const EditOrderPage = lazy(() => import("@/pages/Admin/orders/edit.jsx"));
const CreateOrderPage = lazy(() => import("@/pages/Admin/orders/create.jsx"));

// Nhập hàng & Chuỗi cung ứng (Thư mục)
const PurchaseOrderItemPage = lazy(
  () => import("@/pages/Admin/purchaseorderitems/index.jsx"),
);
const PurchaseOrderPage = lazy(
  () => import("@/pages/Admin/purchaseorders/index.jsx"),
);
const EditPurchaseOrderPage = lazy(
  () => import("@/pages/Admin/purchaseorders/edit.jsx"),
);
const CreatePurchaseOrderPage = lazy(
  () => import("@/pages/Admin/purchaseorders/create.jsx"),
);

// Tồn kho (Thư mục)
const StockPage = lazy(() => import("@/pages/Admin/stockmovements/index.jsx"));
const EditStockPage = lazy(
  () => import("@/pages/Admin/stockmovements/edit.jsx"),
);
const CreateStockPage = lazy(
  () => import("@/pages/Admin/stockmovements/create.jsx"),
);

// Nhà cung cấp (Thư mục)
const SupplierPage = lazy(() => import("@/pages/Admin/suppliers/index.jsx"));
const CreateSupplierPage = lazy(
  () => import("@/pages/Admin/suppliers/create.jsx"),
);
const EditSupplierPage = lazy(() => import("@/pages/Admin/suppliers/edit.jsx"));

// Phân quyền (Thư mục)
const PermissionPage = lazy(
  () => import("@/pages/Admin/permissions/index.jsx"),
);
const CreatePermissionPage = lazy(
  () => import("@/pages/Admin/permissions/create.jsx"),
);
const EditPermissionPage = lazy(
  () => import("@/pages/Admin/permissions/edit.jsx"),
);

// Danh mục (Thư mục)
const Category = lazy(() => import("@/pages/Admin/categories/index.jsx"));
const CreateCategoryPage = lazy(
  () => import("@/pages/Admin/categories/create.jsx"),
);
const EditCategoryPage = lazy(
  () => import("@/pages/Admin/categories/edit.jsx"),
);

// Thuộc tính & Biến thể (Thư mục con/File lẻ)
const Variant = lazy(() => import("@/pages/Admin/productVariant/index.jsx"));
const EditVariant = lazy(() => import("@/pages/Admin/productVariant/edit.jsx"));
const CreateVariant = lazy(
  () => import("@/pages/Admin/productVariant/create.jsx"),
);
const AttributeKey = lazy(() => import("@/pages/Admin/attributeKey/index.jsx"));
const CreateAttributeKey = lazy(
  () => import("@/pages/Admin/attributeKey/create.jsx"),
);
const EditAttributeKey = lazy(
  () => import("@/pages/Admin/attributeKey/edit.jsx"),
);
const ProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/index.jsx"));
const CreateProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/create.jsx"));
const EditProductAttributeKey = lazy(() => import("@/pages/Admin/productAttributeKey/edit.jsx"));

// ─── 2. SƠ ĐỒ ĐỊNH TUYẾN CHÍNH ───
export const adminRoutes = {
  path: "management",
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "carts", element: <CartPage /> },
    { path: "logs", element: <LogPage />, loader: RouteLoaders.logsLoader },
    { path: "addresses", element: <AddressPage /> },
    { path: "reviews", element: <Review /> },

    // Hệ thống User & Phân quyền
    { path: "users", element: <UserPage />, loader: RouteLoaders.usersLoader },
    { path: "users/create", element: <CreateUserPage /> },
    {
      path: "users/edit/:userId",
      element: <EditUserPage />,
      loader: RouteLoaders.userEditLoader,
    },
    {
      path: "users/add-role/:userId",
      element: <AddRolePermissionPage />,
      loader: RouteLoaders.userAddRoleLoader,
    },
    {
      path: "permissions",
      element: <PermissionPage />,
      loader: RouteLoaders.permissionsLoader,
    },
    { path: "permissions/create", element: <CreatePermissionPage /> },
    {
      path: "permissions/edit/:slug",
      element: <EditPermissionPage />,
      loader: RouteLoaders.permissionEditLoader,
    },

    // Catalog & Sản phẩm
    {
      path: "products",
      element: <ProductPage />,
      loader: RouteLoaders.productsLoader,
    },
    {
      path: "products/create",
      element: <CreateProductPage />,
      loader: RouteLoaders.productCreateLoader,
    },
    {
      path: "products/edit/:productId",
      element: <EditProductPage />,
      loader: RouteLoaders.productEditLoader,
    },
    {
      path: "product-variants",
      element: <Variant />,
      loader: RouteLoaders.productVariantsLoader,
    },
    {
      path: "product-variants/create",
      element: <CreateVariant />,
      loader: RouteLoaders.variantCreateLoader,
    },
    {
      path: "product-variants/edit/:variantId",
      element: <EditVariant />,
      loader: RouteLoaders.variantEditLoader,
    },
    {
      path: "attribute-key",
      element: <AttributeKey />,
      loader: RouteLoaders.attributeKeyLoader,
    },
    { path: "attribute-key/create", element: <CreateAttributeKey /> },
    {
      path: "attribute-key/edit/:attrId",
      element: <EditAttributeKey />,
      loader: RouteLoaders.attributeKeyEditLoader,
    },
    {
      path: "product-attribute-key",
      element: <ProductAttributeKey />,
    },
    { path: "product-attribute-key/create", element: <CreateProductAttributeKey /> },
    {
      path: "product-attribute-key/edit/:id",
      element: <EditProductAttributeKey />,
    },

    // Đơn hàng & Khuyến mãi
    {
      path: "orders",
      element: <OrderPage />,
      loader: RouteLoaders.ordersLoader,
    },
    {
      path: "orders/create",
      element: <CreateOrderPage />,
      loader: RouteLoaders.orderCreateLoader,
    },
    {
      path: "orders/edit/:orderId",
      element: <EditOrderPage />,
      loader: RouteLoaders.orderEditLoader,
    },
    {
      path: "coupons",
      element: <CouponPage />,
      loader: RouteLoaders.couponsLoader,
    },
    { path: "coupons/create", element: <CreateCouponPage /> },
    {
      path: "coupons/edit/:couponId",
      element: <EditCouponPage />,
      loader: RouteLoaders.couponEditLoader,
    },

    // Chuỗi cung ứng & Kho vận
    {
      path: "brands",
      element: <BrandPage />,
      loader: RouteLoaders.brandsLoader,
    },
    { path: "brands/create", element: <CreateBrandPage /> },
    {
      path: "brands/edit/:brandId",
      element: <EditBrandPage />,
      loader: RouteLoaders.brandEditLoader,
    },
    {
      path: "suppliers",
      element: <SupplierPage />,
      loader: RouteLoaders.suppliersLoader,
    },
    { path: "suppliers/create", element: <CreateSupplierPage /> },
    {
      path: "suppliers/edit/:supplierId",
      element: <EditSupplierPage />,
      loader: RouteLoaders.supplierEditLoader,
    },
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    {
      path: "purchase",
      element: <PurchaseOrderPage />,
      loader: RouteLoaders.purchaseLoader,
    },
    {
      path: "purchase/create",
      element: <CreatePurchaseOrderPage />,
      loader: RouteLoaders.purchaseCreateLoader,
    },
    {
      path: "purchase/edit/:purchaseId",
      element: <EditPurchaseOrderPage />,
      loader: RouteLoaders.purchaseEditLoader,
    },
    {
      path: "stocks",
      element: <StockPage />,
      loader: RouteLoaders.stocksLoader,
    },
    {
      path: "stocks/create",
      element: <CreateStockPage />,
      loader: RouteLoaders.stockCreateLoader,
    },
    { path: "stocks/edit/:stockId", element: <EditStockPage /> },
    {
      path: "categories",
      element: <Category />,
      loader: RouteLoaders.categoriesLoader,
    },
    { path: "categories/create", element: <CreateCategoryPage /> },
    {
      path: "categories/edit/:catrgoryId",
      element: <EditCategoryPage />,
      loader: RouteLoaders.categoryEditLoader,
    },
  ],
};
