import { FooterAuth } from "@/components/footer";
import { Outlet, useLocation } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-dark-icon.svg";

const pageTitleMap = {
  login: "Đăng nhập",
  register: "Đăng ký",
  "quen-mat-khau": "Quên mật khẩu",
  "dat-lai-mat-khau": "Đặt lại mật khẩu",
};

const AuthLayout = () => {
  const { pathname } = useLocation();
  const segment = pathname.split("/").pop();
  const pageTitle = pageTitleMap[segment] || "";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Large logo behind card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `url("${logoSvg}")`,
          backgroundPosition: "center 40%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "450px",
        }}
      />

      {/* Light decorative elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] bg-gradient-to-r from-blue-200/40 via-purple-200/30 to-transparent blur-[120px] -rotate-12" />
      <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[35%] bg-gradient-to-l from-orange-200/40 via-rose-200/30 to-transparent blur-[120px] rotate-12" />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 relative z-10 py-8">
        <div className="w-full max-w-[440px]">
          <div className="relative bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 rounded-2xl p-6 sm:p-8">
            {/* Logo + page title */}
            <div className="text-center mb-6">
              <img
                src={logoSvg}
                alt="Sport Nexus"
                className="h-12 mx-auto"
              />
              {pageTitle && (
                <h1 className="text-sm font-semibold text-gray-600 tracking-widest uppercase mt-3">
                  {pageTitle}
                </h1>
              )}
            </div>

            <Outlet />
          </div>
        </div>
      </main>

      <FooterAuth />
    </div>
  );
};

export default AuthLayout;
