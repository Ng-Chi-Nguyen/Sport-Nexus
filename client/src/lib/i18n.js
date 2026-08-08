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
import viSetting from "@/locales/vi/setting.json";
import viProfile from "@/locales/vi/profile.json";
import viProductDetail from "@/locales/vi/product-detail.json";
import viProduct from "@/locales/vi/product.json";
import viCheckOut from "@/locales/vi/checkout.json";
import viCart from "@/locales/vi/cart.json";
import viSearch from "@/locales/vi/search.json";
import viCollection from "@/locales/vi/collection.json";

// 2. Tiếng Anh (en)
import enHome from "@/locales/en/home.json";
import enFooter from "@/locales/en/footer.json";
import enheader from "@/locales/en/header.json";
import endashboard from "@/locales/en/dashboard.json";
import enComponent from "@/locales/en/component.json";
import enConstants from "@/locales/en/constants.json";
import enSetting from "@/locales/en/setting.json";
import enProfile from "@/locales/en/profile.json";
import enProductDetail from "@/locales/en/product-detail.json";
import enProduct from "@/locales/en/product.json";
import enCheckOut from "@/locales/en/checkout.json";
import enCart from "@/locales/en/cart.json";
import enSearch from "@/locales/en/search.json";
import enCollection from "@/locales/en/collection.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: {
                translation: {
                    ...viHome,
                    ...viFooter,
                    ...viheader,
                    ...vndashboard,
                    component: viComponent,
                    constants: viConstants,
                    // Trải phẳng hoặc giữ nguyên các nhánh bên trong setting.json
                    favorite: viSetting.favorite,
                    invoice: viSetting.invoice,
                    coupon: viSetting.coupon,
                    support: viSetting.support,
                    profile: viSetting.profile,
                    history: viSetting.history,
                    pagePlaceholder: viSetting.placeholder,
                    ...viProfile,
                    ...viProductDetail,
                    ...viProduct,
                    ...viCheckOut,
                    ...viCart,
                    ...viSearch,
                    ...viCollection,
                    order: { ...viProfile.order, ...vndashboard.order },
                },
            },
            en: {
                translation: {
                    ...enHome,
                    ...enFooter,
                    ...enheader,
                    ...endashboard,
                    component: enComponent,
                    constants: enConstants,
                    favorite: enSetting.favorite,
                    invoice: enSetting.invoice,
                    coupon: enSetting.coupon,
                    support: enSetting.support,
                    profile: enSetting.profile,
                    history: enSetting.history,
                    pagePlaceholder: enSetting.placeholder,
                    ...enProfile,
                    ...enProductDetail,
                    ...enProduct,
                    ...enCheckOut,
                    ...enCart,
                    ...enSearch,
                    ...enCollection,
                    order: { ...enProfile.order, ...endashboard.order },
                },
            },
        },
        fallbackLng: "vi",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;