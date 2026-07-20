import { FooterAuth } from "@/components/footer";
import { Outlet, useLocation } from "react-router-dom";

const AuthLayout = () => {
  const { pathname } = useLocation();
  const isLogin = pathname.includes("login");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Light decorative elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] bg-gradient-to-r from-blue-200/40 via-purple-200/30 to-transparent blur-[120px] -rotate-12" />
      <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[35%] bg-gradient-to-l from-orange-200/40 via-rose-200/30 to-transparent blur-[120px] rotate-12" />

      {/* Diagonal sport stripes - light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-300/30 to-transparent -rotate-[8deg] translate-x-[-20%]" />
        <div className="absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-300/20 to-transparent -rotate-[8deg] translate-x-[-10%]" />
        <div className="absolute top-[70%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-300/20 to-transparent rotate-[8deg] translate-x-[10%]" />
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-[3px] border-t-[3px] border-blue-200 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-24 h-24 border-r-[3px] border-t-[3px] border-orange-200 rounded-tr-2xl" />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 relative z-10 py-8">
        <div className="w-full max-w-[440px]">
          <div className="relative bg-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 rounded-2xl p-6 sm:p-8">
            {/* Sport Nexus branding */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black tracking-[0.15em] uppercase bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                Sport Nexus
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="h-[2px] w-8 bg-gradient-to-r from-blue-400 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold">
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                </span>
                <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-orange-400" />
              </div>
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
