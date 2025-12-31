import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  FacebookIcon,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./logo";

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-[#323232] pt-8 pb-6 px-4 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Cột 1: Giới thiệu Sport Nexus */}
        <div className="space-y-4">
          <Logo />
          <p className="text-gray-500 font-medium text-sm leading-relaxed">
            Hệ thống quản lý thể thao hiện đại, tối ưu hóa quy trình vận hành và
            nâng cao trải nghiệm người dùng trong dự án khóa luận tốt nghiệp.
          </p>
          <div className="flex gap-4">
            <Link to="" className="btn-neo">
              <FacebookIcon size={20} className="text-white" />
            </Link>
            <Link to="" className="btn-neo">
              <svg
                width={20} // Tăng lên 24 để to rõ hơn
                height={20} // Phải bằng width để icon không bị dẹt
                viewBox="0 0 24 24"
                fill="none"
                stroke="white" // Đổi sang màu trắng để nổi bật trên nền xanh
                strokeWidth="2.5" // Tăng độ dày nét vẽ cho chuẩn phong cách Neo-brutalism
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </Link>
            <Link to="" className="btn-neo">
              <Youtube size={20} className="text-white" />
            </Link>
            <Link to="" className="btn-neo">
              <Instagram size={20} className="text-white" />
            </Link>
            <Link to="" className="btn-neo">
              <Mail size={20} className="text-white" />
            </Link>
          </div>
        </div>

        {/* Cột 2: Điều hướng nhanh */}
        <div>
          <h3 className="font-black uppercase text-[#323232] mb-6">
            Liên kết nhanh
          </h3>
          <ul className="space-y-3 text-sm font-bold text-gray-500 uppercase tracking-tighter">
            <li>
              <Link to="/" className="hover:text-[#4facf3] transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="hover:text-[#4facf3] transition-colors"
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="hover:text-[#4facf3] transition-colors"
              >
                Đơn hàng
              </Link>
            </li>
            <li>
              <Link
                to="/auth/login"
                className="hover:text-[#4facf3] transition-colors"
              >
                Quản trị
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div>
          <h3 className="font-black uppercase text-[#323232] mb-6">Hỗ trợ</h3>
          <ul className="space-y-3 text-sm font-bold text-gray-500 uppercase tracking-tighter">
            <li>
              <a href="#" className="hover:text-[#4facf3] transition-colors">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#4facf3] transition-colors">
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#4facf3] transition-colors">
                Chính sách hoàn tiền
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h3 className="font-black uppercase text-[#323232] mb-6">Liên hệ</h3>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-[#4facf3] shrink-0" />
              <span>Đường 3/2 , Phường Ninh Kiều, Cần Thơ</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-[#4facf3] shrink-0" />
              <span>+84 812 312 831</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-[#4facf3] shrink-0" />
              <span>ngchinguyen2606@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex w-full justify-center -mt-10">
        <p className="text-[8px] font-bold text-gray-400 uppercase">
          © 2026 SPORT NEXUS - TIỂU LUẬN TỐT NGHIỆP CNTT - Bảng quyền thuộc về{" "}
          <span className="text-blue-500">Nguyễn Chí Nguyện</span>
        </p>
      </div>
    </footer>
  );
};

const FooterAuth = () => {
  return (
    <>
      <div className="flex w-full justify-center -mt-10">
        <p className="text-[8px] font-bold text-gray-400 uppercase">
          © 2026 SPORT NEXUS - TIỂU LUẬN TỐT NGHIỆP CNTT - Bảng quyền thuộc về{" "}
          <span className="text-blue-500">Nguyễn Chí Nguyện</span>
        </p>
      </div>
    </>
  );
};

export { Footer, FooterAuth };
