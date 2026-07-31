# Lưu Mã Giảm Giá (giống wishlist) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho khách hàng lưu mã giảm giá vào localStorage bằng nút giống tim, hiển thị mã giảm giá trên trang home, và biến `/khuyen-mai` thành "Mã của tôi" chỉ hiển thị mã đã lưu.

**Architecture:** Mô hình 100% client-side giống wishlist. `CouponContext` quản lý mảng code trong localStorage (`sportnexus_saved_coupons`) với cross-tab sync qua `storage` event. `CouponCard` là component dùng chung (auto-save khi copy + trạng thái disabled). Backend chỉ bổ sung endpoint `GET /home/coupon/list?codes=...` (không lọc active) và thêm `coupons` vào home loader. Cũng mở rộng `WishlistContext` bằng cùng cơ chế cross-tab sync.

**Tech Stack:** React 19 + Vite + TanStack Query, Express 5 + Prisma/MySQL.

**Lưu ý chung:** Repo KHÔNG có test framework cho frontend và backend. "Verify" ở mỗi task dùng: `npm run build --prefix client`, `npm run lint --prefix client` (chạy ở root `D:\Programming\SportNexus`), `node --check` (server), và gọi API bằng `Invoke-RestMethod`. Backend chạy nodemon (auto-reload), dev server cổng 5173, API cổng 8081.

---

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `client/src/contexts/CouponContext.jsx` | Create | Quản lý mã đã lưu trong localStorage + cross-tab sync |
| `client/src/contexts/WishlistContext.jsx` | Modify | Thêm cross-tab sync (`storage` event) |
| `client/src/main.jsx` | Modify | Đăng ký `CouponProvider` |
| `client/src/components/ui/couponCard.jsx` | Create | Card mã giảm giá dùng chung (save + copy + disabled) |
| `client/src/pages/Home/components/couponsSection.jsx` | Create | Section "Mã giảm giá" trên home |
| `client/src/pages/Home/index.jsx` | Modify | Render `CouponsSection` từ loader data |
| `client/src/pages/coupons/index.jsx` | Rewrite | "Mã của tôi": mã đã lưu theo codes |
| `client/src/api/web/couponApi.jsx` | Modify | Thêm `getCouponsByCodes(codes)` |
| `server/src/services/web/coupon.service.js` | Modify | Thêm `getCouponsByCodes` |
| `server/src/controllers/web/coupon.controller.js` | Modify | Thêm handler `getCouponsByCodes` |
| `server/src/routes/web/coupon.route.js` | Modify | Thêm `GET /list` |
| `server/src/services/web/home.service.js` | Modify | Trả thêm `coupons` (active) trong `getHomePageData` |

---

### Task 1: WishlistContext — cross-tab sync

**Files:**
- Modify: `client/src/contexts/WishlistContext.jsx:29-31`

- [ ] **Step 1: Thêm storage listener vào WishlistProvider**

Trong `client/src/contexts/WishlistContext.jsx`, sau useEffect hiện có (đoạn `useEffect(() => { saveIds(ids); }, [ids]);`), thêm:

```jsx
    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key !== STORAGE_KEY) return;
            setIds(loadIds());
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client`
Expected: build thành công (chỉ còn warning chunk size / caniuse-lite như mọi khi).

Run: `npm run lint --prefix client`
Expected: không có lỗi mới ở `WishlistContext.jsx`.

- [ ] **Step 3: Commit**

```bash
git add client/src/contexts/WishlistContext.jsx
git commit -m "feat(wishlist): sync wishlist across tabs via storage event"
```

---

### Task 2: CouponContext + đăng ký trong main.jsx

**Files:**
- Create: `client/src/contexts/CouponContext.jsx`
- Modify: `client/src/main.jsx:9-18`

- [ ] **Step 1: Tạo CouponContext**

Tạo file `client/src/contexts/CouponContext.jsx` với nội dung:

```jsx
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
```

- [ ] **Step 2: Đăng ký CouponProvider trong main.jsx**

Sửa `client/src/main.jsx`:

Dòng 10 (`import { WishlistProvider } from "@/contexts/WishlistContext";`) thêm ngay sau đó:

```jsx
import { CouponProvider } from "@/contexts/CouponContext";
```

Và JSX (dòng 16-20) sửa thành:

```jsx
      <CartProvider>
        <WishlistProvider>
          <CouponProvider>
            <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />
          </CouponProvider>
        </WishlistProvider>
      </CartProvider>
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: thành công, không lỗi mới.

- [ ] **Step 4: Commit**

```bash
git add client/src/contexts/CouponContext.jsx client/src/main.jsx
git commit -m "feat(coupons): add CouponContext with localStorage + cross-tab sync"
```

---

### Task 3: Backend — getCouponsByCodes + coupons trong home loader

**Files:**
- Modify: `server/src/services/web/coupon.service.js:17-22`
- Modify: `server/src/controllers/web/coupon.controller.js`
- Modify: `server/src/routes/web/coupon.route.js`
- Modify: `server/src/services/web/home.service.js:45-65`

- [ ] **Step 1: Thêm getCouponsByCodes vào web coupon service**

Trong `server/src/services/web/coupon.service.js`, thêm method vào object `couponWebService` (sau `getActiveCoupons`):

```js
    getCouponsByCodes: async (codes) => {
        if (!Array.isArray(codes) || codes.length === 0) return [];
        return prisma.coupons.findMany({
            where: { code: { in: codes }, deleted_at: ACTIVE },
        });
    },
```

- [ ] **Step 2: Thêm handler vào web coupon controller**

Trong `server/src/controllers/web/coupon.controller.js`, thêm vào object `couponController`:

```js
    getCouponsByCodes: async (req, res) => {
        try {
            const codes = String(req.query.codes || "")
                .split(",")
                .map((code) => code.trim())
                .filter(Boolean);
            const coupons = await couponWebService.getCouponsByCodes(codes);
            return res.status(200).json({
                success: true,
                data: { coupons },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
```

- [ ] **Step 3: Thêm route GET /list**

Trong `server/src/routes/web/coupon.route.js`, sửa thành:

```js
webCouponRoute.get("/list", couponController.getCouponsByCodes);
webCouponRoute.get("/active", couponController.getActiveCoupons);
```

- [ ] **Step 4: Thêm coupons vào home loader**

Trong `server/src/services/web/home.service.js`:

Thêm import ở đầu file:

```js
import couponWebService from "./coupon.service.js";
```

Sửa khối `getHomePageData` (dòng 46-65) thành:

```js
    getHomePageData: async () => {
        const [newestProducts, categories, brands, bestSellers, topRated, productsByCategory, coupons] =
            await Promise.all([
                homeService.getNewestProducts(),
                homeService.getCategories(),
                homeService.getBrands(),
                homeService.getBestSellers(),
                homeService.getTopRated(),
                homeService.getProductsByCategory(),
                couponWebService.getActiveCoupons(),
            ]);

        return {
            newestProducts,
            categories,
            brands,
            bestSellers,
            topRated,
            productsByCategory,
            coupons,
        };
    },
```

- [ ] **Step 5: Syntax check + verify API**

Run: `node --check src/services/web/coupon.service.js; node --check src/controllers/web/coupon.controller.js; node --check src/routes/web/coupon.route.js; node --check src/services/web/home.service.js`
Expected: không có output (syntax OK).

Run: `$r = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/home/coupon/list?codes=FREESHIP,NOTEXIST" -TimeoutSec 15; $r.data.coupons | Select-Object code, is_active | Format-Table -AutoSize`
Expected: trả về coupon FREESHIP (dù bất kể active) và KHÔNG có lỗi; mã không tồn tại bị bỏ qua.

- [ ] **Step 6: Commit**

```bash
git add server/src/services/web/coupon.service.js server/src/controllers/web/coupon.controller.js server/src/routes/web/coupon.route.js server/src/services/web/home.service.js
git commit -m "feat(coupons): add by-codes endpoint and coupons in home loader"
```

---

### Task 4: couponApi client — getCouponsByCodes

**Files:**
- Modify: `client/src/api/web/couponApi.jsx`

- [ ] **Step 1: Thêm method**

Sửa `client/src/api/web/couponApi.jsx` thành:

```jsx
import axiosClient from "@/lib/axiosClient";

const couponApi = {
    getActiveCoupons: () => {
        const url = "/home/coupon/active";
        return axiosClient.get(url);
    },
    getCouponsByCodes: (codes) => {
        const url = `/home/coupon/list?codes=${codes.join(",")}`;
        return axiosClient.get(url);
    },
};

export default couponApi;
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: thành công.

- [ ] **Step 3: Commit**

```bash
git add client/src/api/web/couponApi.jsx
git commit -m "feat(coupons): add getCouponsByCodes api"
```

---

### Task 5: Component CouponCard

**Files:**
- Create: `client/src/components/ui/couponCard.jsx`

- [ ] **Step 1: Tạo CouponCard**

Tạo `client/src/components/ui/couponCard.jsx`:

```jsx
import { useState } from "react";
import { Bookmark, Check, Copy, Tag } from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { formatDate, formatCurrency } from "@/utils/formatters";

const CouponCard = ({ coupon }) => {
  const { isSaved, toggleSave } = useCoupons();
  const [copiedCode, setCopiedCode] = useState(null);

  const now = Date.now();
  const isInactive = coupon.is_active === false;
  const isExpired = new Date(coupon.end_date).getTime() < now;
  const isOutOfStock = coupon.usage_count >= coupon.usage_limit;
  const disabled = isInactive || isExpired || isOutOfStock;

  const statusLabel = isInactive
    ? "Ngưng hiệu lực"
    : isExpired
      ? "Hết hạn"
      : isOutOfStock
        ? "Hết lượt"
        : null;

  const saved = isSaved(coupon.code);

  const handleCopy = () => {
    if (disabled) return;
    if (!saved) toggleSave(coupon);
    navigator.clipboard?.writeText(coupon.code);
    setCopiedCode(coupon.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`relative rounded-2xl border border-dashed border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 flex flex-col gap-3 ${
        disabled ? "opacity-60 grayscale pointer-events-none select-none" : ""
      }`}
    >
      {statusLabel && (
        <span className="absolute top-3 right-3 rounded-full bg-slate-700 text-white text-[11px] font-semibold px-2 py-0.5">
          {statusLabel}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black text-red-600 leading-tight">
            {coupon.discount_type === "PERCENTAGE"
              ? `-${coupon.discount_value}%`
              : formatCurrency(coupon.discount_value)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {coupon.discount_type === "PERCENTAGE"
              ? `Giảm tối đa ${formatCurrency(coupon.max_discount)}`
              : "Giảm trực tiếp trên đơn hàng"}
          </div>
        </div>
        <Tag className="w-5 h-5 text-red-400" />
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 rounded-lg bg-white border border-slate-200 px-3 py-2 font-mono font-bold text-slate-700 tracking-widest uppercase">
          {coupon.code}
        </span>
        <button
          onClick={handleCopy}
          disabled={disabled}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed"
        >
          {copiedCode === coupon.code ? (
            <>
              <Check className="w-4 h-4" />
              Đã copy
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1 text-xs text-slate-600">
        <span>Đơn tối thiểu: {formatCurrency(coupon.min_order_value)}</span>
        <span>Hạn sử dụng: {formatDate(coupon.end_date)}</span>
        <span className="text-slate-400">
          Đã dùng: {coupon.usage_count} / {coupon.usage_limit}
        </span>
      </div>

      <button
        onClick={() => toggleSave(coupon)}
        disabled={disabled}
        className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
          saved
            ? "border-red-600 bg-red-600 text-white"
            : "border-red-600 text-red-600 hover:bg-red-50"
        }`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "Đã lưu mã" : "Lưu mã"}
      </button>
    </div>
  );
};

export default CouponCard;
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: thành công.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ui/couponCard.jsx
git commit -m "feat(coupons): add reusable CouponCard with save/copy/disabled states"
```

---

### Task 6: Section mã giảm giá trên trang home

**Files:**
- Create: `client/src/pages/Home/components/couponsSection.jsx`
- Modify: `client/src/pages/Home/index.jsx`

- [ ] **Step 1: Tạo CouponsSection**

Tạo `client/src/pages/Home/components/couponsSection.jsx`:

```jsx
import CouponCard from "@/components/ui/couponCard";

const CouponsSection = ({ coupons }) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Mã giảm giá</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </section>
  );
};

export default CouponsSection;
```

- [ ] **Step 2: Render trong Home/index.jsx**

Sửa `client/src/pages/Home/index.jsx`:

Thêm import (dòng 6):

```jsx
import { CouponsSection } from "./components/couponsSection";
```

Sửa destructuring (dòng 12-18) — thêm `coupons`:

```jsx
  const {
    newestProducts = [],
    bestSellers = [],
    productsByCategory = [],
    brands = [],
    categories = [],
    coupons = [],
  } = apiData || {};
```

Và thêm `<CouponsSection coupons={coupons} />` trước `<MiddleBanner brands={brands} />` (dòng 36).

- [ ] **Step 3: Verify build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: thành công.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Home/components/couponsSection.jsx client/src/pages/Home/index.jsx
git commit -m "feat(home): show coupon section on home page"
```

---

### Task 7: Trang /khuyen-mai = "Mã của tôi"

**Files:**
- Rewrite: `client/src/pages/coupons/index.jsx`

- [ ] **Step 1: Viết lại toàn bộ file**

Ghi đè `client/src/pages/coupons/index.jsx` bằng:

```jsx
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import couponApi from "@/api/web/couponApi";
import { useCoupons } from "@/contexts/CouponContext";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import CouponCard from "@/components/ui/couponCard";

const CouponsPage = () => {
  const { savedCodes } = useCoupons();

  const { data, isLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => couponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const coupons = data?.success ? data.data.coupons : [];

  if (savedCodes.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8">
        <div className="mx-auto max-w-[1400px] mt-6 md:mt-8">
          <Breadcrumbs
            data={[
              { title: "Trang chủ", route: "/" },
              { title: "Mã của tôi", route: "" },
            ]}
          />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-[1400px] mt-6 md:mt-8">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Mã của tôi", route: "" },
          ]}
        />

        <h1 className="text-xl font-bold text-slate-800 mb-4">
          Mã của tôi ({savedCodes.length})
        </h1>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bookmark className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Chưa lưu mã giảm giá nào
            </h3>
            <p className="text-sm text-slate-500">
              Ghé trang chủ và bấm "Lưu mã" trên các mã giảm giá để dùng sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: thành công.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/coupons/index.jsx
git commit -m "feat(coupons): rework /khuyen-mai to show saved coupons"
```

---

### Task 8: Xác thực tổng hợp (end-to-end)

**Files:** (không sửa code)

- [ ] **Step 1: Build + lint toàn bộ**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: cả hai thành công, không có lỗi/lint mới.

- [ ] **Step 2: Kiểm tra endpoint home trả coupons**

Run: `$r = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/home/" -TimeoutSec 15; $r.data.coupons | Select-Object -First 3 code`
Expected: liệt kê coupon active (FREESHIP, WELCOME10...).

- [ ] **Step 3: Kiểm tra thủ công bằng agent-browser**

- Mở `http://localhost:5173`: section "Mã giảm giá" hiển thị trên home.
- Bấm "Lưu mã" trên một coupon → chuyển thành "Đã lưu mã"; refresh trang → vẫn "Đã lưu mã".
- Bấm "Copy" trên coupon chưa lưu → tự lưu + hiện "Đã copy".
- Mở `/khuyen-mai`: danh sách chỉ gồm mã đã lưu, đúng thứ tự/số lượng.
- Bấm "Đã lưu mã" trên card → bỏ lưu; `/khuyen-mai` tự cập nhật (cross-tab sync nếu mở 2 tab).
- Lưu mã FREESHIP rồi đổi `end_date`/`usage_limit` trong DB (hoặc dùng seed tạm) → card hiển thị badge "Hết hạn"/"Hết lượt" mờ ở `/khuyen-mai`.
- Wishlist: mở 2 tab, thích sản phẩm ở tab A → tab B `/yeu-thich` cập nhật real-time.

---

## Self-Review

**Spec coverage:**
- CouponContext + localStorage `sportnexus_saved_coupons` → Task 2 ✓
- Cross-tab sync coupon → Task 2 ✓
- Cross-tab sync wishlist → Task 1 ✓
- CouponCard (auto-save khi copy, disabled + badge) → Task 5 ✓
- Home section mã giảm giá → Task 6 ✓
- `/khuyen-mai` = mã đã lưu (kể cả hết hiệu lực) → Task 7 ✓
- Endpoint `GET /home/coupon/list?codes=...` (không lọc active) → Task 3 ✓
- Home loader trả `coupons` (active) → Task 3 ✓
- Empty state / không fetch khi rỗng → Task 7 ✓

**Placeholder scan:** Không có TBD/TODO; mọi bước đều có code cụ thể.

**Type consistency:** `toggleSave(coupon)` nhận object, `isSaved(code)` nhận code, `savedCodes` là array string — dùng nhất quán ở Task 2/5/7. API response shape `{ success, data: { coupons } }` nhất quán giữa Task 3 và Task 4/7.
