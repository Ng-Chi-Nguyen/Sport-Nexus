import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

const WishlistContext = createContext(null);

const STORAGE_KEY = "sportnexus_wishlist";

const loadIds = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
    } catch {
        return [];
    }
};

const saveIds = (ids) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // storage unavailable
    }
};

export const WishlistProvider = ({ children }) => {
    const [ids, setIds] = useState(loadIds);

    useEffect(() => {
        saveIds(ids);
    }, [ids]);

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== STORAGE_KEY) return;
            setIds(loadIds());
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const isLiked = useCallback((id) => ids.includes(id), [ids]);

    const toggleLike = useCallback(
        (id) => {
            if (!id) return;
            setIds((prev) => {
                if (prev.includes(id)) {
                    toast("Đã bỏ yêu thích");
                    return prev.filter((x) => x !== id);
                }
                toast.success("Đã thêm vào yêu thích");
                return [...prev, id];
            });
        },
        [],
    );

    const removeFromWishlist = useCallback((id) => {
        setIds((prev) => prev.filter((x) => x !== id));
    }, []);

    const value = useMemo(
        () => ({ ids, count: ids.length, isLiked, toggleLike, removeFromWishlist }),
        [ids, isLiked, toggleLike, removeFromWishlist],
    );

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
};
