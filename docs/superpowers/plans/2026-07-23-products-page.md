# Products Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public `/san-pham` products listing page with full filtering, sorting, and pagination, plus link "Xem thêm" buttons from Home index.

**Architecture:** New server-side service + controller under `server/src/services/web/` and `server/src/controllers/web/` for a `GET /api/v1/home/products` endpoint. New frontend page at `client/src/pages/Products/` with FilterSidebar + ProductGrid. Home components pass query params to SeeMore/Link.

**Tech Stack:** Express 5, Prisma, React 19, React Router, Tailwind

---

### Task 1: Backend — Create web product service

**Files:**
- Create: `server/src/services/web/product.service.js`

- [ ] **Step 1: Create product service with getAllProducts, getAllCategoriesWithCount, getAllBrandsWithCount**

Write to `server/src/services/web/product.service.js`:

```js
import prisma from "../../db/prisma.js";
import { ACTIVE } from "../../utils/prisma.js";

const productSelect = {
    id: true, name: true, slug: true,
    base_price: true, thumbnail: true, created_at: true,
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, logo: true } },
    ProductVariants: {
        select: { id: true, price: true },
        orderBy: { price: "asc" },
        take: 1,
    },
    Reviews: {
        select: { rating: true },
        take: 20,
    },
};

const mapProduct = (p) => {
    const ratings = p.Reviews.map((r) => r.rating);
    const avgRating =
        ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
            : 0;

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        base_price: p.base_price,
        thumbnail: p.thumbnail,
        created_at: p.created_at,
        category: p.category,
        brand: p.brand,
        min_price: Number(p.ProductVariants[0]?.price) || Number(p.base_price),
        first_variant_id: p.ProductVariants[0]?.id || null,
        avg_rating: avgRating,
        total_reviews: ratings.length,
    };
};

const productWebService = {
    getAllProducts: async ({ page = 1, search, sort, category_id, brand_id, price_min, price_max, limit = 12 } = {}) => {
        const currentPage = Math.max(1, page);
        const take = Math.min(limit, 50);
        const skip = (currentPage - 1) * take;
        const where = { is_active: true, deleted_at: ACTIVE };

        if (search) where.name = { contains: search };
        if (category_id) where.category_id = parseInt(category_id);
        if (brand_id) where.brand_id = parseInt(brand_id);
        if (price_min) where.base_price = { ...where.base_price, gte: parseFloat(price_min) };
        if (price_max) where.base_price = { ...where.base_price, lte: parseFloat(price_max) };

        let orderBy = { created_at: "desc" };
        if (sort === "price-asc") orderBy = { base_price: "asc" };
        if (sort === "price-desc") orderBy = { base_price: "desc" };
        if (sort === "newest") orderBy = { created_at: "desc" };

        let [products, totalItems] = await Promise.all([
            prisma.Products.findMany({
                where,
                orderBy,
                take,
                skip,
                select: productSelect,
            }),
            prisma.Products.count({ where }),
        ]);

        let mapped = products.map(mapProduct);

        if (sort === "best-selling") {
            const topVariantIds = (await prisma.OrderItems.groupBy({
                by: ["product_variant_id"],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 200,
            })).map(v => v.product_variant_id);

            if (topVariantIds.length > 0) {
                const variants = await prisma.ProductVariants.findMany({
                    where: { id: { in: topVariantIds }, deleted_at: ACTIVE },
                    select: { product_id: true },
                });
                const topProductIds = [...new Set(variants.map(v => v.product_id))];
                mapped.sort((a, b) => topProductIds.indexOf(a.id) - topProductIds.indexOf(b.id));
            }
        }

        if (sort === "rating") {
            mapped.sort((a, b) => b.avg_rating - a.avg_rating);
        }

        return {
            products: mapped,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage,
                itemsPerPage: take,
            },
        };
    },

    getAllCategories: async () => {
        return prisma.Categories.findMany({
            where: { is_active: true, deleted_at: ACTIVE },
            select: { id: true, name: true, slug: true, image: true },
        });
    },

    getAllBrands: async () => {
        return prisma.Brands.findMany({
            where: { deleted_at: ACTIVE },
            select: { id: true, name: true, logo: true },
        });
    },
};

export default productWebService;
```

- [ ] **Step 2: Verify file syntax**

Run: `node -e "import('./server/src/services/web/product.service.js').then(m => console.log('OK', Object.keys(m.default))).catch(e => console.error(e))"` (or just check the file parses correctly)

- [ ] **Step 3: Commit**

```bash
git add server/src/services/web/product.service.js
git commit -m "feat(server): add web product service with listing, filters, sort, pagination"
```

---

### Task 2: Backend — Create web product controller + route

**Files:**
- Modify: `server/src/controllers/web/product.controller.js`
- Modify: `server/src/routes/web/product.route.js`

- [ ] **Step 1: Add getProducts controller method**

Update `server/src/controllers/web/product.controller.js`:

```js
import productService from "../../services/core/product.service.js";
import productWebService from "../../services/web/product.service.js";

const productController = {
    getProductBySlug: async (req, res) => {
        // ... existing code unchanged ...
    },

    getProducts: async (req, res) => {
        try {
            const { page, search, sort, category_id, brand_id, price_min, price_max, limit } = req.query;

            const [productData, categories, brands] = await Promise.all([
                productWebService.getAllProducts({ page, search, sort, category_id, brand_id, price_min, price_max, limit }),
                productWebService.getAllCategories(),
                productWebService.getAllBrands(),
            ]);

            return res.status(200).json({
                success: true,
                data: {
                    products: productData.products,
                    pagination: productData.pagination,
                    categories,
                    brands,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message,
            });
        }
    },
};

export default productController;
```

- [ ] **Step 2: Add route for GET /products**

Update `server/src/routes/web/product.route.js`:

```js
import express from "express";
import productController from "../../controllers/web/product.controller.js";

const webProductRoute = express.Router();

webProductRoute

    .get("/products", productController.getProducts)
    .get("/slug/:slug", productController.getProductBySlug)

export default webProductRoute;
```

The existing route `GET /home/product/slug/:slug` maps to `/api/v1/home/product/slug/:slug`. The new route `GET /home/product/products` maps to `/api/v1/home/product/products`.

- [ ] **Step 3: Verify syntax**

Run: `node -e "import('./server/src/controllers/web/product.controller.js').then(m => console.log('OK')).catch(e => console.error(e))"`

- [ ] **Step 4: Commit**

```bash
git add server/src/controllers/web/product.controller.js server/src/routes/web/product.route.js
git commit -m "feat(server): add GET /home/product/products endpoint"
```

---

### Task 3: Frontend — Create products page components

**Files:**
- Create: `client/src/loaders/web/productsLoader.js`
- Create: `client/src/pages/Products/index.jsx`
- Create: `client/src/pages/Products/components/FilterSidebar.jsx`

- [ ] **Step 1: Create loader**

Write to `client/src/loaders/web/productsLoader.js`:

```js
import axiosClient from "@/lib/axiosClient";

export const productsLoader = async ({ request }) => {
  const url = new URL(request.url);
  const params = new URLSearchParams({
    page: url.searchParams.get("page") || "1",
    search: url.searchParams.get("search") || "",
    sort: url.searchParams.get("sort") || "newest",
    category_id: url.searchParams.get("category_id") || "",
    brand_id: url.searchParams.get("brand_id") || "",
    price_min: url.searchParams.get("price_min") || "",
    price_max: url.searchParams.get("price_max") || "",
    limit: "12",
  });

  const res = await axiosClient.get(`/home/product/products?${params}`);
  return res.data;
};
```

- [ ] **Step 2: Create FilterSidebar component**

Write to `client/src/pages/Products/components/FilterSidebar.jsx`:

```jsx
import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { slug: "newest", name: "Mới nhất" },
  { slug: "best-selling", name: "Bán chạy" },
  { slug: "price-asc", name: "Giá: Thấp → Cao" },
  { slug: "price-desc", name: "Giá: Cao → Thấp" },
  { slug: "rating", name: "Đánh giá cao nhất" },
];

const FilterSelect = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.slug === value);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
      >
        <span className={selected ? "text-slate-700" : "text-slate-400"}>{selected ? selected.name : placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.slug}
              onClick={() => { onChange(opt.slug); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${value === opt.slug ? "text-blue-600 font-semibold bg-blue-50" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterSidebar = ({ search, sort, categoryId, brandId, priceMin, priceMax, categories, brands, onSearchChange, onSortChange, onCategoryChange, onBrandChange, onPriceMinChange, onPriceMaxChange, onClear }) => {
  const [searchInput, setSearchInput] = useState(search || "");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => onSearchChange(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
        Bộ lọc
      </h3>

      {/* Search */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); onSearchChange(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Danh mục
        </label>
        <FilterSelect
          value={categoryId}
          onChange={onCategoryChange}
          placeholder="Tất cả danh mục"
          options={[
            { slug: "", name: "Tất cả" },
            ...(categories || []).map((c) => ({ slug: String(c.id), name: c.name })),
          ]}
        />
      </div>

      {/* Brand */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Thương hiệu
        </label>
        <FilterSelect
          value={brandId}
          onChange={onBrandChange}
          placeholder="Tất cả thương hiệu"
          options={[
            { slug: "", name: "Tất cả" },
            ...(brands || []).map((b) => ({ slug: String(b.id), name: b.name })),
          ]}
        />
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Khoảng giá
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
          <span className="text-slate-300 shrink-0">–</span>
          <input
            type="number"
            placeholder="Tối đa"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
          Sắp xếp
        </label>
        <FilterSelect
          value={sort || "newest"}
          onChange={onSortChange}
          placeholder="Mới nhất"
          options={SORT_OPTIONS}
        />
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="w-full py-2.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default FilterSidebar;
```

- [ ] **Step 3: Create Products page**

Write to `client/src/pages/Products/index.jsx`:

```jsx
import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import FilterSidebar from "./components/FilterSidebar";
import { ProductCard } from "@/components/ui/card";
import Pagination from "@/components/ui/pagination";

const ProductsPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const products = responses?.data?.products || [];
  const categories = responses?.data?.categories || [];
  const brands = responses?.data?.brands || [];
  const pagination = responses?.data?.pagination || { totalPages: 1, currentPage: 1 };

  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category_id") || "";
  const currentBrand = searchParams.get("brand_id") || "";
  const currentPriceMin = searchParams.get("price_min") || "";
  const currentPriceMax = searchParams.get("price_max") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("sort", "newest");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="text-xs text-slate-400 flex items-center gap-1.5">
            <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
            <span>/</span>
            <span className="text-slate-700 font-medium">Sản phẩm</span>
          </nav>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <FilterSidebar
              search={currentSearch}
              sort={currentSort}
              categoryId={currentCategory}
              brandId={currentBrand}
              priceMin={currentPriceMin}
              priceMax={currentPriceMax}
              categories={categories}
              brands={brands}
              onSearchChange={(val) => setFilter("search", val)}
              onSortChange={(val) => setFilter("sort", val)}
              onCategoryChange={(val) => setFilter("category_id", val)}
              onBrandChange={(val) => setFilter("brand_id", val)}
              onPriceMinChange={(val) => setFilter("price_min", val)}
              onPriceMaxChange={(val) => setFilter("price_max", val)}
              onClear={clearAllFilters}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-semibold text-slate-700">{products.length}</span> /{" "}
                <span className="font-semibold text-slate-700">{pagination.totalItems || 0}</span> sản phẩm
              </p>
              {/* Mobile filter toggle */}
              <button
                onClick={() => document.getElementById("mobile-filters")?.classList.toggle("hidden")}
                className="lg:hidden text-xs font-bold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
              >
                Bộ lọc
              </button>
            </div>

            {/* Mobile filters */}
            <div id="mobile-filters" className="hidden mb-4 lg:hidden">
              <FilterSidebar
                search={currentSearch}
                sort={currentSort}
                categoryId={currentCategory}
                brandId={currentBrand}
                priceMin={currentPriceMin}
                priceMax={currentPriceMax}
                categories={categories}
                brands={brands}
                onSearchChange={(val) => setFilter("search", val)}
                onSortChange={(val) => setFilter("sort", val)}
                onCategoryChange={(val) => setFilter("category_id", val)}
                onBrandChange={(val) => setFilter("brand_id", val)}
                onPriceMinChange={(val) => setFilter("price_min", val)}
                onPriceMaxChange={(val) => setFilter("price_max", val)}
                onClear={clearAllFilters}
              />
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
                <p className="text-slate-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  totalPages={pagination.totalPages}
                  currentPage={pagination.currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
```

- [ ] **Step 4: Commit**

```bash
git add client/src/loaders/web/productsLoader.js client/src/pages/Products/
git commit -m "feat(client): add Products page with FilterSidebar and grid"
```

---

### Task 4: Frontend — Add /san-pham route

**Files:**
- Modify: `client/src/routes/webRoute.jsx`

- [ ] **Step 1: Add route entry**

In `client/src/routes/webRoute.jsx`:

Add import at top:
```js
import { productsLoader } from "./webLoader";
```

Add lazy import:
```js
const ProductsPage = lazy(() => import("@/pages/Products"));
```

Add route after the home route (`""`):
```js
{
  path: "san-pham",
  element: <ProductsPage />,
  loader: productsLoader,
},
```

Update the `webLoader` exports in the loader barrel file. If `client/src/routes/webLoader.jsx` is the barrel file, add:
```js
export { productsLoader } from "@/loaders/web/productsLoader";
```

- [ ] **Step 2: Commit**

```bash
git add client/src/routes/webRoute.jsx client/src/routes/webLoader.jsx
git commit -m "feat(client): add /san-pham route with lazy-loaded ProductsPage"
```

---

### Task 5: Frontend — Update SeeMore and Home components

**Files:**
- Modify: `client/src/components/ui/seeMore.jsx`
- Modify: `client/src/pages/Home/components/specialSale.jsx`
- Modify: `client/src/pages/Home/components/newArrivals.jsx`
- Modify: `client/src/pages/Home/components/productSection.jsx`

- [ ] **Step 1: Update SeeMore to accept `to` prop**

Replace `client/src/components/ui/seeMore.jsx`:

```jsx
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SeeMore = ({ onClick, to, label = "Xem thêm" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <div className="flex justify-center pt-6">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 rounded-lg px-5 py-2.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        {label}
        <ChevronRight size={15} />
      </button>
    </div>
  );
};

export default SeeMore;
```

- [ ] **Step 2: Update SpecialSale**

In `client/src/pages/Home/components/specialSale.jsx`, change:
```jsx
<SeeMore to="/san-pham?sort=best-selling" />
```

- [ ] **Step 3: Update NewArrivals**

In `client/src/pages/Home/components/newArrivals.jsx`, change:
```jsx
<SeeMore to="/san-pham?sort=newest" />
```

- [ ] **Step 4: Update ProductSection**

In `client/src/pages/Home/components/productSection.jsx`:
- Add import: `import { useNavigate } from "react-router-dom";`
- Add inside component: `const navigate = useNavigate();`
- Change "Xem tất cả" button:
```jsx
<button
  onClick={() => navigate(`/san-pham?category_id=${products[0]?.category?.id || ""}`)}
  className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors shrink-0"
>
  Xem tất cả <ChevronRight size={14} />
</button>
```
- Change SeeMore:
```jsx
<SeeMore to={`/san-pham?category_id=${products[0]?.category?.id || ""}`} />
```

- [ ] **Step 5: Run build to verify no errors**

```bash
npm run build --prefix client
```
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/ui/seeMore.jsx client/src/pages/Home/components/
git commit -m "feat(client): link SeeMore buttons to /san-pham with pre-filters"
```

---

### Task 6: Verify — Manual startup check

- [ ] **Step 1: Start backend and check API**

```bash
npm run dev --prefix server
```

Then test: `curl http://localhost:5000/api/v1/home/product/products?page=1&limit=3`
Expected: Returns JSON with products, pagination, categories, brands.

- [ ] **Step 2: Start frontend and check page**

```bash
npm run dev --prefix client
```

Navigate to `http://localhost:5173/san-pham` — verify page renders with grid + sidebar.
Navigate to home, click "Xem thêm" on any section — verify redirect with proper query params.
