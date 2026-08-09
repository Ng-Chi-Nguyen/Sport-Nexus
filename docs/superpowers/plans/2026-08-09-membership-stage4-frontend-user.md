# #6 Tích điểm / Thành viên — Giai đoạn 4: Frontend người dùng

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị chương trình thành viên cho người dùng đã đăng nhập: khối hạng/điểm trong hồ sơ cá nhân & tổng quan tài khoản, badge ở header cạnh avatar, bảng đổi quà, lịch sử điểm, và ô dùng điểm quy đổi tiền tại checkout.

**Architecture:** Tạo `client/src/api/customer/loyaltyApi.js` gọi các endpoint `/customer/loyalty/*`. Tạo hook `useMembership` cung cấp dữ liệu hạng/điểm. Tạo component `MembershipBlock` tái dùng ở profile. Tạo `MembershipCard` cho header. Tạo `PointsInput` cho checkout. Mọi API qua `axiosClient` (interceptor trả `response.data`, tự gắn token). i18n thêm key `loyalty` vào `locales/{vi,en}`.

**Tech Stack:** React 19, React Router, TanStack Query (hoặc `useState`/`useEffect` như các component khác), `axiosClient`, `react-i18next`, `lucide-react`. Verify bằng `npm run build --prefix client` + `npm run lint --prefix client`.

---

### Task 1: Tạo API loyalty (customer)

**Files:**
- Create: `client/src/api/customer/loyaltyApi.js`

- [ ] **Step 1: Tạo file API**

Tạo `client/src/api/customer/loyaltyApi.js` (pattern theo `api/customer/reviewApi.js`):

```js
import axiosClient from "@/lib/axiosClient";

const loyaltyApi = {
  getMembership: () => axiosClient.get("/customer/loyalty/membership"),
  getRewards: () => axiosClient.get("/customer/loyalty/rewards"),
  getTransactions: () => axiosClient.get("/customer/loyalty/transactions"),
  redeemReward: (rewardId) =>
    axiosClient.post(`/customer/loyalty/rewards/${rewardId}/redeem`),
  applyPoints: (points) =>
    axiosClient.post("/customer/loyalty/apply-points", { points }),
};

export default loyaltyApi;
```

> Lưu ý: `axiosClient` interceptor trả `response.data` trực tiếp. Kết quả mỗi lời gọi là `{ success, data, message }`. Gọi `res.data` để lấy payload, không phải `res.data.data`.

- [ ] **Step 2: Commit**

```bash
git add client/src/api/customer/loyaltyApi.js
git commit -m "feat: loyalty customer api client"
```

---

### Task 2: Tạo hook useMembership

**Files:**
- Create: `client/src/hooks/useMembership.js`

- [ ] **Step 1: Tạo hook**

Tạo `client/src/hooks/useMembership.js`:

```js
import { useCallback, useEffect, useState } from "react";
import loyaltyApi from "@/api/customer/loyaltyApi";

const useMembership = () => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loyaltyApi.getMembership();
      setMembership(res?.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được thông tin thành viên");
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, loading, error, refresh: fetchMembership };
};

export default useMembership;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useMembership.js
git commit -m "feat: useMembership hook"
```

---

### Task 3: Component MembershipBlock (hiển thị hạng/điểm/tiến độ)

**Files:**
- Create: `client/src/components/customer/MembershipBlock.jsx`

- [ ] **Step 1: Tạo component**

Tạo `client/src/components/customer/MembershipBlock.jsx`:

```jsx
import { useTranslation } from "react-i18next";
import { Medal, Coins, TrendingUp, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import useMembership from "@/hooks/useMembership";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const MembershipBlock = () => {
  const { t } = useTranslation();
  const { membership, loading } = useMembership();

  if (loading) return <LoadingSpinner />;
  if (!membership) return null;

  const { tier, next_tier, points_balance, total_spent, progress, points_to_money_rate } = membership;
  const progressPct = Math.round((progress || 0) * 100);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Medal className="text-amber-500" size={28} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.tier")}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {tier?.name || t("loyalty.no_tier")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Coins className="text-amber-500" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.points")}
            </p>
            <p className="text-lg font-bold text-amber-600">
              {points_balance?.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShoppingCart className="text-sky-500" size={24} />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("loyalty.total_spent")}
            </p>
            <p className="text-lg font-bold text-sky-600">
              {formatCurrency(total_spent)}
            </p>
          </div>
        </div>
      </div>

      {next_tier && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{t("loyalty.progress_to", { tier: next_tier.name })}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {points_to_money_rate > 0 && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp size={12} className="inline mr-1" />
              {t("loyalty.rate_hint", { rate: points_to_money_rate })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipBlock;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/customer/MembershipBlock.jsx
git commit -m "feat: membership block component"
```

---

### Task 4: Gắn MembershipBlock vào hồ sơ cá nhân

**Files:**
- Modify: `client/src/pages/profile/profile.jsx`

- [ ] **Step 1: Import component**

Mở `client/src/pages/profile/profile.jsx`. Thêm import sau `TitleWithIcon` import (dòng 19):

```jsx
import MembershipBlock from "@/components/customer/MembershipBlock";
```

- [ ] **Step 2: Render MembershipBlock trong layout profile**

Trong JSX của component `Profile`, chèn `<MembershipBlock />` vào vị trí phù hợp (gần đầu nội dung, ví dụ ngay dưới header "Thông tin tài khoản"). Tìm chỗ render thông tin tài khoản và thêm vào trước các phần khác:

```jsx
<MembershipBlock />
```

(vị trí cụ thể tùy layout; đặt sau breadcrumb/trước phần chi tiết hồ sơ để hiển thị nổi bật.)

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/profile/profile.jsx
git commit -m "feat: show membership block on profile"
```

---

### Task 5: Gắn MembershipCard vào header

**Files:**
- Modify: `client/src/components/header.jsx`

- [ ] **Step 1: Thêm import**

Mở `client/src/components/header.jsx`. Thêm import `useMembership` và icon `Coins`:

```jsx
import { Coins } from "lucide-react";
import useMembership from "@/hooks/useMembership";
```

(icon `Coins` thêm vào danh sách import lucide ở đầu file.)

- [ ] **Step 2: Lấy dữ liệu membership**

Trong component `Header`, sau dòng khai báo `const user = ...` (dòng 34), thêm:

```jsx
const { membership } = useMembership();
```

- [ ] **Step 3: Hiển thị badge điểm cạnh avatar**

Trong block `user ? (...)` (dòng 93-120), bên trong `<div className="flex-col leading-tight hidden sm:flex">`, thêm dòng hiển thị hạng/điểm (sau span email, dòng 118):

```jsx
{membership?.tier && (
  <span className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1">
    <Coins size={10} />
    {membership.tier.name} · {membership.points_balance?.toLocaleString("vi-VN")}đ
  </span>
)}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/header.jsx
git commit -m "feat: show loyalty badge in header"
```

---

### Task 6: Trang thành viên (hạng, đổi quà, lịch sử điểm)

**Files:**
- Create: `client/src/pages/profile/loyalty.jsx`
- Modify: `client/src/routes/webRoute.jsx`

- [ ] **Step 1: Tạo trang loyalty**

Tạo `client/src/pages/profile/loyalty.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, History } from "lucide-react";
import loyaltyApi from "@/api/customer/loyaltyApi";
import MembershipBlock from "@/components/customer/MembershipBlock";
import ShowToast from "@/components/ui/toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { formatCurrency } from "@/utils/formatters";

const LoyaltyPage = () => {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, tr] = await Promise.all([
          loyaltyApi.getRewards(),
          loyaltyApi.getTransactions(),
        ]);
        setRewards(r?.data?.rewards ?? []);
        setTransactions(tr?.data?.transactions ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRedeem = async (reward) => {
    setRedeeming(reward.id);
    try {
      const res = await loyaltyApi.redeemReward(reward.id);
      ShowToast("success", res?.message || t("loyalty.redeem_success"));
      window.location.reload();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("loyalty.redeem_fail"));
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <MembershipBlock />

      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          <Gift size={18} className="text-amber-500" />
          {t("loyalty.rewards")}
        </h3>
        {rewards.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_rewards")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.point_cost?.toLocaleString("vi-VN")} {t("loyalty.points")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeem(r)}
                  disabled={redeeming === r.id}
                  className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                >
                  {redeeming === r.id ? t("loyalty.redeeming") : t("loyalty.redeem")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
          <History size={18} className="text-sky-500" />
          {t("loyalty.history")}
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("loyalty.no_history")}</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-3">{t("loyalty.date")}</th>
                  <th className="text-left p-3">{t("loyalty.type")}</th>
                  <th className="text-left p-3">{t("loyalty.note")}</th>
                  <th className="text-right p-3">{t("loyalty.points")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">{new Date(tx.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3">{tx.type}</td>
                    <td className="p-3">{tx.note || ""}</td>
                    <td className={`p-3 text-right ${tx.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.points > 0 ? "+" : ""}{tx.points?.toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default LoyaltyPage;
```

> Lưu ý: dùng `formatCurrency` ở imports nếu cần hiển thị tiền; trong file trên `formatCurrency` chưa dùng — nếu lint báo unused, bỏ dòng import.

- [ ] **Step 2: Gắn route**

Mở `client/src/routes/webRoute.jsx`. Thêm lazy import:

```jsx
const LoyaltyPage = lazy(() => import("@/pages/profile/loyalty"));
```

Thêm route con trong khối `/tai-khoan` (sau route `don-hang`, dòng 137):

```jsx
{ path: "thanh-vien", element: <LoyaltyPage /> },
```

- [ ] **Step 3: Thêm link vào sidebar profile**

Mở `client/src/pages/profile/index.jsx`. Thêm NavLink vào nav (sau link "Sổ địa chỉ" dòng 111):

```jsx
<div>
  <NavLink
    to="/tai-khoan/thanh-vien"
    className={({ isActive }) =>
      isActive
        ? "text-sky-600 dark:text-sky-400 font-bold block px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 transition-all"
        : "text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block px-3 py-2 rounded-xl"
    }
  >
    {tProfile("membership", "Thành viên")}
  </NavLink>
</div>
```

- [ ] **Step 4: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không có lỗi mới (chú ý unused import `formatCurrency`).

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/profile/loyalty.jsx client/src/routes/webRoute.jsx client/src/pages/profile/index.jsx
git commit -m "feat: loyalty member page (rewards, history)"
```

---

### Task 7: Dùng điểm tại checkout (PointsInput)

**Files:**
- Create: `client/src/pages/Checkout/components/PointsInput.jsx`
- Modify: `client/src/pages/Checkout/components/OrderSummary.jsx`

- [ ] **Step 1: Tạo component PointsInput**

Tạo `client/src/pages/Checkout/components/PointsInput.jsx`:

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import useMembership from "@/hooks/useMembership";

const PointsInput = ({ onApplyPoints, appliedDiscount, busy }) => {
  const { t } = useTranslation();
  const { membership } = useMembership();
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");

  const available = membership?.points_balance || 0;
  const rate = membership?.points_to_money_rate || 0;

  const handleApply = () => {
    const val = parseInt(points, 10);
    if (!val || val <= 0) { setError(t("loyalty.invalid_points")); return; }
    if (val > available) { setError(t("loyalty.points_exceed")); return; }
    setError("");
    onApplyPoints(val);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <Coins size={16} className="text-amber-500" />
        {t("loyalty.use_points", { available: available?.toLocaleString("vi-VN") })}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={t("loyalty.enter_points")}
          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={busy || available <= 0}
          className="px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
        >
          {t("loyalty.apply")}
        </button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {appliedDiscount > 0 && (
        <p className="text-xs text-emerald-600">
          {t("loyalty.applied", { amount: appliedDiscount.toLocaleString("vi-VN") })}
        </p>
      )}
      {rate > 0 && (
        <p className="text-xs text-slate-400">
          {t("loyalty.rate_hint", { rate })}
        </p>
      )}
    </div>
  );
};

export default PointsInput;
```

- [ ] **Step 2: Tích hợp vào OrderSummary**

Mở `client/src/pages/Checkout/components/OrderSummary.jsx`. Thêm import:

```jsx
import PointsInput from "./PointsInput";
```

Thêm props mới vào signature của `OrderSummary`:

```jsx
  pointsDiscount,
  onApplyPoints,
  pointsLoading,
```

Và render `<PointsInput />` giữa `CouponInput` block và `<hr>` discount (sau dòng 60, trước `<hr>`):

```jsx
      <PointsInput
        onApplyPoints={onApplyPoints}
        appliedDiscount={pointsDiscount || 0}
        busy={pointsLoading}
      />
```

- [ ] **Step 3: Cập nhật Checkout/index.jsx để quản lý state điểm**

Mở `client/src/pages/Checkout/index.jsx`. Thêm state và handler (cần xem file để chèn đúng chỗ, pattern tương tự `couponCode`):

```jsx
const [pointsDiscount, setPointsDiscount] = useState(0);
const [pointsLoading, setPointsLoading] = useState(false);

const handleApplyPoints = async (points) => {
  setPointsLoading(true);
  try {
    const res = await loyaltyApi.applyPoints(points);
    setPointsDiscount(res?.data?.discount || 0);
    ShowToast("success", res?.message || "Áp dụng điểm thành công");
  } catch (err) {
    ShowToast("error", err?.response?.data?.message || "Áp dụng điểm thất bại");
  } finally {
    setPointsLoading(false);
  }
};
```

Import `loyaltyApi` và truyền `pointsDiscount={pointsDiscount}`, `onApplyPoints={handleApplyPoints}`, `pointsLoading={pointsLoading}` vào `OrderSummary`. Điều chỉnh `finalAmount` tính toán để trừ `pointsDiscount` (kết hợp với `discount` coupon hiện có).

> **Lưu ý quan trọng:** Việc tích hợp sâu vào Checkout/index.jsx cần đọc kỹ file hiện tại (cách tính `finalAmount`, `handlePlaceOrder`) và truyền điểm đã dùng lên payload tạo đơn. Backend hiện chưa có cơ chế lưu điểm dùng vào order (chỉ có endpoint `apply-points` trừ điểm độc lập). Trong phạm vi giai đoạn này: gọi `applyPoints` để trừ điểm và lấy `discount`, rồi trừ vào `finalAmount` hiển thị. Nếu cần ghi nhận điểm dùng gắn order, bổ sung ở giai đoạn sau.

- [ ] **Step 4: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Checkout/components/PointsInput.jsx client/src/pages/Checkout/components/OrderSummary.jsx client/src/pages/Checkout/index.jsx
git commit -m "feat: apply loyalty points at checkout"
```

---

### Task 8: i18n key loyalty

**Files:**
- Modify: `client/src/locales/vi/translation.json`
- Modify: `client/src/locales/en/translation.json`

- [ ] **Step 1: Thêm key vi**

Mở `client/src/locales/vi/translation.json`. Thêm đối tượng `loyalty` (kiểm tra cấu trúc file để chèn đúng; nếu keyPrefix dùng `profile`, có thể thêm vào namespace phù hợp — component dùng `t("loyalty.*")` nên cần namespace `translation` mặc định):

```json
"loyalty": {
  "tier": "Hạng thành viên",
  "no_tier": "Chưa xác định",
  "points": "Điểm",
  "total_spent": "Tổng chi tiêu",
  "progress_to": "Tiến độ lên hạng {{tier}}",
  "rate_hint": "1 điểm = {{rate}}đ",
  "rewards": "Bảng đổi quà",
  "no_rewards": "Chưa có quà để đổi",
  "history": "Lịch sử điểm",
  "no_history": "Chưa có giao dịch điểm",
  "date": "Ngày",
  "type": "Loại",
  "note": "Ghi chú",
  "redeem": "Đổi",
  "redeeming": "Đang đổi...",
  "redeem_success": "Đổi quà thành công",
  "redeem_fail": "Đổi quà thất bại",
  "use_points": "Dùng điểm (có {{available}} điểm)",
  "enter_points": "Nhập số điểm",
  "apply": "Áp dụng",
  "invalid_points": "Số điểm không hợp lệ",
  "points_exceed": "Số điểm vượt quá điểm hiện có",
  "applied": "Đã giảm {{amount}}đ"
}
```

- [ ] **Step 2: Thêm key en**

Mở `client/src/locales/en/translation.json`. Thêm tương ứng:

```json
"loyalty": {
  "tier": "Membership tier",
  "no_tier": "Undefined",
  "points": "Points",
  "total_spent": "Total spent",
  "progress_to": "Progress to {{tier}}",
  "rate_hint": "1 point = {{rate}}đ",
  "rewards": "Reward store",
  "no_rewards": "No rewards available",
  "history": "Points history",
  "no_history": "No point transactions",
  "date": "Date",
  "type": "Type",
  "note": "Note",
  "redeem": "Redeem",
  "redeeming": "Redeeming...",
  "redeem_success": "Reward redeemed successfully",
  "redeem_fail": "Failed to redeem reward",
  "use_points": "Use points ({{available}} available)",
  "enter_points": "Enter points",
  "apply": "Apply",
  "invalid_points": "Invalid points",
  "points_exceed": "Points exceed available balance",
  "applied": "Reduced {{amount}}đ"
}
```

- [ ] **Step 3: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 4: Commit**

```bash
git add client/src/locales/vi/translation.json client/src/locales/en/translation.json
git commit -m "feat: loyalty i18n keys"
```

---

## Self-Review

- **Spec coverage:** Giai đoạn 4 phủ mục 6.1 (profile/overview/header) và 6.2 (checkout dùng điểm) của design doc. MembershipBlock (profile), MembershipCard (header), LoyaltyPage (hạng + đổi quà + lịch sử), PointsInput (checkout). API + hook đầy đủ.
- **Placeholder scan:** Không placeholder; mỗi task có code đầy đủ. Task 7 Step 3 yêu cầu đọc `Checkout/index.jsx` trước khi chèn — đây là bước kiểm tra cần thực hiện tại lúc thi hành, có code mẫu đầy đủ.
- **Type consistency:** Tên field khớp API giai đoạn 2: `membership.tier.name`, `points_balance`, `total_spent`, `progress`, `points_to_money_rate`, `rewards[].{id,name,point_cost}`, `transactions[].{id,type,points,note,created_at}`. `axiosClient` trả `response.data`, gọi `res.data`.
- **Note:** `formatCurrency` import trong LoyaltyPage chưa dùng — cần bỏ nếu lint báo unused. Checkout `finalAmount` cần cộng `pointsDiscount`.
