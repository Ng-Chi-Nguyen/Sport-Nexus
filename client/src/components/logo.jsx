import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 no-underline cursor-pointer"
    >
      <span className="text-2xl font-black tracking-tighter uppercase italic">
        <span className="text-slate-800">Sport</span>
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Nexus
        </span>
      </span>
    </Link>
  );
};

export default Logo;
