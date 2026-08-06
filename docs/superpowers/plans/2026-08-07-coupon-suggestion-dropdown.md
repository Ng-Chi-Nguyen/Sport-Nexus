# Coupon Suggestion Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị dropdown gợi ý mã giảm giá (mã đã lưu + mã được tặng) trong ô nhập mã giảm giá dùng chung cho trang Checkout và ProductDetail.

**Architecture:** Tạo hook `useCouponSuggestions` gộp 2 nguồn mã (saved qua `webCouponApi.getCouponsByCodes`, gifted qua `customerCouponApi.getGifted`) dùng TanStack Query. Sửa `CouponInput.jsx` để hiện dropdown khi focus, lọc theo chuỗi gõ, và bấm chọn sẽ điền mã + tự áp dụng qua contract mới `onApply(code)`.

**Tech Stack:** React 19, TanStack Query, Tailwind CSS, lucide-react.

**Spec:** `docs/superpowers/specs/2026-08-07-coupon-suggestion-dropdown-design.md`

---

## File Structure

- Create: `client/src/hooks/useCouponSuggestions.js` — gộp + dedupe mã đề xuất từ 2 API.
- Modify: `client/src/pages/ProductDetail/components/CouponInput.jsx` — thêm dropdown, filter, focus/blur handling, gọi `onApply(code)`.
- Modify: `client/src/pages/Checkout/components/OrderSummary.jsx` — dùng `useCouponSuggestions`, truyền `suggestions` xuống `CouponInput`.
- Modify: `client/src/pages/ProductDetail/index.jsx` — dùng `useCouponSuggestions`, truyền props, sửa `onApply` nhận tham số `code`.
- Modify: `client/src/pages/Checkout/index.jsx` — sửa `onApplyCoupon` nhận tham số `code`.

Note: `CouponInput` có thể render trực tiếp dropdown mà không cần props từ cha (vì `useCoupons` là context toàn app), nhưng để giữ `CouponInput` presentational, hook được gọi ở cha và truyền xuống. Điều này cũng cho phép `OrderSummary` và `ProductDetail` dùng chung cách truyền dữ liệu.

---

### Task 1: Tạo hook `useCouponSuggestions`

**Files:**
- Create: `client/src/hooks/useCouponSuggestions.js`

- [ ] **Step 1: Viết hook**

```js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCoupons } from "@/contexts/CouponContext";
import webCouponApi from "@/api/web/couponApi";
import customerCouponApi from "@/api/customer/couponApi";

const useCouponSuggestions = () => {
  const { savedCodes } = useCoupons();
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-coupons", savedCodes.join(",")],
    queryFn: () => webCouponApi.getCouponsByCodes(savedCodes),
    enabled: savedCodes.length > 0,
  });

  const { data: giftedData, isLoading: giftedLoading } = useQuery({
    queryKey: ["gifted-coupons"],
    queryFn: () => customerCouponApi.getGifted(),
    enabled: isLoggedIn,
  });

  const suggestions = useMemo(() => {
    const map = new Map();
    const saved = savedData?.success ? savedData.data.coupons : [];
    const gifted = giftedData?.success ? giftedData.data.coupons : [];
    [...saved, ...gifted].forEach((c) => {
      if (c?.code) map.set(c.code, c);
    });
    return Array.from(map.values());
  }, [savedData, giftedData]);

  return {
    suggestions,
    isLoading: savedLoading || giftedLoading,
  };
};

export default useCouponSuggestions;
```

- [ ] **Step 2: Kiểm tra cú pháp**

Run: `npm run lint --prefix client`
Expected: không có lỗi ESLint nào mới ở file này (file chưa được import nên có thể chưa được lint; lỗi nếu có là do cú pháp).

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useCouponSuggestions.js
git commit -m "feat(coupon): add useCouponSuggestions hook to merge saved and gifted coupons"
```

---

### Task 2: Sửa `CouponInput` để hiển thị dropdown

**Files:**
- Modify: `client/src/pages/ProductDetail/components/CouponInput.jsx`

- [ ] **Step 1: Sửa component** — thay toàn bộ nội dung bằng:

```jsx
import { useRef, useState, useEffect, useMemo } from "react";
import { Tag, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const CouponInput = ({
  couponCode,
  onCodeChange,
  onApply,
  onClear,
  message,
  loading,
  discount,
  oldAmount,
  newAmount,
  suggestions = [],
  suggestionsLoading = false,
}) => {
  const hasCouponApplied = discount !== null && discount !== undefined;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((c) =>
      String(c.code || "").toLowerCase().includes(q),
    );
  }, [suggestions, query]);

  const handleSelect = (code) => {
    if (hasCouponApplied) return;
    setQuery("");
    setOpen(false);
    onCodeChange(code);
    onApply(code);
  };

  const showDropdown = open && !hasCouponApplied && filtered.length > 0;

  return (
    <div ref={containerRef} className="py-2 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              if (hasCouponApplied) return;
              onCodeChange(e.target.value);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (!hasCouponApplied) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !hasCouponApplied) onApply(couponCode);
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Nhập mã giảm giá"
            disabled={hasCouponApplied}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 transition-colors duration-200"
          />
          <ChevronDown
            size={16}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
          {showDropdown && (
            <ul className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg">
              {suggestionsLoading && (
                <li className="px-3.5 py-2.5 text-xs text-slate-400 dark:text-slate-500">
                  Đang tải danh sách mã...
                </li>
              )}
              {!suggestionsLoading &&
                filtered.map((coupon) => (
                  <li
                    key={coupon.code}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(coupon.code);
                    }}
                    className="px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{coupon.code}</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                        {coupon.discount_type === "PERCENTAGE"
                          ? `Giảm ${coupon.discount_value}%`
                          : formatCurrency(coupon.discount_value)}
                      </span>
                    </div>
                    {coupon.min_order_value > 0 && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Đơn tối thiểu {formatCurrency(coupon.min_order_value)}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {hasCouponApplied ? (
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            Huỷ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onApply(couponCode)}
            disabled={loading || !couponCode.trim()}
            className="px-4 py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-sm"
          >
            {loading ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        )}
      </div>

      {hasCouponApplied && (
        <div className="mt-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-1.5 transition-colors duration-200">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle size={16} />
            <span>
              Đã áp dụng mã{" "}
              <strong className="font-semibold">{couponCode}</strong>
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-6">
            <p>
              Giá gốc:{" "}
              <span className="line-through text-slate-400 dark:text-slate-500">
                {formatCurrency(oldAmount)}
              </span>
            </p>
            <p>
              Giá sau giảm:{" "}
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {formatCurrency(newAmount)}
              </span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Tiết kiệm: {formatCurrency(discount)}
            </p>
          </div>
        </div>
      )}

      {!hasCouponApplied && message && (
        <p
          className={`mt-2 text-xs flex items-center gap-1.5 ${message.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
        >
          {message.type === "error" && <XCircle size={14} />}
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
```

Lưu ý: các `formatCurrency` gọi với giá trị có thể là `null`/`undefined`; `formatCurrency` phải xử lý được (kiểm tra trong Task 3; nếu chưa xử lý, gọi `formatCurrency(Number(x) || 0)`).

- [ ] **Step 2: Kiểm tra `formatCurrency`** — đọc `client/src/utils/formatters.js`, xác nhận `formatCurrency` xử lý `null`/`undefined`/`NaN` an toàn. Nếu không, trong file `CouponInput` dùng helper `const money = (v) => formatCurrency(Number(v) || 0);` và thay thế mọi `formatCurrency(...)` ở các chỗ có thể nhận giá trị rỗng.

- [ ] **Step 3: Kiểm tra lint**

Run: `npm run lint --prefix client`
Expected: không lỗi mới ở file này. Nếu có lỗi `formatCurrency` không dùng hoặc icon thừa, gỡ bỏ.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/ProductDetail/components/CouponInput.jsx
git commit -m "feat(coupon): add suggestion dropdown to CouponInput with autofill and auto-apply"
```

---

### Task 3: Nối hook vào Checkout

**Files:**
- Modify: `client/src/pages/Checkout/components/OrderSummary.jsx`
- Modify: `client/src/pages/Checkout/index.jsx`

- [ ] **Step 1: Sửa `OrderSummary`** — thêm import và props

Ở đầu file `client/src/pages/Checkout/components/OrderSummary.jsx`, thêm:

```js
import useCouponSuggestions from "@/hooks/useCouponSuggestions";
```

Trong component, trước `return`, thêm:

```js
const { suggestions } = useCouponSuggestions();
```

Truyền xuống `CouponInput` (thêm prop mới `suggestions`):

```jsx
<CouponInput
  couponCode={couponCode}
  onCodeChange={onCouponCodeChange}
  onApply={onApplyCoupon}
  onClear={onClearCoupon}
  message={couponMsg}
  loading={couponLoading}
  discount={couponData?.discount ?? null}
  oldAmount={couponData?.oldAmount ?? null}
  newAmount={couponData?.newAmount ?? null}
  suggestions={suggestions}
/>
```

- [ ] **Step 2: Sửa `Checkout/index.jsx`** — thay đổi contract `onApplyCoupon`

Trong `client/src/pages/Checkout/index.jsx`, đổi prop:

```jsx
onApplyCoupon={() => applyCoupon(totalAmount, couponCode)}
```

thành:

```jsx
onApplyCoupon={(code) => applyCoupon(totalAmount, code || couponCode)}
```

- [ ] **Step 3: Kiểm tra build + lint**

Run: `npm run build --prefix client`
Expected: build thành công, không có lỗi import.

Run: `npm run lint --prefix client`
Expected: không có lỗi ESLint mới.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Checkout/components/OrderSummary.jsx client/src/pages/Checkout/index.jsx
git commit -m "feat(coupon): wire coupon suggestions dropdown into Checkout page"
```

---

### Task 4: Nối hook vào ProductDetail

**Files:**
- Modify: `client/src/pages/ProductDetail/index.jsx`

- [ ] **Step 1: Sửa import** — thêm dòng import sau các import hiện có:

```js
import useCouponSuggestions from "@/hooks/useCouponSuggestions";
```

- [ ] **Step 2: Gọi hook trong component** — thêm dòng này vào trong component (chỗ khai báo các hook khác, ví dụ cạnh chỗ dùng `useCoupon` nếu có, hoặc trước `return`):

```js
const { suggestions } = useCouponSuggestions();
```

- [ ] **Step 3: Sửa block `CouponInput`** — thay khối hiện tại (dòng ~249-260) bằng:

```jsx
<CouponInput
  couponCode={couponCode}
  onCodeChange={setCouponCode}
  onApply={(code) => {
    const c = code || couponCode;
    if (!c.trim()) return;
    setCouponMsg({
      type: "success",
      text: "Mã giảm giá không hợp lệ (demo)",
    });
  }}
  message={couponMsg}
  suggestions={suggestions}
/>
```

- [ ] **Step 4: Kiểm tra build + lint**

Run: `npm run build --prefix client`
Expected: build thành công.

Run: `npm run lint --prefix client`
Expected: không có lỗi ESLint mới.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/ProductDetail/index.jsx
git commit -m "feat(coupon): wire coupon suggestions dropdown into ProductDetail page"
```

---

## Self-Review

**Spec coverage:**
- Dropdown hiện khi focus + lọc theo gõ → Task 2 (`CouponInput`).
- Nguồn mã đã lưu + mã được tặng, gộp + dedupe → Task 1 (`useCouponSuggestions`).
- Bấm chọn → điền + tự áp dụng → Task 2 `handleSelect` + contract `onApply(code)`.
- Chỉ hiện khi có mã, đóng khi bấm ngoài/Esc → Task 2.
- Cả Checkout lẫn ProductDetail → Task 3, 4.
- Kiểm chứng build + lint → mỗi task đều có bước chạy.

**Placeholder scan:** không có TBD/TODO; mọi bước đều có code/mô tả cụ thể.

**Type consistency:** `suggestions` là mảng coupon có field `code`, `discount_type`, `discount_value`, `min_order_value` — khớp với shape trả về từ `webCouponApi.getCouponsByCodes` và `customerCouponApi.getGifted` (trả thẳng `prisma.coupons`). `onApply(code)` được dùng nhất quán ở Task 2, 3, 4.

**Lưu ý triển khai thực tế:** trong quá trình thực thi, prop `suggestionsLoading` đã bị gỡ khỏi `CouponInput` (vì dòng loading là dead code — `showDropdown` yêu cầu `filtered.length > 0`). Các task 3/4 chỉ truyền `suggestions` xuống `CouponInput`.
