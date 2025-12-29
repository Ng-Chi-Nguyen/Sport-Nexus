// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./routes/index.jsx";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
);
