import { lazy } from "react";
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
import AuthLayout from "@/layouts/AuthLayout";
export const authRoutes = {
  children: [
    {
      path: "auth",
      element: <AuthLayout />,
      children: [
        { path: "register", element: <RegisterPage /> },
        { path: "login", element: <LoginPage /> },
      ],
    },
  ],
};
