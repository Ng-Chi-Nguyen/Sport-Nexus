import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 no-underline cursor-pointer select-none"
    >
      <span className="text-2xl font-black tracking-tighter uppercase italic">
        <span className="text-slate-800">Sport</span>
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pr-4">
          Nexus
        </span>
      </span>
    </Link>
  );
};

// 2. LOGO TRANG QUẢN TRỊ (ADMIN SIDEBAR - ĐÃ TĂNG KÍCH THƯỚC SIÊU ĐẸP)
const LogoAdminConsole = () => {
  return (
    <Link
      to="/"
      className="no-underline cursor-pointer select-none group block"
    >
      {/* Tăng padding dọc từ py-3 lên py-4 để khối logo thoáng đãng hơn */}
      <div className="px-2 py-4">
        {/* ĐÃ CHỈNH SỬA: Nâng font chữ từ text-base (~16px) lên text-xl (~20px) cho vững chãi */}
        <h1 className="font-extrabold text-xl tracking-wider leading-tight flex items-center">
          {/* SPORT màu trắng sáng */}
          <span className="text-white transition-colors duration-150 group-hover:text-slate-200">
            SPORT
          </span>
          {/* NEXUS màu xanh lơ đặc trưng hệ thống */}
          <span className="text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.3)] ml-0.5">
            NEXUS
          </span>
        </h1>

        {/* ĐÃ CHỈNH SỬA: Tăng nhẹ size từ text-[10px] lên text-[11px], đẩy tracking-widest lên tracking-[0.2em] để kéo giãn chữ đều tăm tắp */}
        <span className="text-[11px] text-slate-500 font-bold tracking-[0.18em] uppercase block mt-1.5 pl-0.5">
          Admin Console
        </span>
      </div>
    </Link>
  );
};

export { Logo, LogoAdminConsole };
