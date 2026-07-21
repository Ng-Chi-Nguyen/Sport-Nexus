import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { MoveLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] font-sans select-none">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative inline-block">
            <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-slate-200 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mt-16">
                Page not found
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">
              Trang bạn tìm không tồn tại
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Đường dẫn có thể đã bị di chuyển, thay đổi hoặc không còn khả
              dụng. Hãy kiểm tra lại hoặc quay về trang chủ.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <MoveLeft size={16} />
              Quay lại
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-all"
            >
              <Home size={16} />
              Trang chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
