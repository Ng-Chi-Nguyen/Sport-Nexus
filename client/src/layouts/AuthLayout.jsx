import { FooterAuth } from "@/components/footer";
import { Outlet } from "react-router-dom";
const AuthLayout = () => {
  return (
    /* Sử dụng flex-col để Footer nằm dưới Form */
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
        {/* Lớp nền */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4facf3]/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-200/30 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-blue-100/40 blur-[80px]"></div>

        {/* Khối trang trí nền (giữ nguyên) */}
        <div className="absolute w-[600px] h-[600px] bg-[#4facf3]/10 rotate-[30deg] -right-20 -top-20 rounded-[60px] blur-3xl z-0"></div>
        <div className="absolute w-[400px] h-[400px] bg-[#4facf3]/5 rotate-[-15deg] left-10 bottom-10 rounded-[40px] z-0"></div>

        <main className="flex-grow flex justify-center px-6 md:px-16 lg:px-24 relative z-10">
          <div className="w-full  max-w-[450px] animate-in fade-in slide-in-from-left-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="absolute bottom-[0] left-[35%]">
        <FooterAuth />
      </div>
    </>
  );
};

export default AuthLayout;
