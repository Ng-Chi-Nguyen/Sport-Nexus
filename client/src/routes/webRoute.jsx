import { lazy } from "react";
import {
  homeLoader,
  productDetailLoader,
  addressLoader,
  addressAction,
  editAddressLoader,
  profileLoader,
  ordersLoader,
  orderDetailLoader,
  productsLoader,
} from "./webLoader";
import Support from "@/pages/settings/supports";

const HomePage = lazy(() => import("@/pages/Home/"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const CartPage = lazy(() => import("@/pages/Cart"));
const SearchPage = lazy(() => import("@/pages/Search"));
const ProductsPage = lazy(() => import("@/pages/Products"));
const InfoPage = lazy(() => import("@/pages/info"));
const Index = lazy(() => import("@/pages/profile"));
const ResetPassword = lazy(() => import("@/pages/profile/resetPassword"));
const Profile = lazy(() => import("@/pages/profile/profile"));
const Order = lazy(() => import("@/pages/profile/order"));
const OrderDetail = lazy(() => import("@/pages/profile/orderDetail"));
const Address = lazy(() => import("@/pages/profile/address"));
const AddAddress = lazy(() => import("@/pages/profile/address/AddAddress"));
const EditAddress = lazy(() => import("@/pages/profile/address/EditAddress"));
const EditProfile = lazy(() => import("@/pages/profile/editProfile"));
const FavoritesPage = lazy(() => import("@/pages/favorites"));
const CouponsPage = lazy(() => import("@/pages/coupons"));
const SearchHistoryPage = lazy(() => import("@/pages/searchHistory"));
const ProfilePlaceholder = lazy(() => import("@/pages/profile/placeholder"));

export const webRoutes = {
  children: [
    {
      path: "",
      element: <HomePage />,
      loader: homeLoader,
    },
    {
      path: "san-pham",
      element: <ProductsPage />,
      loader: productsLoader,
    },
    {
      path: "san-pham/:slug",
      element: <ProductDetail />,
      loader: productDetailLoader,
    },
    {
      path: "tim-kiem",
      element: <SearchPage />,
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
        {
          path: "dia-chi",
          element: <Address />,
          loader: addressLoader,
          action: addressAction,
        },
        { path: "dia-chi/them", element: <AddAddress /> },
        {
          path: "dia-chi/sua/:id",
          element: <EditAddress />,
          loader: editAddressLoader,
        },
        { path: "dat-lai-mat-khau", element: <ResetPassword /> },
        { path: "don-hang", element: <Order />, loader: ordersLoader },
        {
          path: "don-hang/:id",
          element: <OrderDetail />,
          loader: orderDetailLoader,
        },
        { path: "chinh-sua-thong-tin-ca-nhan", element: <EditProfile /> },
      ],
    },
    {
      path: "yeu-thich",
      element: <FavoritesPage />,
    },
    {
      path: "hoa-don",
      element: <ProfilePlaceholder />,
    },
    {
      path: "khuyen-mai",
      element: <CouponsPage />,
    },
    {
      path: "thong-bao",
      element: <ProfilePlaceholder />,
    },
    {
      path: "lich-su-tim-kiem",
      element: <SearchHistoryPage />,
    },
    {
      path: "bao-mat",
      element: <ProfilePlaceholder />,
    },
    {
      path: "ho-tro",
      element: <Support />,
    },
  ],
};
