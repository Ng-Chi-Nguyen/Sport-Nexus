import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 1. Tiếng Việt (vi)
import viHome from "@/locales/vi/home.json";
import viFooter from "@/locales/vi/footer.json";
import viheader from "@/locales/vi/header.json";
import vndashboard from "@/locales/vi/dashboard.json";
import viComponent from "@/locales/vi/component.json";
import viConstants from "@/locales/vi/constants.json";

// 2. Tiếng Anh (en)
import enHome from "@/locales/en/home.json";
import enFooter from "@/locales/en/footer.json";
import enheader from "@/locales/en/header.json";
import endashboard from "@/locales/en/dashboard.json";
import enComponent from "@/locales/en/component.json";
import enConstants from "@/locales/en/constants.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: { ...viHome, ...viFooter, ...viheader, ...vndashboard, component: viComponent, constants: viConstants } },
            en: { translation: { ...enHome, ...enFooter, ...enheader, ...endashboard, component: enComponent, constants: enConstants } },
        },
        fallbackLng: "vi",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
