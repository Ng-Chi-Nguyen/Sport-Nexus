# "Mua kèm" (Buy Together) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị khối "Gợi ý mua kèm" (3 nhóm: sản phẩm tương tự, đã like, đã xem gần đây) ở cuối trang chi tiết sản phẩm.

**Architecture:** Backend thêm endpoint public `GET /home/product/related/:productId` trả sản phẩm cùng danh mục (ưu tiên cùng thương hiệu); tái sử dụng endpoint có sẵn `/home/product/by-ids` cho like & lịch sử xem. Frontend tạo component `RelatedProducts` quản lý 3 nhóm độc lập, tái dùng `ProductCard`, tạo `lib/viewHistory` lưu ID vào localStorage. Không đổi schema.

**Tech Stack:** Express 5, Prisma/MySQL, React 19, React Router (loader), TanStack không dùng cho phần này (dùng `useEffect`), i18next.

**Ghi chú quan trọng:** `getProductsByIds` (core service) có dead code ở dòng 282-283 (sau `return` ở 264) nên `/by-ids` KHÔNG trả `sold_count`. `ProductCard` chỉ hiển thị sold_count khi `>0`, nên nhóm like/xem-gần-đây sẽ không hiện sold_count — hành vi chấp nhận được, KHÔNG sửa trong plan này (ngoài scope).

---

### Task 1: Backend — thêm `getRelatedProducts` vào web product service

**Files:**
- Modify: `server/src/services/web/product.service.js`

Service `productWebService` (dòng 46+) đã có `productSelect` (dòng 8-21), `mapProduct` (dòng 23-44), `getAllProducts`. Ta thêm method `getRelatedProducts` vào object `productWebService` (trước `getAllCategories` ở dòng 156).

- [ ] **Step 1: Thêm method `getRelatedProducts`**

Chèn method sau method `getAllProducts` (sau dòng 154, trước `getAllCategories`):

```javascript
    getRelatedProducts: async (productId, { limit = 8 } = {}) => {
        const current = await prisma.Products.findFirst({
            where: { id: productId, deleted_at: ACTIVE },
            select: { id: true, category_id: true, brand_id: true },
        });
        if (!current) return { products: [] };

        const relatedSelect = {
            ...productSelect,
            ProductVariants: {
                select: { id: true, price: true },
                where: { stock: { gt: 0 }, deleted_at: ACTIVE },
                orderBy: { price: "asc" },
                take: 1,
            },
        };

        const products = await prisma.Products.findMany({
            where: {
                is_active: true,
                deleted_at: ACTIVE,
                category_id: current.category_id,
                id: { not: current.id },
                ProductVariants: { some: { stock: { gt: 0 }, deleted_at: ACTIVE } },
            },
            take: limit,
            select: relatedSelect,
        });

        let mapped = products.map(mapProduct);

        if (current.brand_id) {
            mapped.sort((a, b) =>
                (a.brand?.id === current.brand_id ? 0 : 1) -
                (b.brand?.id === current.brand_id ? 0 : 1),
            );
        }

        const soldCounts = await getSoldCountsByProductIds(mapped.map((p) => p.id));
        mapped = mapped.map((p) => ({ ...p, sold_count: soldCounts.get(p.id) || 0 }));

        return { products: mapped };
    },
```

Lưu ý: `productSelect` hiện có `ProductVariants` thiếu filter `deleted_at: ACTIVE`. Ta override `ProductVariants` trong `relatedSelect` để thêm `where` cho đúng (chỉ lấy biến thể còn hàng, chưa xóa).

- [ ] **Step 2: Kiểm tra cú pháp**

Run: `node --check "server/src/services/web/product.service.js"`
Expected: không có output lỗi.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/web/product.service.js
git commit -m "feat: add getRelatedProducts to web product service"
```

---

### Task 2: Backend — thêm controller + route `related/:productId`

**Files:**
- Modify: `server/src/controllers/web/product.controller.js`
- Modify: `server/src/routes/web/product.route.js`

Controller file đã import `productWebService`. Xem cách `getProductBySlug` trong controller để khớp pattern `try/catch`. Route file đang là:

```javascript
webProductRoute
    .get("/products", productController.getProducts)
    .get("/search", productController.searchProducts)
    .get("/by-ids", productController.getProductsByIds)
    .get("/slug/:slug", productController.getProductBySlug);
```

- [ ] **Step 1: Thêm controller method `getRelatedProducts`**

Chèn vào `product.controller.js` (đặt cùng vị trí các method web khác, ví dụ sau `getProductBySlug`):

```javascript
    getRelatedProducts: async (req, res) => {
        try {
            const productId = parseInt(req.params.productId);
            if (!Number.isInteger(productId) || productId <= 0) {
                return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
            }
            const { products } = await productWebService.getRelatedProducts(productId);
            return res.status(200).json({ success: true, data: { products } });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
        }
    },
```

- [ ] **Step 2: Thêm route**

Sửa `webProductRoute` trong `server/src/routes/web/product.route.js`:

```javascript
webProductRoute
    .get("/products", productController.getProducts)
    .get("/search", productController.searchProducts)
    .get("/by-ids", productController.getProductsByIds)
    .get("/related/:productId", productController.getRelatedProducts)
    .get("/slug/:slug", productController.getProductBySlug);
```

- [ ] **Step 3: Kiểm tra cú pháp**

Run: `node --check "server/src/controllers/web/product.controller.js"` và `node --check "server/src/routes/web/product.route.js"`
Expected: không có output lỗi.

- [ ] **Step 4: Kiểm tra endpoint bằng HTTP**

Server chạy trên port 8080 (backend hiện đang chạy, sẽ tự reload qua nodemon). Lấy một product id hợp lệ rồi gọi:

```powershell
$r = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/home/product/related/1" -TimeoutSec 10
$r.success
$r.data.products.Count
```

Expected: `True` và `products.Count` là số sản phẩm cùng danh mục (>= 0). Nếu backend chưa reload, chờ vài giây hoặc khởi động lại.

- [ ] **Step 5: Commit**

```bash
git add server/src/controllers/web/product.controller.js server/src/routes/web/product.route.js
git commit -m "feat: add related products endpoint and route"
```

---

### Task 3: Frontend — tạo `lib/viewHistory.js`

**Files:**
- Create: `client/src/lib/viewHistory.js`

Pattern theo `client/src/lib/searchHistory.js`. Storage key `sportnexus_recent_views`, giới hạn 12 ID.

- [ ] **Step 1: Tạo file `viewHistory.js`**

```javascript
const STORAGE_KEY = "sportnexus_recent_views";
const MAX_ITEMS = 12;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id))
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const write = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable (private mode / quota)
  }
};

export const getRecentViewIds = () => read();

export const addToViewHistory = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return;
  write([n, ...read().filter((x) => x !== n)]);
};
```

- [ ] **Step 2: Kiểm tra lint/build**

Run: `npm run lint --prefix client`
Expected: không có lỗi mới (file này không phụ thuộc gì).

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/viewHistory.js
git commit -m "feat: add viewHistory localStorage helper"
```

---

### Task 4: Frontend — tạo component `RelatedProducts.jsx`

**Files:**
- Create: `client/src/pages/ProductDetail/components/RelatedProducts.jsx`

Component hiển thị 3 nhóm. Dùng `useWishlist` cho like, `getRecentViewIds` cho xem gần đây, gọi `/home/product/related/:productId` cho sản phẩm tương tự. Mỗi nhóm state riêng. Loại bỏ sản phẩm chính. Ẩn khối nếu cả 3 rỗng.

- [ ] **Step 1: Tạo file `RelatedProducts.jsx`**

```javascript
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axiosClient";
import { useWishlist } from "@/contexts/WishlistContext";
import { getRecentViewIds } from "@/lib/viewHistory";
import { ProductCard } from "@/components/ui/card";

const Group = ({ title, products, loading, indexOffset = 0 }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-sky-500" />
      </div>
    );
  }
  if (!products || products.length === 0) return null;
  return (
    <section>
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {products.map((p, idx) => (
          <ProductCard key={p.id} product={p} index={indexOffset + idx} />
        ))}
      </div>
    </section>
  );
};

const RelatedProducts = ({ productId }) => {
  const { t } = useTranslation();
  const { ids } = useWishlist();

  const [similar, setSimilar] = useState({ loading: true, products: [] });
  const [liked, setLiked] = useState({ loading: true, products: [] });
  const [viewed, setViewed] = useState({ loading: true, products: [] });

  useEffect(() => {
    let active = true;
    setSimilar({ loading: true, products: [] });
    axiosClient
      .get(`/home/product/related/${productId}`)
      .then((res) => {
        if (!active) return;
        setSimilar({
          loading: false,
          products: (res.data?.products || []).filter((p) => p.id !== productId),
        });
      })
      .catch(() => {
        if (active) setSimilar({ loading: false, products: [] });
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const fetchByIds = (idsToFetch, setter) => {
    if (!idsToFetch || idsToFetch.length === 0) {
      setter({ loading: false, products: [] });
      return;
    }
    setter({ loading: true, products: [] });
    axiosClient
      .get(`/home/product/by-ids?ids=${idsToFetch.join(",")}`)
      .then((res) => {
        setter({
          loading: false,
          products: (res.data?.products || []).filter((p) => p.id !== productId),
        });
      })
      .catch(() => setter({ loading: false, products: [] }));
  };

  useEffect(() => {
    fetchByIds(ids.filter((id) => id !== productId), setLiked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, productId]);

  useEffect(() => {
    const recent = getRecentViewIds().filter((id) => id !== productId);
    fetchByIds(recent, setViewed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const showAny =
    !similar.loading && !liked.loading && !viewed.loading &&
    (similar.products.length > 0 || liked.products.length > 0 || viewed.products.length > 0);

  if (!showAny) return null;

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
        {t("related_title")}
      </h2>
      <Group title={t("related_similar")} products={similar.products} loading={similar.loading} />
      <Group title={t("related_liked")} products={liked.products} loading={liked.loading} indexOffset={similar.products.length} />
      <Group title={t("related_viewed")} products={viewed.products} loading={viewed.loading} indexOffset={similar.products.length + liked.products.length} />
    </div>
  );
};

export default RelatedProducts;
```

Lưu ý: `axiosClient` interceptor trả về `response.data`, nên `res` ở đây = `{ success, data }`, do đó dùng `res.data?.products`. Điều này khớp với cách `productsLoader` dùng `res.data`.

- [ ] **Step 2: Kiểm tra lint**

Run: `npm run lint --prefix client`
Expected: chỉ còn warning `react-hooks/exhaustive-deps` (đã có comment disable) nếu có; không lỗi.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ProductDetail/components/RelatedProducts.jsx
git commit -m "feat: add RelatedProducts component"
```

---

### Task 5: Frontend — gắn component + ghi lịch sử xem vào ProductDetail

**Files:**
- Modify: `client/src/pages/ProductDetail/index.jsx`

Thêm import, gọi `addToViewHistory` trong `useEffect` khi có product, và render `<RelatedProducts>` sau `ProductTabs`/`ReviewList`.

- [ ] **Step 1: Thêm import**

Sửa phần import đầu file `client/src/pages/ProductDetail/index.jsx`:

```javascript
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { addToViewHistory } from "@/lib/viewHistory";
import {
  addToSearchHistory,
  clearLastSearchTerm,
  getLastSearchTerm,
} from "@/lib/searchHistory";
```

Và sau import `ReviewList`:

```javascript
import ReviewList from "./components/ReviewList";
import RelatedProducts from "./components/RelatedProducts";
```

- [ ] **Step 2: Ghi lịch sử xem khi có product**

Chèn `useEffect` sau khối `useEffect` đầu tiên (sau dòng ~37), trước dòng `const product = loaderData?.success ...`:

```javascript
  useEffect(() => {
    if (loaderData?.success && loaderData.data?.id) {
      addToViewHistory(loaderData.data.id);
    }
  }, [loaderData]);
```

- [ ] **Step 3: Render `RelatedProducts`**

Sửa cuối JSX, sau khối `ProductTabs`/`ReviewList` (dòng ~250-253):

```javascript
        <div className="mt-8 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <ProductTabs description={product.description} />
          <ReviewList reviews={ratings} />
        </div>

        <RelatedProducts productId={product.id} />
```

- [ ] **Step 4: Kiểm tra build + lint**

Run: `npm run build --prefix client` và `npm run lint --prefix client`
Expected: build thành công, lint không lỗi mới.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/ProductDetail/index.jsx
git commit -m "feat: render RelatedProducts and record view history on product detail"
```

---

### Task 6: Frontend — thêm key i18n

**Files:**
- Modify: `client/src/locales/vi/product-detail.json`
- Modify: `client/src/locales/en/product-detail.json`

File `product-detail.json` được spread phẳng vào namespace `translation` (xem `client/src/lib/i18n.js` dòng 14/30). Thêm 4 key.

- [ ] **Step 1: Thêm key vào `vi/product-detail.json`**

Chèn trước dấu `}` cuối file:

```json
  "related_title": "Gợi ý mua kèm",
  "related_similar": "Sản phẩm tương tự",
  "related_liked": "Sản phẩm đã thích",
  "related_viewed": "Sản phẩm đã xem gần đây"
```

(Đảm bảo key trước đó có dấu phẩy đúng — file JSON hợp lệ.)

- [ ] **Step 2: Thêm key vào `en/product-detail.json`**

Chèn trước dấu `}` cuối file:

```json
  "related_title": "Buy together",
  "related_similar": "Similar products",
  "related_liked": "Liked products",
  "related_viewed": "Recently viewed"
```

- [ ] **Step 3: Kiểm tra build**

Run: `npm run build --prefix client`
Expected: build thành công (JSON hợp lệ).

- [ ] **Step 4: Commit**

```bash
git add client/src/locales/vi/product-detail.json client/src/locales/en/product-detail.json
git commit -m "feat: add buy-together i18n keys"
```

---

### Task 7: Verify tổng thể end-to-end

**Files:** không thay đổi file.

Kiểm tra cả backend lẫn frontend hoạt động đúng.

- [ ] **Step 1: Xác nhận backend endpoint**

```powershell
$r = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/home/product/related/1" -TimeoutSec 10
"success=$($r.success) count=$($r.data.products.Count)"
```

Expected: `success=True` và `count` >= 0. Kiểm tra 1-2 product id khác nhau để chắc chắn.

- [ ] **Step 2: Kiểm tra UI qua trình duyệt**

Mở `http://localhost:5173/san-pham/<slug-của-sản-phẩm-bóng-đá>`. Kiểm tra:
1. Khối "Gợi ý mua kèm" xuất hiện dưới đánh giá.
2. Nhóm "Sản phẩm tương tự" có sản phẩm cùng danh mục (ưu tiên cùng thương hiệu).
3. Nhóm "Sản phẩm đã thích" / "Sản phẩm đã xem gần đây" xuất hiện khi có ID trong localStorage (nhấn tim vài sản phẩm, xem vài sản phẩm).
4. Click vào 1 sản phẩm trong khối → vào đúng trang chi tiết.
5. Ẩn khối nếu không có nhóm nào có sản phẩm (test với sản phẩm danh mục ít sản phẩm, localStorage rỗng).

- [ ] **Step 3: Kiểm tra i18n**

Đổi ngôn ngữ sang EN, reload trang, xác nhận tiêu đề các nhóm chuyển sang tiếng Anh.

- [ ] **Step 4: Commit bất kỳ thay đổi phát sinh**

Nếu phát hiện lỗi trong bước verify, sửa và commit. Không có thay đổi thì không commit gì thêm.
