// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/index.jsx";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
      </CartProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
