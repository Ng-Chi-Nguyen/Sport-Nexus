import { lazy } from "react";
// Loader
import { LoaderPermissions } from "@/loaders/permissionLoader";
import LoaderUser from "@/loaders/userLoader";

// Lazy load các trang để giảm dung lượng file ban đầu
// User
const UserPage = lazy(() => import("@/pages/Admin/users"));
const CreateUserPage = lazy(() => import("@/pages/Admin/users/create"));
const EditUserPage = lazy(() => import("@/pages/Admin/users/edit"));
const AddRolePermissionPage = lazy(() =>
  import("@/pages/Admin/users/addRolePermission")
);

const Dashboard = lazy(() => import("@/pages/Admin/Dashboard/dashboard"));
const ProductPage = lazy(() => import("@/pages/Admin/products"));
const BrandPage = lazy(() => import("@/pages/Admin/brands"));
const CartPage = lazy(() => import("@/pages/Admin/Carts"));
const CouponPage = lazy(() => import("@/pages/Admin/coupons"));
const OrderPage = lazy(() => import("@/pages/Admin/orders"));
const PurchaseOrderItemPage = lazy(() =>
  import("@/pages/Admin/purchaseorderitems")
);
const PurchaseOrderPage = lazy(() => import("@/pages/Admin/purchaseorders"));
const StockPage = lazy(() => import("@/pages/Admin/stockmovements"));
const SupplierPage = lazy(() => import("@/pages/Admin/suppliers"));
const LogPage = lazy(() => import("@/pages/Admin/systemlogs"));
const AddressPage = lazy(() => import("@/pages/Admin/useraddresses"));
// Role
const PermissionPage = lazy(() => import("@/pages/Admin/permissions"));
const CreatePermissionPage = lazy(() =>
  import("@/pages/Admin/permissions/create")
);
const EditPermissionPage = lazy(() => import("@/pages/Admin/permissions/edit"));

const Category = lazy(() => import("@/pages/Admin/categories"));
const Review = lazy(() => import("@/pages/Admin/reviews"));
const Variant = lazy(() => import("@/pages/Admin/productVariant"));

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
        const page = url.searchParams.get("page") || 1; // Trích xuất ?page= từ URL
        return LoaderUser.getAllUsers(page);
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
    {
      path: "users/add-role/:userId",
      element: <AddRolePermissionPage />,
      // loader: LoaderUser.getUserById,
    },
    { path: "products", element: <ProductPage /> },
    { path: "orders", element: <OrderPage /> },
    { path: "brands", element: <BrandPage /> },
    { path: "carts", element: <CartPage /> },
    { path: "coupons", element: <CouponPage /> },
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    { path: "purchase", element: <PurchaseOrderPage /> },

    {
      path: "permissions",
      element: <PermissionPage />,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get("page") || 1; // Trích xuất ?page= từ URL
        return LoaderPermissions.getGroups(page);
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

    { path: "stocks", element: <StockPage /> },
    { path: "suppliers", element: <SupplierPage /> },
    { path: "logs", element: <LogPage /> },
    { path: "addresses", element: <AddressPage /> },
    { path: "categories", element: <Category /> },
    { path: "reviews", element: <Review /> },
    { path: "product-variants", element: <Variant /> },
  ],
};
