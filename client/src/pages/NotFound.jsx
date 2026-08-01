import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { MoveLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="relative inline-block">
            <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-slate-200 dark:text-slate-800/60 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-16">
                Page not found
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Trang bạn tìm không tồn tại
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Đường dẫn có thể đã bị di chuyển, thay đổi hoặc không còn khả
              dụng. Hãy kiểm tra lại hoặc quay về trang chủ.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <MoveLeft size={16} />
              Quay lại
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 dark:bg-sky-500 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-all cursor-pointer shadow-sm"
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
