import { lazy } from "react";

// Lazy load các trang để giảm dung lượng file ban đầu
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard/dashboard"));
const UserPage = lazy(() => import("@/pages/Admin/users"));
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
const RolePage = lazy(() => import("@/pages/Admin/roles"));
const Category = lazy(() => import("@/pages/Admin/categories"));
const Review = lazy(() => import("@/pages/Admin/reviews"));
const Variant = lazy(() => import("@/pages/Admin/productVariant"));

export const adminRoutes = {
  path: "managament", // Tiền tố chung
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "users", element: <UserPage /> },
    { path: "products", element: <ProductPage /> },
    { path: "orders", element: <OrderPage /> },
    { path: "brands", element: <BrandPage /> },
    { path: "carts", element: <CartPage /> },
    { path: "coupons", element: <CouponPage /> },
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    { path: "purchase", element: <PurchaseOrderPage /> },
    { path: "roles", element: <RolePage /> },
    { path: "stocks", element: <StockPage /> },
    { path: "suppliers", element: <SupplierPage /> },
    { path: "logs", element: <LogPage /> },
    { path: "addresses", element: <AddressPage /> },
    { path: "categories", element: <Category /> },
    { path: "reviews", element: <Review /> },
    { path: "product-variants", element: <Variant /> },
  ],
};
