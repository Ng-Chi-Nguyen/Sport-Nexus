// src/routes/index.jsx

import { createBrowserRouter } from "react-router-dom";
import homeService from "../services/homeService";
import App from "@/App";
import HomePage from "@/pages/Home";
// import HomePage from "@/pages/Home";
// import homeService from "@/services/homeService";

// Bạn có thể định nghĩa loader riêng ở đây cho sạch code
const homeLoader = async () => {
  try {
    const response = await homeService.getHomeData();
    return response.data;
  } catch (error) {
    console.error("Lỗi loader trang chủ:", error);
    return null;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
        // loader: async () => {
        //   const res = await homeService.getHomeData();
        //   return res.data;
        // },
      },
    ],
    // loader: homeLoader,
  },
]);

export default router;
