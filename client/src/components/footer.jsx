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
import { useTranslation } from "react-i18next";
import { Logo } from "./logo";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-[#1e293b] border-t-4 border-slate-900 dark:border-slate-700 pt-16 pb-6 px-4 md:px-16 lg:px-24 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-200 dark:border-slate-700">
        {/* Cột 1: Giới thiệu */}
        <div className="space-y-5">
          <div className="inline-block transform hover:-rotate-1 transition-transform">
            <Logo />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xs">
            {t("description")}
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
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-5 border-l-4 border-blue-500 pl-2">
            {t("quick_links")}
          </h3>
          <ul className="space-y-3 text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
            <li>
              <Link
                to="/"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                {t("home")}{" "}
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
                {t("products")}
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                {t("orders")}
              </Link>
            </li>
            <li>
              <Link
                to="/auth/login"
                className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 transition-all"
              >
                {t("management")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-5 border-l-4 border-blue-500 pl-2">
            {t("customer_support")}
          </h3>
          <ul className="space-y-3 text-[13px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
            <li>
              <a
                href="#privacy"
                className="hover:text-blue-600 transition-colors block"
              >
                {t("privacy_policy")}
              </a>
            </li>
            <li>
              <a
                href="#terms"
                className="hover:text-blue-600 transition-colors block"
              >
                {t("terms_of_use")}
              </a>
            </li>
            <li>
              <a
                href="#refund"
                className="hover:text-blue-600 transition-colors block"
              >
                {t("refund_policy")}
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Thông tin liên hệ */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-5 border-l-4 border-blue-500 pl-2">
            {t("contact_info")}
          </h3>
          <ul className="space-y-3 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-tight">{t("address")}</span>
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
          {t("student_id")}:{" "}
          <span className="text-blue-600 font-extrabold">227060172</span> —{" "}
          {t("copyright")}{" "}
          <span className="text-slate-700 dark:text-slate-200 font-extrabold">
            NGUYỄN CHÍ NGUYỆN
          </span>
        </p>
      </div>
    </footer>
  );
};

const FooterAuth = () => {
  return (
    <footer className="w-full py-6 bg-transparent text-center border-t border-slate-100 dark:border-slate-800">
      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
        © 227060172 | SPORT NEXUS — TIỂU LUẬN TỐT NGHIỆP CNTT —
        <span className="text-blue-600 font-extrabold"> NGUYỄN CHÍ NGUYỆN</span>
      </p>
    </footer>
  );
};

export { Footer, FooterAuth };
