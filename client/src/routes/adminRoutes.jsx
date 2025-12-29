import { lazy } from "react";

// Lazy load các trang để giảm dung lượng file ban đầu
// User
const UserPage = lazy(() => import("@/pages/Admin/users"));
const CreateUserPage = lazy(() => import("@/pages/Admin/users/create"));
import { LoaderPermissions } from "./loaders";

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
const RolePage = lazy(() => import("@/pages/Admin/roles"));
const CreateRolePage = lazy(() => import("@/pages/Admin/roles/create"));

const Category = lazy(() => import("@/pages/Admin/categories"));
const Review = lazy(() => import("@/pages/Admin/reviews"));
const Variant = lazy(() => import("@/pages/Admin/productVariant"));

export const adminRoutes = {
  path: "management", // Tiền tố chung
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "users", element: <UserPage /> },
    {
      path: "users/create",
      element: <CreateUserPage />,
      // loader: LoaderPermissions.getGroups,
    },
    { path: "products", element: <ProductPage /> },
    { path: "orders", element: <OrderPage /> },
    { path: "brands", element: <BrandPage /> },
    { path: "carts", element: <CartPage /> },
    { path: "coupons", element: <CouponPage /> },
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    { path: "purchase", element: <PurchaseOrderPage /> },

    { path: "roles", element: <RolePage /> },
    {
      path: "roles/create",
      element: <CreateRolePage />,
      loader: LoaderPermissions.getGroups,
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
