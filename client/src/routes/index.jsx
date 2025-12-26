import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/Home";
import AdminLayout from "@/layouts/AdminLayout";
import { adminRoutes } from "./adminRoutes"; // Import module vừa tạo
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },

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
