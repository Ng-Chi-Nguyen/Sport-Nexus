import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { MoveLeft, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    /* Sử dụng flex-col và min-h-screen để Header ở trên, Footer ở dưới và nội dung ở giữa */
    <div className="min-h-screen flex flex-col bg-gray-100 relative overflow-hidden">
      <Header />

      {/* Background Decor tương tự AuthLayout để tạo sự đồng bộ */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-[#4facf3]/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] bg-purple-200/20 rounded-full blur-2xl z-0"></div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {/* Khối số 404 nổi bật */}
          <div className="relative inline-block">
            <h1 className="text-[120px] font-black italic leading-none text-[#323232] tracking-tighter">
              404
            </h1>
            <div className="absolute -top-4 -right-4 p-3 bg-[#4facf3] border-4 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rotate-12">
              <TriangleAlert size={32} className="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase text-[#323232]">
              Không tìm thấy trang
            </h2>
            <p className="text-gray-500 font-medium">
              Có vẻ như đường dẫn bạn truy cập không tồn tại hoặc đã bị di
              chuyển trong hệ thống Sport Nexus.
            </p>
          </div>

          {/* Nút quay lại trang chủ */}
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#4facf3] border-4 border-[#323232] 
                         text-white font-black uppercase tracking-widest
                         shadow-[8px_8px_0px_0px_#323232] hover:translate-x-1 hover:translate-y-1 
                         hover:shadow-none active:scale-95 transition-all"
            >
              <MoveLeft size={20} />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
