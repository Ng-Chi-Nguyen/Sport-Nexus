import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

const CouponContext = createContext(null);

const STORAGE_KEY = "sportnexus_saved_coupons";

const loadCodes = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((code) => typeof code === "string") : [];
    } catch {
        return [];
    }
};

const saveCodes = (codes) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
        // storage unavailable
    }
};

export const CouponProvider = ({ children }) => {
    const [savedCodes, setSavedCodes] = useState(loadCodes);

    useEffect(() => {
        saveCodes(savedCodes);
    }, [savedCodes]);

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== STORAGE_KEY) return;
            setSavedCodes(loadCodes());
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const isSaved = useCallback((code) => savedCodes.includes(code), [savedCodes]);

    const toggleSave = useCallback((coupon) => {
        if (!coupon?.code) return;
        setSavedCodes((prev) => {
            if (prev.includes(coupon.code)) {
                toast("Đã bỏ lưu mã giảm giá");
                return prev.filter((c) => c !== coupon.code);
            }
            toast.success("Đã lưu mã giảm giá");
            return [...prev, coupon.code];
        });
    }, []);

    const value = useMemo(
        () => ({ savedCodes, count: savedCodes.length, isSaved, toggleSave }),
        [savedCodes, isSaved, toggleSave],
    );

    return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
};

export const useCoupons = () => {
    const ctx = useContext(CouponContext);
    if (!ctx) throw new Error("useCoupons must be used within CouponProvider");
    return ctx;
};
