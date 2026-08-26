import { FooterAuth } from "@/components/footer";
import { Outlet, useLocation } from "react-router-dom";
import logoSvg from "@/assets/images/logo-sportnexus-dark-icon.svg";
import { useTranslation } from "react-i18next";

const pageTitleMap = {
  login: "login_title",
  register: "register_title",
  "quen-mat-khau": "forgot_title",
  "dat-lai-mat-khau": "reset_title",
};

const AuthLayout = () => {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "auth" });
  const { pathname } = useLocation();
  const segment = pathname.includes("/dat-lai-mat-khau/")
    ? "dat-lai-mat-khau"
    : pathname.split("/").pop();
  const pageTitleKey = pageTitleMap[segment] || "";
  const pageTitle = pageTitleKey ? t(pageTitleKey) : "";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#090D16] transition-colors duration-200">
      {/* Large logo behind card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `url("${logoSvg}")`,
          backgroundPosition: "center 40%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "450px",
        }}
      />

      {/* Light decorative elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] bg-gradient-to-r from-sky-200/20 via-purple-200/10 to-transparent dark:from-sky-500/10 dark:via-purple-500/5 dark:to-transparent blur-[120px] -rotate-12" />
      <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[35%] bg-gradient-to-l from-orange-200/20 via-rose-200/10 to-transparent dark:from-orange-500/10 dark:via-rose-500/5 dark:to-transparent blur-[120px] rotate-12" />

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 relative z-10 py-8">
        <div className="w-full max-w-[440px]">
          <div className="relative bg-white/80 dark:bg-[#0D121F]/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-900 rounded-3xl p-6 sm:p-8">
            {/* Logo + page title */}
            <div className="text-center mb-6">
              <div className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-white/70 dark:bg-slate-900/70">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage("vi")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    i18n.language?.startsWith("vi")
                      ? "bg-sky-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {t("lang_vi")}
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage("en")}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    i18n.language?.startsWith("en")
                      ? "bg-sky-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {t("lang_en")}
                </button>
              </div>

              <img
                src={logoSvg}
                alt="Sport Nexus"
                className="h-12 mx-auto dark:brightness-200"
              />
              {pageTitle && (
                <h1 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-3">
                  {pageTitle}
                </h1>
              )}
            </div>

            <Outlet />
          </div>
        </div>
      </main>

      <FooterAuth />
    </div>
  );
};

export default AuthLayout;
