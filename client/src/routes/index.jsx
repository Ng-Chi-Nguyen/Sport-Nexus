import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { adminRoutes } from "./adminRoutes"; // Import module vừa tạo
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { authRoutes } from "./authRoute";
import { webRoutes } from "./webRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
        element: <AdminLayout />,
        children: adminRoutes.children,
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
