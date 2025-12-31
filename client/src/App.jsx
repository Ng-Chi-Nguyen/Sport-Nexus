import { Outlet, useLocation } from "react-router-dom";

import Header from "@/components/header";
import "./App.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";

function App() {
  const location = useLocation();

  // Kiểm tra nếu đường dẫn bắt đầu bằng "/management" hoặc "/dashboard"
  // Bạn có thể thêm các đường dẫn khác vào mảng này
  const managementPaths = ["/management", "/dashboard", "/admin"];
  const isManagementView = managementPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header className="h-[65px] shrink-0" />

      <main className="flex-1 overflow-hidden">
        <Toaster position="top-right" richColors />
        {!isManagementView ? (
          <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      {/* CHỈ HIỆN FOOTER NẾU KHÔNG PHẢI TRANG DASHBOARD */}
      {!isManagementView && (
        <Footer className="w-full border-t-2 border-[#323232] bg-white" />
      )}
    </div>
  );
}

export default App;
