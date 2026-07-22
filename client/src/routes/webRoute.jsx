import { lazy } from "react";
import {
  homeLoader,
  productDetailLoader,
  addressLoader,
  addressAction,
  editAddressLoader,
  profileLoader,
} from "./webLoader";

const HomePage = lazy(() => import("@/pages/Home/"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const CartPage = lazy(() => import("@/pages/Cart"));
const InfoPage = lazy(() => import("@/pages/info"));
const Index = lazy(() => import("@/pages/profile"));
const ResetPassword = lazy(() => import("@/pages/profile/resetPassword"));
const Profile = lazy(() => import("@/pages/profile/profile"));
const Order = lazy(() => import("@/pages/profile/order"));
const Address = lazy(() => import("@/pages/profile/address"));
const AddAddress = lazy(() => import("@/pages/profile/address/AddAddress"));
const EditAddress = lazy(() => import("@/pages/profile/address/EditAddress"));
const EditProfile = lazy(() => import("@/pages/profile/editProfile"));

export const webRoutes = {
  children: [
    {
      path: "",
      element: <HomePage />,
      loader: homeLoader,
    },
    {
      path: "san-pham/:slug",
      element: <ProductDetail />,
      loader: productDetailLoader,
    },
    {
      path: "gio-hang",
      element: <CartPage />,
    },
    {
      path: "thanh-toan",
      element: <CheckoutPage />,
    },
    {
      path: "he-thong-cua-hang",
      element: <InfoPage />,
    },
    {
      path: "chinh-sach-bao-hanh",
      element: <InfoPage />,
    },
    {
      path: "dieu-khoan-su-dung",
      element: <InfoPage />,
    },
    {
      path: "chinh-sach-bao-mat",
      element: <InfoPage />,
    },
    {
      path: "tuyen-dung",
      element: <InfoPage />,
    },
    {
      path: "/tai-khoan",
      element: <Index />,
      children: [
        { index: true, element: <Profile />, loader: profileLoader },
        { path: "dia-chi", element: <Address />, loader: addressLoader, action: addressAction },
        { path: "dia-chi/them", element: <AddAddress /> },
        { path: "dia-chi/sua/:id", element: <EditAddress />, loader: editAddressLoader },
        { path: "dat-lai-mat-khau", element: <ResetPassword /> },
        { path: "don-hang", element: <Order /> },
        { path: "chinh-sua-thong-tin-ca-nhan", element: <EditProfile /> },
      ],
    },
  ],
};