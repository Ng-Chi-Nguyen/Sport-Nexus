# Giảm Giá Theo Hạng Thành Viên Trên Giá Sản Phẩm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Áp dụng `discount_percent` của hạng thành viên vào giá sản phẩm hiển thị phía khách (list/detail/cart) và tính lại chính xác phía server khi đặt hàng, chồng được với coupon + điểm.

**Architecture:** Client hiển thị giá hội viên (gạch giá gốc + giá đã giảm) qua hook `useMemberDiscount` + component `MemberPrice` dùng chung. Server `createOrder` tự tra hạng của `authUser`, tính `tierDiscount`, gộp với `couponDiscount` + `pointsDiscount`, và điều chỉnh `final_amount` theo độ lệch discount (giữ nguyên phí vận chuyển client gửi). Fix luôn bug hiện tại: khi có coupon, điểm thưởng bị rớt vì server ghi đè `discount_amount`/`final_amount` chỉ tính coupon.

**Tech Stack:** Express 5 + Prisma + Joi (server), React 19 + Vite + react-i18next + Tailwind (client), luồng checkout `client/src/pages/Checkout/index.jsx`.

---

## File Structure

**Backend (server/src):**
- `validators/customer/order.validator.js` — thêm `points_discount_amount` vào `createOrder`.
- `services/customer/order.service.js` — tính `tierDiscount` + gộp discount, fix bug điểm bị rớt.
- (Không đổi schema Prisma, không migration.)

**Frontend (client/src):**
- `utils/tierPrice.jsx` — hàm thuần `getMemberPrice(price, discountPercent)`.
- `hooks/useMemberDiscount.js` — lấy `discount_percent` của user (cache module-level theo user id).
- `components/ui/MemberPrice.jsx` — hiển thị giá hội viên (gạch + giá mới + label).
- `components/ui/card.jsx` (ProductCard), `pages/ProductDetail/components/ProductInfo.jsx`, `pages/Cart/components/CartItem.jsx`, `pages/Cart/components/CartSummary.jsx` — dùng MemberPrice.
- `pages/Checkout/index.jsx` — tính `tierDiscount`, thêm `points_discount_amount` vào payload.
- `pages/Checkout/components/OrderSummary.jsx` + `ConfirmModal.jsx` — dòng "Ưu đãi hội viên".
- `locales/vi/loyalty.json` + `locales/en/loyalty.json` — 2 key mới.

---

## Task 1: Backend — Validator thêm `points_discount_amount`

**Files:**
- Modify: `server/src/validators/customer/order.validator.js:4-46`

- [ ] **Step 1: Thêm field vào `createOrder` schema**

Sửa khối `createOrder: Joi.object({...})` — sau dòng `discount_amount: Joi.number().precision(2).default(0),` thêm:

```js
        discount_amount: Joi.number().precision(2).default(0),
        points_discount_amount: Joi.number().precision(2).min(0).default(0),
        final_amount: Joi.number().precision(2).min(0).required(),
```

- [ ] **Step 2: Syntax check**

Run: `node --check server/src/validators/customer/order.validator.js`
Expected: không có output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add server/src/validators/customer/order.validator.js
git commit -m "feat(loyalty): add points_discount_amount to createOrder schema"
```

---

## Task 2: Backend — Tính `tierDiscount` và gộp discount trong `createOrder`

**Files:**
- Modify: `server/src/services/customer/order.service.js:9-91`

**Bối cảnh:** `createOrder(orderData, authUser)` destructure `discount_amount, final_amount` từ client. Khi có coupon, khối dòng 42-91 ghi đè `discount_amount = computeCouponDiscount(...)` và `final_amount = total_amount - discount_amount` — làm rớt điểm thưởng và phí vận chuyển. Ta thay bằng cách tính gộp 3 nguồn và điều chỉnh theo độ lệch so với giá trị client gửi.

- [ ] **Step 1: Destructure thêm `points_discount_amount` và chốt `clientDiscountAmount`**

Sửa đầu hàm (dòng 10-12):

```js
        let { total_amount, status, shipping_address, payment_method,
            payment_status, discount_amount, final_amount, coupon_code, user_email, items,
            shipping_name, shipping_phone, province_name, ward_name, weight_grams, service_type,
            points_discount_amount } = orderData;

        const clientDiscountAmount = Number(discount_amount) || 0;
        const clientFinalAmount = Number(final_amount) || 0;
        let couponDiscount = 0;
```

- [ ] **Step 2: Tính `tierDiscount` từ `authUser` (trước `$transaction`)**

Chèn sau dòng `for (const item of items) {...}` (khối kiểm tra stock kết thúc dòng 30):

```js
        // Giảm giá theo hạng thành viên — chỉ áp dụng khi đơn do chính khách đặt
        let tierDiscount = 0;
        if (authUser?.id) {
            try {
                const membership = await loyaltyService.getUserMembership(authUser.id);
                const pct = membership?.tier?.discount_percent || 0;
                tierDiscount = Math.round((Number(total_amount) * pct) / 100);
            } catch {
                tierDiscount = 0;
            }
        }
```

- [ ] **Step 3: Thay 2 dòng ghi đè trong khối coupon**

Tại dòng 74-75, thay:

```js
                discount_amount = computeCouponDiscount(coupon, Number(total_amount));
                final_amount = Number(total_amount) - discount_amount;
```

bằng:

```js
                couponDiscount = computeCouponDiscount(coupon, Number(total_amount));
```

- [ ] **Step 4: Tính gộp discount sau khối coupon**

Chèn ngay sau khối đóng `}` của `if (coupon_code)` (trước dòng `const orderEmail = ...`, hiện dòng 91):

```js
            const pointsDiscount = Number(points_discount_amount) || 0;
            discount_amount = couponDiscount + tierDiscount + pointsDiscount;
            final_amount =
                Math.round((clientFinalAmount - (discount_amount - clientDiscountAmount)) * 100) / 100;
```

- [ ] **Step 5: Syntax check**

Run: `node --check server/src/services/customer/order.service.js`
Expected: không có output, exit code 0.

- [ ] **Step 6: Restart server thủ công (không hot-reload)**

Server đang chạy `node src/index.js` (không nodemon). Kill process cũ rồi khởi động lại:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force
Start-Process node -ArgumentList "src/index.js" -WorkingDirectory "D:\Programming\SportNexus\server" -RedirectStandardOutput "C:\Users\NGUYEN~1\AppData\Local\Temp\opencode\server-restart.log" -RedirectStandardError "C:\Users\NGUYEN~1\AppData\Local\Temp\opencode\server-restart.err.log" -WindowStyle Hidden
```

Verify: `Invoke-RestMethod http://localhost:8080/api/v1/health -Method Get` trả `{ success: true }`.

- [ ] **Step 7: Smoke test API tạo đơn không coupon/không hạng**

Dùng token của user thường. POST `/api/v1/customer/orders` với `total_amount: 100000`, `discount_amount: 0`, `points_discount_amount: 0`, `final_amount: 100000`, `items: [{product_variant_id: <id hợp lệ>, quantity: 1, price_at_purchase: 100000}]`.
Expected: response trả `discount_amount: 0`, `final_amount: 100000` (không đổi so với trước).

- [ ] **Step 8: Commit**

```bash
git add server/src/services/customer/order.service.js
git commit -m "feat(loyalty): compute tier discount in createOrder and fix points-drop bug"
```

---

## Task 3: Frontend — Util `getMemberPrice` và hook `useMemberDiscount`

**Files:**
- Create: `client/src/utils/tierPrice.jsx`
- Create: `client/src/hooks/useMemberDiscount.js`

- [ ] **Step 1: Tạo util**

`client/src/utils/tierPrice.jsx`:

```jsx
export const getMemberPrice = (price, discountPercent = 0) => {
  if (!discountPercent) return Number(price);
  return Math.round(Number(price) * (1 - discountPercent / 100));
};
```

- [ ] **Step 2: Tạo hook**

`client/src/hooks/useMemberDiscount.js`:

```jsx
import { useEffect, useState } from "react";
import loyaltyApi from "@/api/customer/loyaltyApi";

let cache = { userId: null, percent: 0 };

const useMemberDiscount = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [percent, setPercent] = useState(
    user?.id && cache.userId === user.id ? cache.percent : 0,
  );

  useEffect(() => {
    if (!user?.id) return;
    if (cache.userId === user.id) {
      setPercent(cache.percent);
      return;
    }
    let alive = true;
    loyaltyApi
      .getMembership()
      .then((res) => {
        const pct = Number(res?.data?.tier?.discount_percent) || 0;
        cache = { userId: user.id, percent: pct };
        if (alive) setPercent(pct);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return percent;
};

export default useMemberDiscount;
```

- [ ] **Step 3: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors (hoặc chỉ còn warning có sẵn của repo).

- [ ] **Step 4: Commit**

```bash
git add client/src/utils/tierPrice.jsx client/src/hooks/useMemberDiscount.js
git commit -m "feat(loyalty): add getMemberPrice util and useMemberDiscount hook"
```

---

## Task 4: Frontend — Component `MemberPrice` + locale keys

**Files:**
- Create: `client/src/components/ui/MemberPrice.jsx`
- Modify: `client/src/locales/vi/loyalty.json:25`
- Modify: `client/src/locales/en/loyalty.json:25`

- [ ] **Step 1: Tạo component**

`client/src/components/ui/MemberPrice.jsx`:

```jsx
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatters";
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";

const MemberPrice = ({
  price,
  discountPercent,
  memberClassName = "",
  originalClassName = "text-slate-400 dark:text-slate-500",
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const hookPercent = useMemberDiscount();
  const pct = discountPercent ?? hookPercent;
  const memberPrice = getMemberPrice(price, pct);

  if (pct <= 0 || memberPrice >= Number(price)) {
    return <span>{formatCurrency(price)}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`text-xs line-through ${originalClassName}`}>
        {formatCurrency(price)}
      </span>
      <span className={`font-bold text-primary ${memberClassName}`}>
        {formatCurrency(memberPrice)}
      </span>
      {showLabel && (
        <span className="text-[10px] font-semibold text-primary/80">
          {t("loyalty.member_price_label")}
        </span>
      )}
    </span>
  );
};

export default MemberPrice;
```

- [ ] **Step 2: Thêm key locale**

`client/src/locales/vi/loyalty.json` — sau dòng `"membership": "Thành viên"` thêm:

```json
  "member_price_label": "Giá hội viên",
  "member_discount_label": "Ưu đãi hội viên (-{{percent}}%)"
```

`client/src/locales/en/loyalty.json` — sau dòng `"membership": "Membership"` thêm:

```json
  "member_price_label": "Member price",
  "member_discount_label": "Member discount (-{{percent}}%)"
```

- [ ] **Step 3: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ui/MemberPrice.jsx client/src/locales/vi/loyalty.json client/src/locales/en/loyalty.json
git commit -m "feat(loyalty): add MemberPrice component with locale keys"
```

---

## Task 5: Frontend — Áp dụng `MemberPrice` vào ProductCard

**Files:**
- Modify: `client/src/components/ui/card.jsx:207-216`

- [ ] **Step 1: Import**

Thêm vào dòng 3 (sau import `formatCurrency`):

```jsx
import MemberPrice from "./MemberPrice";
```

- [ ] **Step 2: Thay khối giá**

Thay khối:

```jsx
        <div className="pt-1 mt-auto flex items-center gap-2 flex-wrap">
          <p className="text-[15px] md:text-[16px] font-bold text-red-600 dark:text-red-500">
            {formatCurrency(salePrice)}
          </p>
          {hasDiscount && (
            <p className="text-[12px] md:text-[13px] text-slate-400 dark:text-slate-500 line-through">
              {formatCurrency(originalPrice)}
            </p>
          )}
        </div>
```

bằng:

```jsx
        <div className="pt-1 mt-auto flex items-center gap-2 flex-wrap">
          <MemberPrice
            price={salePrice}
            memberClassName="text-[15px] md:text-[16px] text-red-600 dark:text-red-500"
            originalClassName="text-[12px] md:text-[13px] text-slate-400 dark:text-slate-500"
            showLabel={false}
          />
          {hasDiscount && (
            <p className="text-[12px] md:text-[13px] text-slate-400 dark:text-slate-500 line-through">
              {formatCurrency(originalPrice)}
            </p>
          )}
        </div>
```

- [ ] **Step 3: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ui/card.jsx
git commit -m "feat(loyalty): show member price on product card"
```

---

## Task 6: Frontend — Áp dụng `MemberPrice` vào ProductInfo

**Files:**
- Modify: `client/src/pages/ProductDetail/components/ProductInfo.jsx:1-3, 108-121`

- [ ] **Step 1: Import**

Thêm vào sau import `formatCurrency` (dòng 2):

```jsx
import MemberPrice from "@/components/ui/MemberPrice";
```

- [ ] **Step 2: Thay khối giá**

Thay:

```jsx
          <p className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatCurrency(currentPrice)}
          </p>
```

bằng:

```jsx
          <MemberPrice
            price={currentPrice}
            memberClassName="text-2xl md:text-3xl text-rose-600 dark:text-rose-400"
            originalClassName="text-sm md:text-base text-slate-400 dark:text-slate-500"
            showLabel={false}
          />
```

- [ ] **Step 3: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/ProductDetail/components/ProductInfo.jsx
git commit -m "feat(loyalty): show member price on product detail"
```

---

## Task 7: Frontend — Áp dụng vào giỏ hàng (CartItem + CartSummary)

**Files:**
- Modify: `client/src/pages/Cart/components/CartItem.jsx:3, 18-19, 71-73, 106-110`
- Modify: `client/src/pages/Cart/components/CartSummary.jsx:1-7, 20-26`

- [ ] **Step 1: CartItem — import**

Thêm sau import `formatCurrency` (dòng 3):

```jsx
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";
```

- [ ] **Step 2: CartItem — tính memberPrice**

Trong body component, sau `const price = ...` (dòng 18-19):

```jsx
  const memberPercent = useMemberDiscount();
  const memberPrice = getMemberPrice(price, memberPercent);
  const subtotal = memberPrice * item.quantity;
```

Xoá dòng cũ `const subtotal = price * item.quantity;`.

- [ ] **Step 3: CartItem — hiển thị đơn giá theo hạng**

Thay khối (dòng 71-73):

```jsx
          <div className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(price)}
          </div>
```

bằng:

```jsx
          <div className="mt-1 text-xs sm:text-sm">
            {memberPercent > 0 && memberPrice < Number(price) ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 line-through mr-1">
                  {formatCurrency(price)}
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(memberPrice)}
                </span>
              </>
            ) : (
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(price)}
              </span>
            )}
          </div>
```

(Thành tiền cột phải dòng 106-110 đã dùng `subtotal` = memberPrice × qty, giữ nguyên.)

- [ ] **Step 4: CartSummary — import + tính member subtotal**

Thêm import:

```jsx
import { getMemberPrice } from "@/utils/tierPrice";
import useMemberDiscount from "@/hooks/useMemberDiscount";
```

Trong body, sau khai báo hook `useCoupon` (dòng 10-18), thêm:

```jsx
  const memberPercent = useMemberDiscount();
  const memberSubtotal = selectedItems.reduce((s, i) => {
    const price = i.variant?.price || i.product?.base_price || 0;
    return s + getMemberPrice(price, memberPercent) * i.quantity;
  }, 0);
  const memberDiscount = subtotal - memberSubtotal;
```

(sau khi đã có `subtotal` từ dòng 20-23; đặt đoạn member ở dưới `subtotal`.)

- [ ] **Step 5: CartSummary — hiển thị dòng ưu đãi + total**

Sau khối `{discount > 0 && (...)}` (dòng 52-57), chèn:

```jsx
        {memberDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>
              {t("loyalty.member_discount_label", {
                percent: memberPercent,
              })}
            </span>
            <span>-{formatCurrency(memberDiscount)}</span>
          </div>
        )}
```

Và sửa dòng total (dòng 67):

```jsx
            {formatCurrency(finalAmount - memberDiscount + shipping)}
```

- [ ] **Step 6: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/Cart/components/CartItem.jsx client/src/pages/Cart/components/CartSummary.jsx
git commit -m "feat(loyalty): apply member price in cart"
```

---

## Task 8: Frontend — Checkout tính `tierDiscount` + payload `points_discount_amount`

**Files:**
- Modify: `client/src/pages/Checkout/index.jsx:11, 58, 145-146, 186-206`

- [ ] **Step 1: Import**

Thêm vào dòng 11 (sau `import loyaltyApi ...`):

```jsx
import useMemberDiscount from "@/hooks/useMemberDiscount";
```

- [ ] **Step 2: Khai báo discountPercent**

Trong body, sau `const [pointsLoading, setPointsLoading] = useState(false);` (dòng 59):

```jsx
  const memberPercent = useMemberDiscount();
```

- [ ] **Step 3: Tính tierDiscount và finalAmount**

Thay (dòng 145-146):

```jsx
  const discount = couponData?.discount ?? 0;
  const finalAmount = (couponData?.newAmount ?? totalAmount) - pointsDiscount;
```

bằng:

```jsx
  const discount = couponData?.discount ?? 0;
  const tierDiscount = Math.round((totalAmount * memberPercent) / 100);
  const finalAmount =
    (couponData?.newAmount ?? totalAmount) - tierDiscount - pointsDiscount;
```

- [ ] **Step 4: Cập nhật payload**

Trong `orderPayload` (dòng 186-206), thay dòng `discount_amount: discount + pointsDiscount,` bằng:

```jsx
      discount_amount: discount + tierDiscount + pointsDiscount,
      points_discount_amount: pointsDiscount,
```

Thêm `tierDiscount, memberPercent` vào mảng dependency của `useMemo` (dòng 207-222) — thêm `tierDiscount,` và `memberPercent,`.

- [ ] **Step 5: Truyền props xuống OrderSummary và ConfirmModal**

Tại `OrderSummary` (dòng 337-362), thêm 2 props:

```jsx
              tierDiscount={tierDiscount}
              tierPercent={memberPercent}
```

Tại `ConfirmModal` (dòng 366-382), trong `data={{...}}` thêm:

```jsx
          tierDiscount,
          tierPercent: memberPercent,
```

- [ ] **Step 6: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/Checkout/index.jsx
git commit -m "feat(loyalty): compute tier discount in checkout payload"
```

---

## Task 9: Frontend — Hiển thị "Ưu đãi hội viên" trong OrderSummary + ConfirmModal

**Files:**
- Modify: `client/src/pages/Checkout/components/OrderSummary.jsx:10-33, 87-92`
- Modify: `client/src/pages/Checkout/components/ConfirmModal.jsx:10-20, 110-115`

- [ ] **Step 1: OrderSummary — thêm props**

Trong destructuring (dòng 10-33), thêm:

```jsx
  tierDiscount = 0,
  tierPercent = 0,
```

- [ ] **Step 2: OrderSummary — hiển thị dòng ưu đãi**

Sau khối `{pointsDiscount > 0 && (...)}` (dòng 87-92), chèn:

```jsx
        {tierDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>
              {t("loyalty.member_discount_label", { percent: tierPercent })}
            </span>
            <span>-{formatCurrency(tierDiscount)}</span>
          </div>
        )}
```

- [ ] **Step 3: ConfirmModal — hiển thị dòng ưu đãi**

Trong destructuring `data` (dòng 10-20), thêm `tierDiscount` và `tierPercent`:

```jsx
    tierDiscount,
    tierPercent = 0,
```

Sau khối `{discount > 0 && (...)}` (dòng 110-115), chèn:

```jsx
            {tierDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  {t("loyalty.member_discount_label", { percent: tierPercent })}
                </span>
                <span>-{formatCurrency(tierDiscount)}</span>
              </div>
            )}
```

- [ ] **Step 4: Lint**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Checkout/components/OrderSummary.jsx client/src/pages/Checkout/components/ConfirmModal.jsx
git commit -m "feat(loyalty): show member discount row in checkout summary"
```

---

## Task 10: Verification tổng hợp + sửa key trong ConfirmModal nếu cần

**Files:**
- Verify toàn bộ.

- [ ] **Step 1: Lint toàn bộ client**

Run: `rtk npm run lint --prefix client`
Expected: 0 errors.

- [ ] **Step 2: Build client**

Run: `rtk npm run build --prefix client`
Expected: build success (chỉ còn warning chunk size > 500kB có sẵn).

- [ ] **Step 3: Syntax check toàn bộ file server đụng tới**

Run:
```
node --check server/src/services/customer/order.service.js
node --check server/src/validators/customer/order.validator.js
node --check server/src/services/customer/loyalty.service.js
```
Expected: không output, exit 0.

- [ ] **Step 4: Smoke test thủ công luồng đặt hàng**

1. Đăng nhập user có hạng Vàng (reward_rate 0.02, discount_percent 5) → mở trang chủ, kiểm tra card sản phẩm hiện giá gạch + giá hội viên.
2. Vào chi tiết sản phẩm → giá hội viên hiển thị.
3. Thêm giỏ → giỏ hàng hiện đơn giá + tổng theo giá hội viên.
4. Checkout → OrderSummary và ConfirmModal có dòng "Ưu đãi hội viên (-5%)".
5. Đặt hàng → kiểm tra response `discount_amount` = coupon + tier + points, `final_amount` đúng.
6. Lặp lại với user vãng lai (không đăng nhập) → giá gốc, không có dòng ưu đãi.

- [ ] **Step 5: Commit nếu có thay đổi phát sinh**

```bash
git add -A
git commit -m "chore: verify tier discount implementation"
```

---

## Self-Review

**Spec coverage:**
- Backend tính `tierDiscount` server-side + gộp coupon/điểm + fix bug điểm rớt → Task 2 ✓
- `points_discount_amount` trong schema/payload → Task 1, Task 8 ✓
- Frontend hiển thị giá theo hạng ở list/detail/cart/checkout → Task 5, 6, 7, 9 ✓
- Gạch giá gốc + giá hội viên + label → Task 4 ✓
- Khách vãng lai giá gốc → `useMemberDiscount` trả 0 khi không user, `MemberPrice` trả nguyên giá ✓
- Admin tạo đơn không giảm → `tierDiscount` chỉ tính khi `authUser?.id`; admin không có tier → 0 ✓
- Chồng coupon + điểm + hạng → Task 2, Task 8 ✓
- `awardPoints`/`total_spent` theo `final_amount` → không đổi (final_amount giờ đã trừ tier) ✓

**Placeholder scan:** Không có TBD/TODO. Code đầy đủ trong từng bước.

**Type consistency:** `getMemberPrice(price, pct)` dùng chung; `tierDiscount`, `memberPercent`, `points_discount_amount`, `pointsDiscount` nhất quán giữa các task; props OrderSummary `tierDiscount`/`tierPercent`, ConfirmModal chỉ `tierDiscount`.
