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

// 3. Tiếng Trung (zh)
import zhHome from "@/locales/zh/home.json";
import zhFooter from "@/locales/zh/footer.json";
import zhheader from "@/locales/zh/header.json";

// 4. Tiếng Nhật (ja)
import jaHome from "@/locales/ja/home.json";
import jaFooter from "@/locales/ja/footer.json";
import jaheader from "@/locales/ja/header.json";

// 5. Tiếng Thái (th)
import thHome from "@/locales/th/home.json";
import thFooter from "@/locales/th/footer.json";
import thheader from "@/locales/th/header.json";

// 6. Tiếng Pháp (fr)
import frHome from "@/locales/fr/home.json";
import frFooter from "@/locales/fr/footer.json";
import frheader from "@/locales/fr/header.json";

// 7. Tiếng Tây Ban Nha (es)
import esHome from "@/locales/es/home.json";
import esFooter from "@/locales/es/footer.json";
import esheader from "@/locales/es/header.json";

// 8. Tiếng Hàn (ko)
import koHome from "@/locales/ko/home.json";
import koFooter from "@/locales/ko/footer.json";
import koheader from "@/locales/ko/header.json";

// 9. Tiếng Đức (de)
import deHome from "@/locales/de/home.json";
import deFooter from "@/locales/de/footer.json";
import deheader from "@/locales/de/header.json";

// 10. Tiếng Ý (it)
import itHome from "@/locales/it/home.json";
import itFooter from "@/locales/it/footer.json";
import itheader from "@/locales/it/header.json";

// 11. Tiếng Bồ Đào Nha (pt)
import ptHome from "@/locales/pt/home.json";
import ptFooter from "@/locales/pt/footer.json";
import ptheader from "@/locales/pt/header.json";

// 12. Tiếng Nga (ru)
import ruHome from "@/locales/ru/home.json";
import ruFooter from "@/locales/ru/footer.json";
import ruheader from "@/locales/ru/header.json";

// 13. Tiếng Ả Rập (ar)
import arHome from "@/locales/ar/home.json";
import arFooter from "@/locales/ar/footer.json";
import arheader from "@/locales/ar/header.json";

// 14. Tiếng Hindi (hi)
import hiHome from "@/locales/hi/home.json";
import hiFooter from "@/locales/hi/footer.json";
import hiheader from "@/locales/hi/header.json";

// 15. Tiếng Indonesia (id)
import idHome from "@/locales/id/home.json";
import idFooter from "@/locales/id/footer.json";
import idheader from "@/locales/id/header.json";

// 16. Tiếng Malaysia (ms)
import msHome from "@/locales/ms/home.json";
import msFooter from "@/locales/ms/footer.json";
import msheader from "@/locales/ms/header.json";

// 17. Tiếng Hà Lan (nl)
import nlHome from "@/locales/nl/home.json";
import nlFooter from "@/locales/nl/footer.json";
import nlheader from "@/locales/nl/header.json";

// 18. Tiếng Ba Lan (pl)
import plHome from "@/locales/pl/home.json";
import plFooter from "@/locales/pl/footer.json";
import plheader from "@/locales/pl/header.json";

// 19. Tiếng Thổ Nhĩ Kỳ (tr)
import trHome from "@/locales/tr/home.json";
import trFooter from "@/locales/tr/footer.json";
import trheader from "@/locales/tr/header.json";

// 20. Tiếng Thụy Điển (sv)
import svHome from "@/locales/sv/home.json";
import svFooter from "@/locales/sv/footer.json";
import svheader from "@/locales/sv/header.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: { ...viHome, ...viFooter, ...viheader, ...vndashboard, component: viComponent, constants: viConstants } },
            en: { translation: { ...enHome, ...enFooter, ...enheader, ...endashboard, component: enComponent, constants: enConstants } },
            zh: { translation: { ...zhHome, ...zhFooter, ...zhheader } },
            ja: { translation: { ...jaHome, ...jaFooter, ...jaheader } },
            th: { translation: { ...thHome, ...thFooter, ...thheader } },
            fr: { translation: { ...frHome, ...frFooter, ...frheader } },
            es: { translation: { ...esHome, ...esFooter, ...esheader } },
            ko: { translation: { ...koHome, ...koFooter, ...koheader } },
            de: { translation: { ...deHome, ...deFooter, ...deheader } },
            it: { translation: { ...itHome, ...itFooter, ...itheader } },
            pt: { translation: { ...ptHome, ...ptFooter, ...ptheader } },
            ru: { translation: { ...ruHome, ...ruFooter, ...ruheader } },
            ar: { translation: { ...arHome, ...arFooter, ...arheader } },
            hi: { translation: { ...hiHome, ...hiFooter, ...hiheader } },
            id: { translation: { ...idHome, ...idFooter, ...idheader } },
            ms: { translation: { ...msHome, ...msFooter, ...msheader } },
            nl: { translation: { ...nlHome, ...nlFooter, ...nlheader } },
            pl: { translation: { ...plHome, ...plFooter, ...plheader } },
            tr: { translation: { ...trHome, ...trFooter, ...trheader } },
            sv: { translation: { ...svHome, ...svFooter, ...svheader } },
        },
        fallbackLng: "vi",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
