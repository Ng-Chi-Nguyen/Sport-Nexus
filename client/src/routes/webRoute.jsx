import { lazy } from "react";
const HomePage = lazy(() => import("@/pages/Home/"));
export const webRoutes = {
  children: [
    {
      path: "",
      element: <HomePage />,
    },
  ],
};
