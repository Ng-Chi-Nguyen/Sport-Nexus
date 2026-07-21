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

export { Logo, LogoAdminConsole };
