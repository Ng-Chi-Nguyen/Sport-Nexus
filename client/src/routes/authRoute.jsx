import { lazy } from "react";
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgotPassword"));
const ResetForgotPasswordPage = lazy(() => import("@/pages/auth/resetForgotPassword"));
const FacebookCallback = lazy(() => import("@/pages/auth/facebookCallback"));
import AuthLayout from "@/layouts/AuthLayout";
export const authRoutes = {
  children: [
    {
      path: "auth",
      element: <AuthLayout />,
      children: [
        { path: "register", element: <RegisterPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "quen-mat-khau", element: <ForgotPasswordPage /> },
        { path: "dat-lai-mat-khau/:token", element: <ResetForgotPasswordPage /> },
      ],
    },
    { path: "auth/facebook/callback", element: <FacebookCallback /> },
  ],
};
