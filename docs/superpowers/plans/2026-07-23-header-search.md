# Header Search Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add functional product search to the header with autocomplete dropdown and dedicated search results page.

**Architecture:** Backend endpoint `GET /api/v1/home/product/search` serves both autocomplete (limit=5) and paginated full search (limit=12). Frontend `SearchBar` component handles debounced input + dropdown, and a new `Search` page at `/tim-kiem` shows paginated results.

**Tech Stack:** Express 5 + Prisma (backend), React 19 + React Router v7 + TanStack Query (frontend)

---

### Task 1: Backend — searchProducts service method

**Files:**

- Modify: `server/src/services/core/product.service.js` (add `searchProducts` after `getAllProduct`)

- [ ] **Add `searchProducts` method to productService**

Add after line 169 (after `getAllProduct`):

```js
searchProducts: async ({ q, limit = 12, page = 1 } = {}) => {
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * limit;
    const where = {
        deleted_at: ACTIVE,
        is_active: true,
    };
    if (q) where.name = { contains: q, mode: 'insensitive' };

    let [products, totalItems] = await Promise.all([
        prisma.Products.findMany({
            where,
            take: limit,
            skip,
            select: {
                id: true,
                name: true,
                slug: true,
                base_price: true,
                thumbnail: true,
                brand: { select: { name: true } },
            },
            orderBy: { id: 'desc' },
        }),
        prisma.Products.count({ where }),
    ]);

    return {
        products,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage,
            itemsPerPage: limit,
        },
    };
},
```

- [ ] **Verify syntax**

Run `node -e "require('./server/src/services/core/product.service.js')"` and check no parse errors (or just lint).

---

### Task 2: Backend — Search controller

**Files:**

- Modify: `server/src/controllers/web/product.controller.js`

- [ ] **Add `searchProducts` controller method**

Add before the closing `}` of the `productController` object:

```js
searchProducts: async (req, res) => {
    try {
        const q = req.query.q || '';
        const limit = parseInt(req.query.limit) || 12;
        const page = parseInt(req.query.page) || 1;

        if (!q.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm.',
            });
        }

        const result = await productService.searchProducts({ q: q.trim(), limit, page });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
},
```

- [ ] **Add import for the service** (already imported at top of file)

---

### Task 3: Backend — Search route

**Files:**

- Modify: `server/src/routes/web/product.route.js`

- [ ] **Add search route**

After line 8 (the slug route), add:

```js
    .get("/search", productController.searchProducts)
```

Final file should look like:

```js
import express from "express";
import productController from "../../controllers/web/product.controller.js";

const webProductRoute = express.Router();

webProductRoute
  .get("/search", productController.searchProducts)
  .get("/slug/:slug", productController.getProductBySlug);

export default webProductRoute;
```

---

### Task 4: Frontend — Search API client

**Files:**

- Create: `client/src/api/web/searchApi.jsx`

- [ ] **Create search API client**

```js
import axiosClient from "@/lib/axiosClient";

const searchApi = {
  searchProducts: ({ q, limit, page }) => {
    const url = "/home/product/search";
    return axiosClient.get(url, { params: { q, limit, page } });
  },
};

export default searchApi;
```

---

### Task 5: Frontend — SearchBar component

**Files:**

- Create: `client/src/components/search/SearchBar.jsx`

- [ ] **Create SearchBar component**

```jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import searchApi from "@/api/web/searchApi";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim()) {
      setSuggestions([]);
      setTotal(0);
      setIsOpen(false);
      return;
    }
    try {
      const res = await searchApi.searchProducts({ q: q.trim(), limit: 5 });
      if (res.success) {
        setSuggestions(res.data.products || []);
        setTotal(res.data.pagination?.totalItems || 0);
        setIsOpen(true);
      }
    } catch {
      // silent fail
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
  };

  const handleSubmit = (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setIsOpen(false);
    navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (slug) => {
    setIsOpen(false);
    navigate(`/san-pham/${slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx].slug);
      } else {
        handleSubmit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < suggestions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl hidden sm:block">
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length) setIsOpen(true);
          }}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full h-10 pl-10 pr-24 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        <button
          onClick={() => handleSubmit()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors duration-200"
        >
          Tìm kiếm
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((item, idx) => (
            <button
              key={item.id}
              onMouseDown={() => handleSelect(item.slug)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${idx === activeIdx ? "bg-primary/5" : "hover:bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Search size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.brand?.name && `${item.brand.name} · `}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.base_price)}
                </p>
              </div>
            </button>
          ))}
          <button
            onMouseDown={() => handleSubmit(query)}
            className="w-full px-4 py-3 text-sm font-medium text-primary border-t border-gray-100 hover:bg-primary/5 text-center"
          >
            Xem tất cả {total} kết quả
          </button>
        </div>
      )}

      {isOpen && query && suggestions.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-6 text-center text-sm text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default SearchBar;
```

---

### Task 6: Frontend — Integrate SearchBar into Header

**Files:**

- Modify: `client/src/components/header.jsx` (lines 39-54)

- [ ] **Replace static search HTML with SearchBar component**

Replace lines 39-54 (the `<div className="flex-1 max-w-2xl hidden sm:block">` block, lines 39-54):

```jsx
<SearchBar />
```

And add the import at the top:

```jsx
import SearchBar from "@/components/search/SearchBar";
```

Remove unused `Search` from lucide-react imports (still used elsewhere? Check — `Search` is currently imported at line 4 but only used in the search bar. After replacement, `Search` import can be removed if not used elsewhere. Actually `Search` is also used in other components potentially, so check the import: `import { LayoutDashboard, Menu, Search, Settings, ShoppingCart, User } from "lucide-react"` — after this change, `Search` is no longer used in header.jsx, so remove it from the import.)

---

### Task 7: Frontend — Search Results page

**Files:**

- Create: `client/src/pages/Search/index.jsx`
- Modify: `client/src/routes/webRoute.jsx` (add route)

- [ ] **Create Search page component**

```jsx
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import searchApi from "@/api/web/searchApi";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const ITEMS_PER_PAGE = 12;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, page],
    queryFn: () => searchApi.searchProducts({ q, limit: ITEMS_PER_PAGE, page }),
    enabled: !!q,
  });

  const products = data?.success ? data.data.products : [];
  const pagination = data?.success ? data.data.pagination : null;

  const handlePageChange = (newPage) => {
    setSearchParams({ q, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!q) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-5xl text-center py-20">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Tìm kiếm sản phẩm
          </h2>
          <p className="text-gray-500">
            Nhập từ khóa vào ô tìm kiếm phía trên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: `Tìm kiếm: "${q}"`, route: "" },
          ]}
        />

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-2">
          Kết quả tìm kiếm cho "{q}"
        </h1>
        {pagination && (
          <p className="text-sm text-gray-500 mb-6">
            {pagination.totalItems} kết quả
          </p>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-gray-500">
              Thử tìm kiếm với từ khóa khác bạn nhé.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/san-pham/${product.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Search size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {product.brand?.name}
                    </p>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.base_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-2 text-sm rounded-lg border ${p === page ? "bg-primary text-white border-primary" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
```

- [ ] **Add lazy route in webRoute.jsx**

Add import at top:

```jsx
const SearchPage = lazy(() => import("@/pages/Search"));
```

Add route object in the children array (after the product detail route, before the cart route):

```jsx
    {
        path: "tim-kiem",
        element: <SearchPage />,
    },
```

---

### Task 8: Cleanup old unused search component

**Files:**

- Delete: `client/src/components/search.jsx` (old `SearchHeader` component — check first if it's imported anywhere)

- [ ] **Check if `components/search.jsx` is imported anywhere**

Run: `rg "from.*components/search" --type jsx` or grep search.

If not used, delete the file: `Remove-Item -LiteralPath "client/src/components/search.jsx"`

---

### Task 9: Verify build

- [ ] **Build frontend**

Run: `npm run build --prefix client`
Expected: Build succeeds, no errors related to search components.

- [ ] **Lint frontend**

Run: `npm run lint --prefix client`
Expected: No new lint errors (pre-existing errors are OK).

- [ ] **Verify backend syntax**

Run: `node -e "require('./server/src/index.js')"` or at minimum check the controller and service files load without errors.
