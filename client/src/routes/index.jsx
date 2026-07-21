import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { adminRoutes } from "./adminRoutes";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { authRoutes } from "./authRoute";
import { webRoutes } from "./webRoute";
import LoaderCategory from "@/loaders/management/categoryLoader";

import AdminGuard from "@/components/AdminGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: () => LoaderCategory.getCategoriesDropdown().catch(() => ({ success: true, data: [] })),
    HydrateFallback: LoadingSpinner,
    children: [
      {
        path: webRoutes.path,
        children: webRoutes.children,
      },
      {
        path: authRoutes.path,
        children: authRoutes.children,
      },
      {
        path: adminRoutes.path,
        element: <AdminGuard />,
        children: [
          {
            path: "",
            element: <AdminLayout />,
            children: adminRoutes.children,
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
