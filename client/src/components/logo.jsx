import { Link } from "react-router-dom";
import logoLight from "@/assets/images/logo-sportnexus-light.svg";
import logoDark from "@/assets/images/logo-sportnexus-dark.svg";

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 no-underline cursor-pointer select-none"
    >
      <img
        src={logoDark}
        alt="SportNexus"
        className="h-12 md:h-14 w-auto object-contain shrink-0"
      />
    </Link>
  );
};

const LogoAdminConsole = () => {
  return (
    <Link
      to="/"
      className="no-underline cursor-pointer select-none group block"
    >
      <div className="px-2 py-4">
        <img
          src={logoLight}
          alt="SportNexus"
          className="h-8 w-auto object-contain"
        />
      </div>
    </Link>
  );
};

const SportNexusLogoIcon = ({ className = "" }) => (
  <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
    <path
      className="fill-sky-400"
      d="M 25 70 C 5 45 15 15 50 8 C 85 0 105 25 100 50 C 98 60 90 68 80 73 C 78 70 75 67 72 65 C 82 60 88 52 90 44 C 94 22 75 8 50 14 C 25 20 16 42 28 62 C 32 68 38 73 45 76 L 38 84 C 32 80 28 75 25 70 Z"
    />
    <path
      className="fill-sky-400"
      d="M 55 5 L 67 35 L 98 20 L 78 48 L 108 62 L 72 68 L 82 98 L 56 72 L 38 102 L 42 68 L 10 70 L 42 52 L 18 28 L 48 42 Z"
    />
    <path
      className="fill-white"
      d="M 55 22 L 63 42 L 82 32 L 68 50 L 88 60 L 65 64 L 72 84 L 56 67 L 44 88 L 47 64 L 26 65 L 47 52 L 30 36 L 50 45 Z"
    />
  </svg>
);

export { Logo, LogoAdminConsole, SportNexusLogoIcon };
