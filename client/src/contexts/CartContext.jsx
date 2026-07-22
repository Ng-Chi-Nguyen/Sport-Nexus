import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react";
import cartApi from "@/api/customer/cartApi";

const CartContext = createContext(null);

const STORAGE_KEY = "sportnexus_cart";

const loadLocalCart = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveLocalCart = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { }
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case "SET_ITEMS":
            return action.payload;
        case "ADD_ITEM": {
            const { product_variant_id, quantity } = action.payload;
            const existing = state.find((i) => i.product_variant_id === product_variant_id);
            if (existing) {
                return state.map((i) =>
                    i.product_variant_id === product_variant_id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...state, action.payload];
        }
        case "UPDATE_QTY":
            return state.map((i) =>
                i.product_variant_id === action.payload.product_variant_id
                    ? { ...i, quantity: action.payload.quantity }
                    : i
            );
        case "REMOVE_ITEM":
            return state.filter((i) => i.product_variant_id !== action.payload);
        case "CLEAR":
            return [];
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [items, dispatch] = useReducer(cartReducer, [], loadLocalCart);

    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user?.id) return;

        const localItems = loadLocalCart();

        if (localItems.length > 0) {
            cartApi.syncCart(localItems.map((i) => ({
                product_variant_id: i.product_variant_id,
                quantity: i.quantity,
            }))).then(() => {
                localStorage.removeItem(STORAGE_KEY);
                return cartApi.getCart();
            }).then((res) => {
                if (res.success && res.data?.CartItems) {
                    const mapped = res.data.CartItems.map((ci) => ({
                        product_variant_id: ci.product_variant_id,
                        quantity: ci.quantity,
                        product: ci.product_variant?.product,
                        variant: ci.product_variant,
                        cart_item_id: ci.id,
                    }));
                    dispatch({ type: "SET_ITEMS", payload: mapped });
                }
            }).catch(() => { });
        } else {
            cartApi.getCart().then((res) => {
                if (res.success && res.data?.CartItems) {
                    const mapped = res.data.CartItems.map((ci) => ({
                        product_variant_id: ci.product_variant_id,
                        quantity: ci.quantity,
                        product: ci.product_variant?.product,
                        variant: ci.product_variant,
                        cart_item_id: ci.id,
                    }));
                    dispatch({ type: "SET_ITEMS", payload: mapped });
                }
            }).catch(() => { });
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            saveLocalCart(items);
        }
    }, [items, user?.id]);

    const addItem = useCallback(async (product_variant_id, quantity = 1, product, variant) => {
        dispatch({
            type: "ADD_ITEM",
            payload: { product_variant_id, quantity, product, variant, cart_item_id: null },
        });
        if (user?.id) {
            try {
                const cartRes = await cartApi.getCart();
                const cartId = cartRes.data?.id || (await cartApi.getCart()).data?.id;
                await cartApi.addItem({ product_variant_id, quantity, cart_id: cartId });
            } catch { }
        }
    }, [user?.id]);

    const updateQty = useCallback(async (product_variant_id, quantity) => {
        dispatch({ type: "UPDATE_QTY", payload: { product_variant_id, quantity } });
        if (user?.id) {
            try {
                const item = items.find((i) => i.product_variant_id === product_variant_id);
                if (item?.cart_item_id) {
                    await cartApi.updateItem(item.cart_item_id, { quantity });
                }
            } catch { }
        }
    }, [user?.id, items]);

    const removeItem = useCallback(async (product_variant_id) => {
        const item = items.find((i) => i.product_variant_id === product_variant_id);
        dispatch({ type: "REMOVE_ITEM", payload: product_variant_id });
        if (user?.id && item?.cart_item_id) {
            try {
                await cartApi.removeItem(item.cart_item_id);
            } catch { }
        }
    }, [user?.id, items]);

    const clearCart = useCallback(() => {
        dispatch({ type: "CLEAR" });
        if (user?.id) {
            cartApi.getCart().then((res) => {
                const cartId = res.data?.id;
                if (cartId) {
                    res.data?.CartItems?.forEach((ci) => {
                        cartApi.removeItem(ci.id).catch(() => { });
                    });
                }
            }).catch(() => { });
        }
    }, [user?.id]);

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => {
        const price = i.variant?.price || i.product?.base_price || 0;
        return sum + Number(price) * i.quantity;
    }, 0);

    const value = useMemo(() => ({
        items, count, totalAmount,
        addItem, updateQty, removeItem, clearCart,
    }), [items, count, totalAmount, addItem, updateQty, removeItem, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
