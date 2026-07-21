import { lazy } from "react";
import { homeLoader } from "./webLoader";

const HomePage = lazy(() => import("@/pages/Home/"));
const InfoPage = lazy(() => import("@/pages/info"));
const Index = lazy(() => import("@/pages/profile"));
const ResetPassword = lazy(() => import("@/pages/profile/resetPassword"));
const Profile = lazy(() => import("@/pages/profile/profile"));
const Order = lazy(() => import("@/pages/profile/order"));
const Address = lazy(() => import("@/pages/profile/address"));
const EditProfile = lazy(() => import("@/pages/profile/editProfile"));

export const webRoutes = {
  children: [
    {
      path: "",
      element: <HomePage />,
      loader: homeLoader,
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
        { index: true, element: <Profile /> },
        { path: "dia-chi", element: <Address /> },
        { path: "dat-lai-mat-khau", element: <ResetPassword /> },
        { path: "don-hang", element: <Order /> },
        { path: "chinh-sua-thong-tin-ca-nhan", element: <EditProfile /> },
      ],
    },
  ],
};
