# Cart Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng giỏ hàng kết hợp localStorage (guest) + server sync (đã login) với CartPage đầy đủ chức năng.

**Architecture:** CartContext (React Context + useReducer) + localStorage cho guest; Cart API (đã có sẵn một phần trên server) cho authenticated user; sync khi login.

**Tech Stack:** React Context, localStorage, Express, Prisma, Tailwind

---

### Task 1: Bổ sung & fix server-side cart API

**Files:**
- Modify: `server/src/services/customer/cartItem.service.js`
- Modify: `server/src/controllers/customer/cartItem.controller.js`
- Modify: `server/src/routes/customer/cartItem.route.js`
- Create: `server/src/services/customer/cart.service.js`
- Create: `server/src/controllers/customer/cart.controller.js`
- Create: `server/src/routes/customer/cart.route.js`
- Modify: `server/src/routes/index.route.js`

- [ ] **Step 1: Sửa lỗi `cartItems` → `cartItem` trong controller**

File: `server/src/controllers/customer/cartItem.controller.js` — dòng 28-33, sửa `cartItems` thành `cartItem`:

```js
// Sửa dòng 28-33:
if (!cartItem || cartItem.length === 0) {
```

- [ ] **Step 2: Thêm `verifyToken` vào cartItem route**

File: `server/src/routes/customer/cartItem.route.js`:

```js
import express from "express";
import { validate } from "../../middlewares/validation.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import cartItemSchema from "../../validators/customer/cartItem.validator.js";
import cartItemController from "../../controllers/customer/cartItem.controller.js";

const cartItemRoute = express.Router();

cartItemRoute.use(verifyToken);

cartItemRoute
    .post("/", validate(cartItemSchema.createCartItem), cartItemController.createCartItem)
    .get("/:id", cartItemController.getCartItemById)
    .get("/cart/:id", cartItemController.getCartItemByCartId)
    .put("/:id", validate(cartItemSchema.updateCartItem), cartItemController.updateCartItem)
    .delete("/:id", cartItemController.deleteCartItem)

export default cartItemRoute;
```

- [ ] **Step 3: Tạo `cart.service.js` — getOrCreateCart, getCartWithItems**

File `server/src/services/customer/cart.service.js`:

```js
import prisma from "../../db/prisma.js";

const cartService = {
    getOrCreateCart: async (userId) => {
        let cart = await prisma.Carts.findUnique({
            where: { user_id: userId },
        });
        if (!cart) {
            cart = await prisma.Carts.create({
                data: { user_id: userId },
            });
        }
        return cart;
    },

    getCartWithItems: async (userId) => {
        const cart = await prisma.Carts.findUnique({
            where: { user_id: userId },
            include: {
                CartItems: {
                    include: {
                        product_variant: {
                            include: {
                                product: { select: { id: true, name: true, slug: true, thumbnail: true, base_price: true } },
                                VariableAttributes: {
                                    include: { attributeKey: { select: { name: true, unit: true } } },
                                },
                            },
                        },
                    },
                },
            },
        });
        return cart;
    },

    syncCart: async (userId, items) => {
        let cart = await cartService.getOrCreateCart(userId);

        for (const item of items) {
            const existing = await prisma.CartItems.findUnique({
                where: {
                    cart_id_product_variant_id: {
                        cart_id: cart.id,
                        product_variant_id: item.product_variant_id,
                    },
                },
            });

            if (existing) {
                await prisma.CartItems.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity },
                });
            } else {
                await prisma.CartItems.create({
                    data: {
                        cart_id: cart.id,
                        product_variant_id: item.product_variant_id,
                        quantity: item.quantity,
                    },
                });
            }
        }

        return cartService.getCartWithItems(userId);
    },
};

export default cartService;
```

- [ ] **Step 4: Tạo `cart.controller.js`**

File `server/src/controllers/customer/cart.controller.js`:

```js
import cartService from "../../services/customer/cart.service.js";

const cartController = {
    getCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCartWithItems(userId);
            return res.status(200).json({
                success: true,
                data: cart || { CartItems: [] },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi lấy giỏ hàng.",
                error: error.message,
            });
        }
    },

    syncCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { items } = req.body;
            const cart = await cartService.syncCart(userId, items);
            return res.status(200).json({
                success: true,
                message: "Đồng bộ giỏ hàng thành công.",
                data: cart,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi đồng bộ giỏ hàng.",
                error: error.message,
            });
        }
    },
};

export default cartController;
```

- [ ] **Step 5: Tạo `cart.route.js`**

File `server/src/routes/customer/cart.route.js`:

```js
import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import cartController from "../../controllers/customer/cart.controller.js";

const cartRoute = express.Router();

cartRoute.use(verifyToken);

cartRoute
    .get("/", cartController.getCart)
    .post("/sync", cartController.syncCart)

export default cartRoute;
```

- [ ] **Step 6: Đăng ký route mới trong `index.route.js`**

```js
import cartRoute from "./customer/cart.route.js";
// ...
app.use(`${api_prefix_v1}customer/cart/`, cartRoute)
```

- [ ] **Step 7: Commit server changes**

```bash
git add server/src/services/customer/cart.service.js server/src/controllers/customer/cart.controller.js server/src/routes/customer/cart.route.js server/src/routes/index.route.js server/src/controllers/customer/cartItem.controller.js server/src/routes/customer/cartItem.route.js
git commit -m "Cart server: fix bugs, add getCart/syncCart, verifyToken"
```

---

### Task 2: Client cart API + CartContext

**Files:**
- Create: `client/src/api/customer/cartApi.jsx`
- Create: `client/src/contexts/CartContext.jsx`
- Modify: `client/src/main.jsx` (bọc CartProvider)

- [ ] **Step 1: Tạo `client/src/api/customer/cartApi.jsx`**

```js
import axiosClient from "@/api/axiosClient";

const cartApi = {
    getCart: () => axiosClient.get("/customer/cart/"),

    addItem: (data) => axiosClient.post("/customer/cart-item/", data),

    updateItem: (id, data) => axiosClient.put(`/customer/cart-item/${id}`, data),

    removeItem: (id) => axiosClient.delete(`/customer/cart-item/${id}`),

    syncCart: (items) => axiosClient.post("/customer/cart/sync", { items }),
};

export default cartApi;
```

- [ ] **Step 2: Tạo `client/src/contexts/CartContext.jsx`**

```js
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
            const { product_variant_id, quantity, product, variant } = action.payload;
            const existing = state.find((i) => i.product_variant_id === product_variant_id);
            if (existing) {
                return state.map((i) =>
                    i.product_variant_id === product_variant_id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...state, { product_variant_id, quantity, product, variant, cart_item_id: null }];
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

const mergeItems = (localItems, serverItems) => {
    const map = new Map();
    localItems.forEach((i) => map.set(i.product_variant_id, i));
    serverItems.forEach((i) => {
        const key = i.product_variant_id;
        if (map.has(key)) {
            map.get(key).quantity += i.quantity;
        } else {
            map.set(key, {
                product_variant_id: i.product_variant_id,
                quantity: i.quantity,
                product: i.product_variant?.product,
                variant: i.product_variant,
                cart_item_id: i.id,
            });
        }
    });
    return Array.from(map.values());
};

export const CartProvider = ({ children }) => {
    const [items, dispatch] = useReducer(cartReducer, [], loadLocalCart);

    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;

    // Load server cart on mount if logged in
    useEffect(() => {
        if (!user?.id) return;
        cartApi.getCart().then((res) => {
            if (res.success && res.data?.CartItems?.length > 0) {
                const localItems = loadLocalCart();
                const serverItems = res.data.CartItems.map((ci) => ({
                    ...ci,
                    product_variant_id: ci.product_variant_id,
                }));
                const merged = localItems.length > 0 ? mergeItems(localItems, serverItems) : serverItems;
                dispatch({ type: "SET_ITEMS", payload: merged });
                if (localItems.length > 0) {
                    cartApi.syncCart(localItems.map((i) => ({ product_variant_id: i.product_variant_id, quantity: i.quantity })));
                    localStorage.removeItem(STORAGE_KEY);
                }
            } else if (localItems.length > 0) {
                cartApi.syncCart(localItems.map((i) => ({ product_variant_id: i.product_variant_id, quantity: i.quantity })));
                localStorage.removeItem(STORAGE_KEY);
            }
        }).catch(() => { });
    }, [user?.id]);

    // Persist to localStorage when not logged in
    useEffect(() => {
        if (!user?.id) {
            saveLocalCart(items);
        }
    }, [items, user?.id]);

    const addItem = useCallback(async (product_variant_id, quantity = 1, product, variant) => {
        dispatch({ type: "ADD_ITEM", payload: { product_variant_id, quantity, product, variant } });
        if (user?.id) {
            try {
                const cartRes = await cartApi.getCart();
                const cartId = cartRes.data?.id;
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
    }, []);

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + (i.variant?.price || i.product?.base_price || 0) * i.quantity, 0);

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
```

- [ ] **Step 3: Bọc CartProvider trong `client/src/main.jsx`**

```jsx
import { CartProvider } from "@/contexts/CartContext";

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

- [ ] **Step 4: Commit**

```bash
git add client/src/api/customer/cartApi.jsx client/src/contexts/CartContext.jsx client/src/main.jsx
git commit -m "Cart client: API + CartContext + Provider"
```

---

### Task 3: Cart Page

**Files:**
- Create: `client/src/pages/Cart/components/CartItem.jsx`
- Create: `client/src/pages/Cart/components/CartSummary.jsx`
- Create: `client/src/pages/Cart/components/EmptyCart.jsx`
- Create: `client/src/pages/Cart/index.jsx`

- [ ] **Step 1: Tạo `CartItem.jsx`**

```jsx
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Link } from "react-router-dom";

const CartItem = ({ item, onUpdateQty, onRemove, selected, onToggleSelect }) => {
    const price = item.variant?.price || item.product?.base_price || 0;
    const subtotal = price * item.quantity;
    const attributes = item.variant?.VariableAttributes || [];

    return (
        <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-sm">
            <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(item.product_variant_id)}
                className="mt-1 shrink-0"
            />
            <Link to={`/san-pham/${item.product?.slug}`} className="shrink-0">
                <div className="w-20 h-20 bg-[#F8F8F8] border border-slate-100 rounded-sm overflow-hidden">
                    {item.product?.thumbnail ? (
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                            {item.product?.name?.charAt(0) || "?"}
                        </div>
                    )}
                </div>
            </Link>
            <div className="flex-1 min-w-0">
                <Link to={`/san-pham/${item.product?.slug}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-2">
                    {item.product?.name || "Sản phẩm"}
                </Link>
                {attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {attributes.map((a, i) => (
                            <span key={i} className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {a.attributeKey?.name}: {a.value}
                            </span>
                        ))}
                    </div>
                )}
                <p className="text-sm font-bold text-red-600 mt-1">{formatCurrency(price)}</p>
            </div>
            <div className="flex items-center border border-slate-300 rounded-sm overflow-hidden shrink-0">
                <button onClick={() => onUpdateQty(item.product_variant_id, Math.max(1, item.quantity - 1))}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
                    disabled={item.quantity <= 1}>
                    <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.product_variant_id, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors">
                    <Plus size={14} />
                </button>
            </div>
            <p className="text-sm font-bold text-slate-800 w-24 text-right shrink-0">{formatCurrency(subtotal)}</p>
            <button onClick={() => onRemove(item.product_variant_id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={16} />
            </button>
        </div>
    );
};

export default CartItem;
```

- [ ] **Step 2: Tạo `CartSummary.jsx`**

```jsx
import { useState } from "react";
import useCoupon from "@/hooks/useCoupon";
import { formatCurrency } from "@/utils/formatters";

const CartSummary = ({ selectedItems, totalAmount, onCheckout }) => {
    const { couponCode, setCouponCode, couponMsg, couponData, loading: couponLoading, applyCoupon, clearCoupon } = useCoupon();

    const subtotal = selectedItems.reduce((s, i) => {
        const price = i.variant?.price || i.product?.base_price || 0;
        return s + price * i.quantity;
    }, 0);
    const discount = couponData?.discount ?? 0;
    const finalAmount = couponData?.newAmount ?? subtotal;
    const shipping = subtotal >= 500000 ? 0 : 30000;

    return (
        <div className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tổng cộng</h3>

            <div className="flex items-center gap-2">
                <input
                    type="text" value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Mã giảm giá"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-blue-400"
                />
                <button
                    onClick={() => applyCoupon(subtotal, couponCode)}
                    disabled={couponLoading || !couponCode}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    Áp dụng
                </button>
            </div>
            {couponMsg && (
                <p className={`text-xs ${couponMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {couponMsg.text}
                </p>
            )}
            {couponData && (
                <button onClick={clearCoupon} className="text-xs text-blue-600 hover:underline">Xóa mã</button>
            )}

            <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-2">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatCurrency(finalAmount + shipping)}</span>
                </div>
            </div>

            <button
                onClick={() => onCheckout(selectedItems)}
                disabled={selectedItems.length === 0}
                className="w-full py-3 bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Tiến hành thanh toán ({selectedItems.length} sản phẩm)
            </button>
        </div>
    );
};

export default CartSummary;
```

- [ ] **Step 3: Tạo `EmptyCart.jsx`**

```jsx
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
        <ShoppingBag size={64} className="text-slate-300" />
        <p className="text-slate-500 text-lg">Giỏ hàng trống</p>
        <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm">
            Mua sắm ngay
        </Link>
    </div>
);

export default EmptyCart;
```

- [ ] **Step 4: Tạo `Cart/index.jsx`**

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/utils/formatters";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCart from "./components/EmptyCart";

const CartPage = () => {
    const { items, updateQty, removeItem, count, totalAmount } = useCart();
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState(new Set());

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.product_variant_id)));
        }
    };

    const selectedItems = items.filter((i) => selectedIds.has(i.product_variant_id));

    if (!items.length) return <EmptyCart />;

    return (
        <div className="min-h-screen py-4 md:py-8">
            <div className="mx-auto max-w-5xl">
                <Breadcrumbs data={[
                    { title: "Trang chủ", route: "/" },
                    { title: "Giỏ hàng", route: "" },
                ]} />
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-6">Giỏ hàng ({count} sản phẩm)</h1>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                    <div className="md:col-span-3 space-y-3">
                        <div className="flex items-center gap-3 px-1 py-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="shrink-0"
                            />
                            <span className="text-sm text-slate-600">Chọn tất cả ({items.length} sản phẩm)</span>
                        </div>
                        {items.map((item) => (
                            <CartItem
                                key={item.product_variant_id}
                                item={item}
                                selected={selectedIds.has(item.product_variant_id)}
                                onToggleSelect={toggleSelect}
                                onUpdateQty={updateQty}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                    <div className="md:col-span-2 sticky top-4">
                        <CartSummary
                            selectedItems={selectedItems}
                            totalAmount={totalAmount}
                            onCheckout={(selItems) => {
                                const checkoutItems = selItems.map((i) => ({
                                    product_variant_id: i.product_variant_id,
                                    quantity: i.quantity,
                                    price_at_purchase: i.variant?.price || i.product?.base_price || 0,
                                    name: i.product?.name || "",
                                    attributes: (i.variant?.VariableAttributes || []).map((va) => ({
                                        name: va.attributeKey?.name,
                                        value: va.value,
                                    })),
                                }));
                                navigate("/thanh-toan", { state: { items: checkoutItems } });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Cart/
git commit -m "Cart page: CartItem, CartSummary, EmptyCart components"
```

---

### Task 4: Add to cart wiring + Header + Route

**Files:**
- Modify: `client/src/components/ui/card.jsx`
- Modify: `client/src/pages/ProductDetail/components/ActionBar.jsx`
- Modify: `client/src/pages/ProductDetail/index.jsx`
- Modify: `client/src/components/header.jsx`
- Modify: `client/src/routes/webRoute.jsx`

- [ ] **Step 1: Thêm `addItem` vào ProductCard (`card.jsx`)**

Thêm `import { useCart } from "@/contexts/CartContext";` và gọi `addItem`:

```jsx
import { useCart } from "@/contexts/CartContext";

const ProductCard = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  // ...
  
  // Sửa nút "Thêm vào giỏ":
  <button
    title="Thêm vào giỏ"
    className="p-2.5 hover:bg-slate-50 text-slate-800 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      addItem(product.id, 1, product, null);
    }}
  >
    <ShoppingCart size={16} />
  </button>
```

- [ ] **Step 2: Sửa `ActionBar.jsx` và `ProductDetail/index.jsx`**

Trong `ActionBar.jsx` — không thay đổi props, chỉ thay đổi cách gọi từ cha.

Trong `ProductDetail/index.jsx`:

```jsx
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { addItem } = useCart();
  // ...
  
  // Sửa dòng onAddToCart:
  onAddToCart={() => {
    if (hasAttrs && !selectedVariant) return;
    const theVariant = selectedVariant || variants[0];
    addItem(theVariant.id, quantity, product, theVariant);
  }}
```

- [ ] **Step 3: Sửa Header — cart icon thành link + badge real**

```jsx
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Header = ({ isScrolled, categories }) => {
  const { count } = useCart();
  // ...
  
  // Sửa cart button:
  <Link
    to="/gio-hang"
    className="relative p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-200"
  >
    <ShoppingCart size={20} strokeWidth={1.5} />
    {count > 0 && (
      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </Link>
```

- [ ] **Step 4: Thêm route `/gio-hang`**

Trong `client/src/routes/webRoute.jsx`:

```jsx
const CartPage = lazy(() => import("@/pages/Cart"));

// Trong webRoutes.children:
{
  path: "gio-hang",
  element: <CartPage />,
},
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/card.jsx client/src/pages/ProductDetail/index.jsx client/src/pages/ProductDetail/components/ActionBar.jsx client/src/components/header.jsx client/src/routes/webRoute.jsx
git commit -m "Add to cart wiring: ProductCard, ActionBar, Header badge, /gio-hang route"
```

---

### Task 5: Sync cart on login

**Files:**
- Modify: `client/src/contexts/CartContext.jsx` (đã tích hợp ở Task 2)
- Modify: `client/src/api/auth/auth.jsx`
- Modify: `client/src/pages/auth/login.jsx`

Logic đã được tích hợp trong CartContext (Task 2 Step 2) — khi phát hiện `user?.id` thay đổi, context tự động gọi fetch server cart + sync.

Cần trigger CartContext refresh khi login thành công. Cách đơn giản: login component cập nhật localStorage `user`, CartContext `useEffect` phụ thuộc `user?.id` sẽ tự chạy.

*Không cần thay đổi thêm — CartContext đã xử lý việc này.*

- [ ] **Step 1: Verify login flow hoạt động**

Kiểm tra rằng:
1. CartContext khởi tạo với localStorage cart
2. Sau login, user key được set vào localStorage
3. CartContext rerender với user mới
4. Effect chạy: sync local items → server, sau đó fetch server cart

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "Cart: sync on login via CartContext effect"
```
