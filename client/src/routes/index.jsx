// src/routes/index.jsx
import HomePage from "../pages/Home";
import { createBrowserRouter } from "react-router-dom";
import homeService from "../services/homeService";
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
    element: <HomePage />,
    loader: homeLoader,
  },
]);

export default router;