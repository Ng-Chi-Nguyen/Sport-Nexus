import { lazy } from "react";
// Loader
import LoaderPermissions from "@/loaders/permissionLoader";
import LoaderUser from "@/loaders/userLoader";
import LoaderBrand from "@/loaders/brandLoader";
import LoaderSupplier from "@/loaders/supplierLoader";
import LoaderCategory from "@/loaders/categoryLoader";
// lib
import { queryClient } from "@/lib/react-query";

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
// Brands
const BrandPage = lazy(() => import("@/pages/Admin/brands"));
const CreateBrandPage = lazy(() => import("@/pages/Admin/brands/create"));
const EditBrandPage = lazy(() => import("@/pages/Admin/brands/edit"));

const CartPage = lazy(() => import("@/pages/Admin/Carts"));
const CouponPage = lazy(() => import("@/pages/Admin/coupons"));
const OrderPage = lazy(() => import("@/pages/Admin/orders"));
const PurchaseOrderItemPage = lazy(() =>
  import("@/pages/Admin/purchaseorderitems")
);
const PurchaseOrderPage = lazy(() => import("@/pages/Admin/purchaseorders"));
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
const CreatePermissionPage = lazy(() =>
  import("@/pages/Admin/permissions/create")
);
const EditPermissionPage = lazy(() => import("@/pages/Admin/permissions/edit"));
// Category
const Category = lazy(() => import("@/pages/Admin/categories"));
const CreateCategoryPage = lazy(() =>
  import("@/pages/Admin/categories/create")
);
const EditCategoryPage = lazy(() => import("@/pages/Admin/categories/edit"));

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
    { path: "products", element: <ProductPage /> },
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
    { path: "coupons", element: <CouponPage /> },
    { path: "purchase-item", element: <PurchaseOrderItemPage /> },
    { path: "purchase", element: <PurchaseOrderPage /> },
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
          queryKey: ["permissions", page],
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
    { path: "categories/create", element: <Category /> },
    { path: "reviews", element: <Review /> },
    { path: "product-variants", element: <Variant /> },
  ],
};
