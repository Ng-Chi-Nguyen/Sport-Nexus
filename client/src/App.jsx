import { useState, useEffect } from "react";
import { Outlet, useLocation, useLoaderData } from "react-router-dom";

import Header from "@/components/header";
import "./App.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";

import { NavCategoryMenu } from "./components/NavCategoryMenu";
import { HeroBanner } from "@/pages/Home/components/heroBanner";

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const location = useLocation();
  const loaderData = useLoaderData();
  const categories = loaderData?.data || [];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Kiểm tra nếu đường dẫn bắt đầu bằng "/management"
  // Bạn có thể thêm các đường dẫn khác vào mảng này
  const managementPaths = ["/management"];
  const isManagementView = managementPaths.some((path) =>
    location.pathname.startsWith(path),
  );
  return (
    <div className="h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      {!isManagementView && (
        <>
          <Header isScrolled={isScrolled} categories={categories} isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />
          <NavCategoryMenu isScrolled={isScrolled} categories={categories} isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />
        </>
      )}
      {!isManagementView && location.pathname === "/" && (
        <div className="">
          <HeroBanner />
        </div>
      )}

      <main className="flex-1">
        {!isManagementView ? (
          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {!isManagementView && (
        <Footer className="w-full border-t-2 border-[#323232] bg-white" />
      )}
    </div>
  );
}

export default App;
