import { lazy } from "react";

const HomePage = lazy(() => import("@/pages/Home/"));
const Index = lazy(() => import("@/pages/profile"));
const ResetPassword = lazy(() => import("@/pages/profile/resetPassword"));
const Profile = lazy(() => import("@/pages/profile/profile"));
const Order = lazy(() => import("@/pages/profile/order"));
const Address = lazy(() => import("@/pages/profile/address"));

export const webRoutes = {
  children: [
    {
      path: "",
      element: <HomePage />,
    },
    {
      path: "/profile",
      element: <Index />,
      children: [
        { index: true, element: <Profile /> },
        { path: "address", element: <Address /> },
        { path: "reset-password", element: <ResetPassword /> },
        { path: "order", element: <Order /> },
      ],
    },
  ],
};
