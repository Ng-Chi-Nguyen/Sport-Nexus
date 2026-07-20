import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./logo";

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-slate-900 pt-16 pb-6 px-4 md:px-16 lg:px-24 font-sans select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-200">
        {/* Cột 1: Giới thiệu */}
        <div className="space-y-5">
          <div className="inline-block transform hover:-rotate-1 transition-transform">
            <Logo />
          </div>
          <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-xs">
            Hệ thống quản lý và phân phối sản phẩm thể thao hiện đại, tối ưu quy
            trình vận hành trong dự án khóa luận tốt nghiệp.
          </p>
          {/* Hàng nút mạng xã hội phong cách Neo-brutalism */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="btn-neo p-2 bg-[#1877F2] border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all rounded"
            >
              <Facebook size={18} className="text-white" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="btn-neo p-2 bg-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all rounded"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="btn-neo p-2 bg-[#FF0000] border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all rounded"
            >
              <Youtube size={18} className="text-white" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="btn-neo p-2 bg-[#E1306C] border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all rounded"
            >
              <Instagram size={18} className="text-white" />
            </a>
            <a
              href="mailto:ngchinguyen2606@gmail.com"
              className="btn-neo p-2 bg-amber-500 border-2 border-slate-900 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] transition-all rounded"
            >
              <Mail size={18} className="text-white" />
            </a>
          </div>
        </div>

        {/* Cột 2: Điều hướng nhanh */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-5 border-l-4 border-blue-500 pl-2">
            Liên kết nhanh
          </h3>
          <ul className="space-y-3 text-[13px] font-bold text-slate-600 uppercase tracking-tight">
            <li>
              <Link
                to="/"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                Trang chủ{" "}
                <ArrowUpRight
                  size={12}
                  className="opacity-0 hover:opacity-100"
                />
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                Đơn hàng
              </Link>
            </li>
            <li>
              <Link
                to="/auth/login"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                Quản trị
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-5 border-l-4 border-blue-500 pl-2">
            Hỗ trợ khách hàng
          </h3>
          <ul className="space-y-3 text-[13px] font-bold text-slate-600 uppercase tracking-tight">
            <li>
              <a
                href="#privacy"
                className="hover:text-blue-600 transition-colors block"
              >
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a
                href="#terms"
                className="hover:text-blue-600 transition-colors block"
              >
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a
                href="#refund"
                className="hover:text-blue-600 transition-colors block"
              >
                Chính sách hoàn tiền
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Thông tin liên hệ */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-5 border-l-4 border-blue-500 pl-2">
            Thông tin liên hệ
          </h3>
          <ul className="space-y-3 text-[13px] font-semibold text-slate-600">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-tight">
                Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-blue-600 shrink-0" />
              <a
                href="tel:0812312831"
                className="hover:text-blue-600 transition-colors"
              >
                +84 812 312 831
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-blue-600 shrink-0" />
              <a
                href="mailto:ngchinguyen2606@gmail.com"
                className="hover:text-blue-600 transition-colors truncate"
              >
                ngchinguyen2606@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Dòng bản quyền phía dưới cùng */}
      <div className="pt-6 text-center">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          Mã số SV:{" "}
          <span className="text-blue-600 font-extrabold">227060172</span> — BẢN
          QUYỀN THUỘC VỀ{" "}
          <span className="text-slate-700 font-extrabold">
            NGUYỄN CHÍ NGUYỆN
          </span>
        </p>
      </div>
    </footer>
  );
};

const FooterAuth = () => {
  return (
    <footer className="w-full py-6 bg-transparent text-center border-t border-slate-100">
      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
        © 227060172 | SPORT NEXUS — TIỂU LUẬN TỐT NGHIỆP CNTT —
        <span className="text-blue-600 font-extrabold"> NGUYỄN CHÍ NGUYỆN</span>
      </p>
    </footer>
  );
};

export { Footer, FooterAuth };
