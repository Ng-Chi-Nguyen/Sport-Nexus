# Trang Lịch Sử Tìm Kiếm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Commit policy:** Repo yêu cầu KHÔNG tự động commit. Chỉ commit khi người dùng yêu cầu rõ ràng. Các task dưới đây không có bước commit.

**Goal:** Tạo trang `/lich-su-tim-kiem` hiển thị lịch sử tìm kiếm nhóm theo thời gian + phần gợi ý sản phẩm "Có thể bạn quan tâm" tổng hợp từ 3 từ khóa gần nhất.

**Architecture:** Nâng cấp `lib/searchHistory.js` lưu `{ term, ts }` thay cho string (kèm migrate dữ liệu cũ), cập nhật `SearchBar.jsx` cho khớp schema mới, tạo trang `pages/searchHistory/index.jsx` (dùng `useQuery` gọi `searchApi.searchProducts` cho 3 từ khóa gần nhất, gộp dedupe), rồi đăng ký route trong `webRoute.jsx`.

**Tech Stack:** React 19, Vite, TanStack Query (`useQuery`), React Router, dayjs, lucide-react, Tailwind CSS.

**Nguồn cần đọc trước khi bắt đầu:**
- Spec: `docs/superpowers/specs/2026-07-31-search-history-page-design.md`
- Hiện tại: `client/src/lib/searchHistory.js`, `client/src/components/search/SearchBar.jsx`, `client/src/pages/Search/index.jsx` (pattern trang), `client/src/routes/webRoute.jsx`, `client/src/api/web/searchApi.jsx`, `client/src/components/ui/card.jsx` (ProductCard), `client/src/components/ui/loadingSpinner.jsx`, `client/src/components/ui/breadcrumbs.jsx`.

**Lưu ý:** Client KHÔNG có test runner (chỉ `build`/`lint`). Verify mỗi task bằng `npm run build --prefix client` + `npm run lint --prefix client` (chạy từ thư mục `D:\Programming\SportNexus`).

---

### Task 1: Nâng cấp `searchHistory.js` sang schema `{ term, ts }`

**Files:**
- Modify: `client/src/lib/searchHistory.js`

- [ ] **Step 1: Thay toàn bộ phần lưu trữ bằng code dưới đây**

Thay `read`/`write`/`getSearchHistory`/`addToSearchHistory`/`removeFromSearchHistory`/`clearSearchHistory` (giữ nguyên 3 hàm `recordLastSearchTerm`/`getLastSearchTerm`/`clearLastSearchTerm` ở cuối file):

```js
const STORAGE_KEY = "sportnexus_search_history";
const MAX_ITEMS = 10;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") return { term: item.trim(), ts: 0 };
        if (item && typeof item.term === "string") {
          return { term: item.term.trim(), ts: Number(item.ts) || 0 };
        }
        return null;
      })
      .filter((item) => item && item.term)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable (private mode / quota)
  }
};

export const getSearchHistory = () => read();

export const addToSearchHistory = (term) => {
  const q = (term || "").trim();
  if (!q) return;
  write([{ term: q, ts: Date.now() }, ...read().filter((item) => item.term !== q)]);
};

export const removeFromSearchHistory = (term) => {
  write(read().filter((item) => item.term !== term));
};

export const clearSearchHistory = () => {
  write([]);
};
```

- [ ] **Step 2: Verify build**

Run (từ `D:\Programming\SportNexus`): `npm run build --prefix client`
Expected: `✓ built in ...` — KHÔNG được có lỗi. (SearchBar chưa sửa sẽ không gây lỗi build vì vẫn đọc được `item.term` trên string chỉ là `undefined`, không crash build.)

- [ ] **Step 3: Verify lint**

Run: `npm run lint --prefix client`
Expected: vẫn là 58 problems (41 errors) như trước — không thêm lỗi mới ở `searchHistory.js`.

---

### Task 2: Cập nhật `SearchBar.jsx` cho khớp schema mới

**Files:**
- Modify: `client/src/components/search/SearchBar.jsx:178-200`

- [ ] **Step 1: Đổi block render lịch sử**

Thay đoạn `{history.map((term) => (...))}` (hiện dùng biến `term` là string) bằng:

```jsx
            {history.map((item) => (
              <div key={item.term} className="group flex items-center px-2 hover:bg-gray-50">
                <button
                  type="button"
                  onMouseDown={() => handleSubmit(item.term)}
                  className="flex-1 flex items-center gap-3 py-2.5 px-2 text-left outline-none focus:outline-none"
                >
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{item.term}</span>
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    removeFromSearchHistory(item.term);
                    setHistory(getSearchHistory());
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors outline-none focus:outline-none"
                  aria-label={`Xóa ${item.term} khỏi lịch sử`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
```

Không thay đổi import — `getSearchHistory`, `addToSearchHistory`, `removeFromSearchHistory`, `clearSearchHistory` vẫn được dùng như cũ.

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client`
Expected: `✓ built in ...`, không lỗi.

Run: `npm run lint --prefix client`
Expected: không có lỗi mới ở `SearchBar.jsx` (tổng vẫn 58 problems, 41 errors — riêng `header.jsx:27 isScrolled` là lỗi cũ có sẵn, không liên quan).

---

### Task 3: Tạo trang lịch sử tìm kiếm (phần danh sách + empty state)

**Files:**
- Create: `client/src/pages/searchHistory/index.jsx`

- [ ] **Step 1: Tạo file `client/src/pages/searchHistory/index.jsx` với code sau**

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, X } from "lucide-react";
import dayjs from "dayjs";
import {
  clearSearchHistory,
  getSearchHistory,
  removeFromSearchHistory,
} from "@/lib/searchHistory";
import Breadcrumbs from "@/components/ui/breadcrumbs";

const groupByTime = (items) => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");
  const groups = { today: [], yesterday: [], older: [] };
  items.forEach((item) => {
    const day = dayjs(item.ts).startOf("day");
    if (day.isSame(today)) groups.today.push(item);
    else if (day.isSame(yesterday)) groups.yesterday.push(item);
    else groups.older.push(item);
  });
  return groups;
};

const SearchHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getSearchHistory());

  const deleteTerm = (term) => {
    removeFromSearchHistory(term);
    setHistory(getSearchHistory());
  };

  const clearAll = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const groups = groupByTime(history);
  const groupRows = [
    { key: "today", label: "Hôm nay", items: groups.today },
    { key: "yesterday", label: "Hôm qua", items: groups.yesterday },
    { key: "older", label: "Trước đó", items: groups.older },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-5xl mt-6 md:mt-8 px-4">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Lịch sử tìm kiếm", route: "" },
          ]}
        />

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 mb-2">
          Lịch sử tìm kiếm
        </h1>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Chưa có lịch sử tìm kiếm
            </h2>
            <p className="text-gray-500">
              Dùng ô tìm kiếm phía trên để tìm sản phẩm, lịch sử sẽ được lưu lại đây.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {history.length} từ khóa đã tìm
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {groupRows.map((group) => (
              <div key={group.key} className="mb-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {group.label}
                </h2>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.term} className="group flex items-center">
                      <button
                        onClick={() => navigate(`/tim-kiem?q=${encodeURIComponent(item.term)}`)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Clock size={16} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-800">{item.term}</span>
                      </button>
                      <button
                        onClick={() => deleteTerm(item.term)}
                        className="p-2 mr-2 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label={`Xóa ${item.term} khỏi lịch sử`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryPage;
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --prefix client`
Expected: `✓ built in ...`, không lỗi.

Run: `npm run lint --prefix client`
Expected: không có lỗi mới ở `pages/searchHistory/index.jsx`.

---

### Task 4: Thêm phần "Có thể bạn quan tâm"

**Files:**
- Modify: `client/src/pages/searchHistory/index.jsx`

- [ ] **Step 1: Thêm import (đầu file)**

Thêm vào sau các import hiện có:

```jsx
import { useQuery } from "@tanstack/react-query";
import searchApi from "@/api/web/searchApi";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { ProductCard } from "@/components/ui/card";
```

- [ ] **Step 2: Thêm constants + hook query (đầu component)**

Trong `SearchHistoryPage`, sau `const [history, setHistory] = useState(...)`, thêm:

```jsx
  const terms = history.slice(0, 3).map((item) => item.term);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["search-history-suggestions", terms.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        terms.map((term) => searchApi.searchProducts({ q: term, limit: 4 })),
      );
      const seen = new Set();
      const products = [];
      results.forEach((res) => {
        if (!res?.data?.success) return;
        (res.data.data.products || []).forEach((p) => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            products.push(p);
          }
        });
      });
      return products.slice(0, 12);
    },
    enabled: terms.length > 0,
  });
```

- [ ] **Step 3: Render phần gợi ý (sau khối lịch sử, trước `</div>` đóng container)**

Chèn trước dòng đóng `</div>` của container `max-w-5xl` (sau khối `{history.length === 0 ? (...) : (...)}`):

```jsx
        {suggestions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
              Có thể bạn quan tâm
            </h2>
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {suggestions.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build --prefix client`
Expected: `✓ built in ...`, không lỗi.

Run: `npm run lint --prefix client`
Expected: không có lỗi mới (không dùng biến `isLoading` thừa — đã dùng trong JSX).

---

### Task 5: Đăng ký route `/lich-su-tim-kiem`

**Files:**
- Modify: `client/src/routes/webRoute.jsx`

- [ ] **Step 1: Thêm lazy import**

Sau dòng `const CouponsPage = lazy(() => import("@/pages/coupons"));` thêm:

```jsx
const SearchHistoryPage = lazy(() => import("@/pages/searchHistory"));
```

- [ ] **Step 2: Thay element placeholder**

Thay block:

```jsx
    {
      path: "lich-su-tim-kiem",
      element: <ProfilePlaceholder />,
    },
```

bằng:

```jsx
    {
      path: "lich-su-tim-kiem",
      element: <SearchHistoryPage />,
    },
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build --prefix client`
Expected: `✓ built in ...`, không lỗi.

Run: `npm run lint --prefix client`
Expected: không có lỗi mới.

---

### Task 6: Verify end-to-end bằng agent-browser

**Files:**
- (none — verification only)

- [ ] **Step 1: Ghi lịch sử qua SearchBar**

Với dev server đang chạy (`http://localhost:5173`), dùng agent-browser:
1. Mở `http://localhost:5173`, chờ network idle.
2. Tìm ô input search (placeholder "Tìm kiếm sản phẩm...") bằng eval: focus + set giá trị + submit qua sự kiện (hoặc dùng `agent-browser` tìm `input[placeholder^="Tìm kiếm"]`), lần lượt với 3 từ khóa (ví dụ "giày", "bóng", "vợt") và nhấn Enter/Tìm kiếm để điều hướng `/tim-kiem?q=...`. Sau mỗi lần chờ `networkidle`.

- [ ] **Step 2: Mở trang lịch sử**

Mở `http://localhost:5173/lich-su-tim-kiem`, chờ `networkidle`, chụp screenshot.

Expected:
- Nhóm "Hôm nay" chứa 3 từ khóa vừa tìm.
- Phần "Có thể bạn quan tâm" hiển thị grid sản phẩm (tối đa 12).

- [ ] **Step 3: Kiểm tra xóa từng mục và xóa tất cả**

- Bấm nút X của 1 từ khóa → từ đó biến mất, số "N từ khóa đã tìm" giảm.
- Bấm "Xóa tất cả" → empty state "Chưa có lịch sử tìm kiếm" hiển thị, phần gợi ý biến mất.

- [ ] **Step 4: Kiểm tra click từ khóa**

Sau khi tìm lại 1 từ khóa (để có lịch sử), bấm vào từ khóa → URL chuyển sang `/tim-kiem?q=<từ khóa>`.

---

## Self-Review Checklist

- **Spec coverage:** Toàn bộ spec — nâng cấp `searchHistory` (Task 1), SearchBar tương thích (Task 2), trang nhóm thời gian + empty state (Task 3), gợi ý 3 term gần nhất + ProductCard grid (Task 4), route (Task 5), xác thực (Task 6) — đều có task tương ứng.
- **Placeholder scan:** Không có TBD/TODO; mọi bước đều có code đầy đủ.
- **Type consistency:** `getSearchHistory()` trả `{ term, ts }[]` xuyên suốt; `addToSearchHistory(term)` nhận string; `removeFromSearchHistory(term)` nhận string; `searchApi.searchProducts({ q, limit })` khớp `searchApi.jsx`; `ProductCard` prop `product` + `key=id` khớp `pages/Search/index.jsx`.
- **Commit policy:** Không có bước commit tự động nào (theo yêu cầu repo).
