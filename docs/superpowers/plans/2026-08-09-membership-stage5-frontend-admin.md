# #6 Tích điểm / Thành viên — Giai đoạn 5: Frontend Admin (management)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang admin quản lý chương trình tích điểm/thành viên: quản lý hạng (`MembershipTiers`), bảng đổi quà (`TierRewards`), cấu hình tỷ lệ quy đổi (`LoyaltySettings`), xem user + lịch sử điểm + điều chỉnh điểm.

**Architecture:** Tạo `client/src/api/management/loyaltyApi.js` gọi `/management/loyalty/*`. Tạo 4 trang admin trong `client/src/pages/Admin/loyalty/`: `index.jsx` (dashboard loyalty, điều hướng), `tiers.jsx`, `rewards.jsx`, `settings.jsx`, `users.jsx`. Đăng ký route trong `adminRoutes.jsx` và thêm nav trong sidebar admin. Mọi API qua `axiosClient` (trả `response.data`). Pattern theo `pages/Admin/collections/index.jsx`.

**Tech Stack:** React 19, React Router, `axiosClient`, `react-i18next`, `lucide-react`, UI kit (`BtnAdd`, `BtnDelete`, `BtnEdit`, `Badge`, `Pagination`, `ConfirmDelete`, `SearchTable`). Verify bằng `npm run build --prefix client` + `npm run lint --prefix client`.

---

### Task 1: Tạo API loyalty (management)

**Files:**
- Create: `client/src/api/management/loyaltyApi.js`

- [ ] **Step 1: Tạo file API**

Tạo `client/src/api/management/loyaltyApi.js`:

```js
import axiosClient from "@/lib/axiosClient";

const loyaltyApi = {
  // Tiers
  getTiers: () => axiosClient.get("/management/loyalty/tiers"),
  createTier: (data) => axiosClient.post("/management/loyalty/tiers", data),
  updateTier: (id, data) => axiosClient.put(`/management/loyalty/tiers/${id}`, data),
  deleteTier: (id) => axiosClient.delete(`/management/loyalty/tiers/${id}`),

  // Rewards
  getRewards: () => axiosClient.get("/management/loyalty/rewards"),
  createReward: (data) => axiosClient.post("/management/loyalty/rewards", data),
  updateReward: (id, data) => axiosClient.put(`/management/loyalty/rewards/${id}`, data),
  deleteReward: (id) => axiosClient.delete(`/management/loyalty/rewards/${id}`),

  // Settings
  getSettings: () => axiosClient.get("/management/loyalty/settings"),
  updateSettings: (data) => axiosClient.put("/management/loyalty/settings", data),

  // Users
  getUsers: (params) => axiosClient.get("/management/loyalty/users", { params }),
  getUserDetail: (id) => axiosClient.get(`/management/loyalty/users/${id}`),
  adjustPoints: (id, data) =>
    axiosClient.post(`/management/loyalty/users/${id}/adjust-points`, data),
};

export default loyaltyApi;
```

> Lưu ý: `axiosClient` interceptor trả `response.data`. Kết quả là `{ success, data, message }`. Gọi `res.data` để lấy payload.

- [ ] **Step 2: Commit**

```bash
git add client/src/api/management/loyaltyApi.js
git commit -m "feat: loyalty management api client"
```

---

### Task 2: Trang quản lý hạng (tiers)

**Files:**
- Create: `client/src/pages/Admin/loyalty/tiers.jsx`

- [ ] **Step 1: Tạo trang quản lý hạng**

Tạo `client/src/pages/Admin/loyalty/tiers.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import { formatCurrency } from "@/utils/formatters";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const TierForm = ({ initial, tiers, onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [form, setForm] = useState(
    initial || { name: "", min_spent: 0, reward_rate: 0, discount_percent: 0, sort_order: 0, is_active: true },
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNum = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="font-bold text-slate-900 dark:text-slate-100">
        {initial ? t("edit_tier") : t("add_tier")}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <input value={form.name} onChange={set("name")} placeholder={t("tier_name")} className="px-3 py-2 border rounded-lg" />
        <input type="number" value={form.min_spent} onChange={setNum("min_spent")} placeholder={t("min_spent")} className="px-3 py-2 border rounded-lg" />
        <input type="number" step="0.01" value={form.reward_rate} onChange={setNum("reward_rate")} placeholder={t("reward_rate")} className="px-3 py-2 border rounded-lg" />
        <input type="number" value={form.discount_percent} onChange={setNum("discount_percent")} placeholder={t("discount_percent")} className="px-3 py-2 border rounded-lg" />
        <input type="number" value={form.sort_order} onChange={setNum("sort_order")} placeholder={t("sort_order")} className="px-3 py-2 border rounded-lg" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          {t("is_active")}
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(form)} className="px-3 py-2 bg-sky-600 text-white rounded-lg cursor-pointer">{t("save")}</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-3 py-2 border rounded-lg cursor-pointer">{t("cancel")}</button>}
      </div>
    </div>
  );
};

const TierPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await loyaltyApi.getTiers();
      setTiers(res?.data?.tiers ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editing) await loyaltyApi.updateTier(editing.id, form);
      else await loyaltyApi.createTier(form);
      ShowToast("success", t("save_success"));
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  const handleDelete = async () => {
    try {
      await loyaltyApi.deleteTier(confirmTarget.id);
      ShowToast("success", t("delete_success"));
      setConfirmTarget(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("delete_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <Trophy size={20} className="text-amber-500" /> {t("tiers")}
        </h3>
        <button type="button" onClick={() => { setEditing(null); setShowForm((v) => !v); }} className="px-3 py-2 bg-sky-600 text-white text-sm rounded-lg cursor-pointer">
          {t("add_tier")}
        </button>
      </div>

      {showForm && <TierForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3">{t("tier_name")}</th>
              <th className="text-left p-3">{t("min_spent")}</th>
              <th className="text-left p-3">{t("reward_rate")}</th>
              <th className="text-left p-3">{t("discount_percent")}</th>
              <th className="text-left p-3">{t("sort_order")}</th>
              <th className="text-left p-3">{t("is_active")}</th>
              <th className="text-right p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3 font-medium">{tier.name}</td>
                <td className="p-3">{formatCurrency(tier.min_spent)}</td>
                <td className="p-3">{Number(tier.reward_rate)}</td>
                <td className="p-3">{tier.discount_percent}%</td>
                <td className="p-3">{tier.sort_order}</td>
                <td className="p-3"><Badge>{tier.is_active ? t("active") : t("inactive")}</Badge></td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <BtnEdit onClick={() => { setEditing(tier); setShowForm(true); }} />
                    <BtnDelete onClick={() => setConfirmTarget(tier)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDelete isOpen={!!confirmTarget} onConfirm={handleDelete} onCancel={() => setConfirmTarget(null)} />
    </div>
  );
};

export default TierPage;
```

- [ ] **Step 2: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Admin/loyalty/tiers.jsx
git commit -m "feat: admin loyalty tier management page"
```

---

### Task 3: Trang quản lý bảng đổi quà (rewards)

**Files:**
- Create: `client/src/pages/Admin/loyalty/rewards.jsx`

- [ ] **Step 1: Tạo trang quản lý quà**

Tạo `client/src/pages/Admin/loyalty/rewards.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const RewardForm = ({ initial, tiers, onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [form, setForm] = useState(
    initial || { tier_id: tiers[0]?.id || "", name: "", point_cost: 0, coupon_code: "", is_active: true },
  );
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="font-bold">{initial ? t("edit_reward") : t("add_reward")}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <select value={form.tier_id} onChange={set("tier_id")} className="px-3 py-2 border rounded-lg">
          {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input value={form.name} onChange={set("name")} placeholder={t("reward_name")} className="px-3 py-2 border rounded-lg" />
        <input type="number" value={form.point_cost} onChange={set("point_cost")} placeholder={t("point_cost")} className="px-3 py-2 border rounded-lg" />
        <input value={form.coupon_code || ""} onChange={set("coupon_code")} placeholder={t("coupon_code")} className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(form)} className="px-3 py-2 bg-sky-600 text-white rounded-lg cursor-pointer">{t("save")}</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-3 py-2 border rounded-lg cursor-pointer">{t("cancel")}</button>}
      </div>
    </div>
  );
};

const RewardPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [rewards, setRewards] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r, tr] = await Promise.all([loyaltyApi.getRewards(), loyaltyApi.getTiers()]);
      setRewards(r?.data?.rewards ?? []);
      setTiers(tr?.data?.tiers ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    try {
      if (editing) await loyaltyApi.updateReward(editing.id, form);
      else await loyaltyApi.createReward(form);
      ShowToast("success", t("save_success"));
      setShowForm(false); setEditing(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  const handleDelete = async () => {
    try {
      await loyaltyApi.deleteReward(confirmTarget.id);
      ShowToast("success", t("delete_success"));
      setConfirmTarget(null);
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("delete_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Gift size={20} className="text-amber-500" /> {t("rewards")}
        </h3>
        <button type="button" onClick={() => { setEditing(null); setShowForm((v) => !v); }} className="px-3 py-2 bg-sky-600 text-white text-sm rounded-lg cursor-pointer">
          {t("add_reward")}
        </button>
      </div>

      {showForm && <RewardForm initial={editing} tiers={tiers} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3">{t("reward_name")}</th>
              <th className="text-left p-3">{t("tier")}</th>
              <th className="text-left p-3">{t("point_cost")}</th>
              <th className="text-left p-3">{t("coupon_code")}</th>
              <th className="text-left p-3">{t("is_active")}</th>
              <th className="text-right p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.tier?.name}</td>
                <td className="p-3">{r.point_cost?.toLocaleString("vi-VN")}</td>
                <td className="p-3">{r.coupon_code || "-"}</td>
                <td className="p-3"><Badge>{r.is_active ? t("active") : t("inactive")}</Badge></td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <BtnEdit onClick={() => { setEditing(r); setShowForm(true); }} />
                    <BtnDelete onClick={() => setConfirmTarget(r)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDelete isOpen={!!confirmTarget} onConfirm={handleDelete} onCancel={() => setConfirmTarget(null)} />
    </div>
  );
};

export default RewardPage;
```

- [ ] **Step 2: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Admin/loyalty/rewards.jsx
git commit -m "feat: admin loyalty rewards management page"
```

---

### Task 4: Trang cấu hình tỷ lệ quy đổi (settings)

**Files:**
- Create: `client/src/pages/Admin/loyalty/settings.jsx`

- [ ] **Step 1: Tạo trang cấu hình**

Tạo `client/src/pages/Admin/loyalty/settings.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings2 } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const SettingsPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rate, setRate] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await loyaltyApi.getSettings();
        setRate(res?.data?.points_to_money_rate ?? "");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await loyaltyApi.updateSettings({ points_to_money_rate: Number(rate) });
      ShowToast("success", t("save_success"));
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <Settings2 size={20} className="text-sky-500" /> {t("settings")}
      </h3>
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("points_to_money_rate")}
        </label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
        <p className="text-xs text-slate-400">{t("points_to_money_hint")}</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 disabled:opacity-50 cursor-pointer"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
```

- [ ] **Step 2: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Admin/loyalty/settings.jsx
git commit -m "feat: admin loyalty settings page"
```

---

### Task 5: Trang xem user + lịch sử điểm + điều chỉnh điểm (users)

**Files:**
- Create: `client/src/pages/Admin/loyalty/users.jsx`

- [ ] **Step 1: Tạo trang users**

Tạo `client/src/pages/Admin/loyalty/users.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { formatCurrency } from "@/utils/formatters";

const AdjustForm = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="font-bold">{t("adjust_points", { user: user?.full_name })}</h4>
      <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder={t("points_amount")} className="w-full px-3 py-2 border rounded-lg text-sm" />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("note")} className="w-full px-3 py-2 border rounded-lg text-sm" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSave(Number(points), note)} className="px-3 py-2 bg-sky-600 text-white rounded-lg cursor-pointer">{t("save")}</button>
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded-lg cursor-pointer">{t("cancel")}</button>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [data, setData] = useState({ users: [], total: 0, page: 1, limit: 10 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [adjusting, setAdjusting] = useState(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await loyaltyApi.getUsers({ page: p });
      const d = res?.data ?? { users: [], total: 0, page: 1, limit: 10 };
      setData(d);
      setTotalPages(Math.max(1, Math.ceil((d.total || 0) / (d.limit || 10))));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(1); }, []);

  const handleView = async (user) => {
    try {
      const res = await loyaltyApi.getUserDetail(user.id);
      setDetail(res?.data ?? null);
      setSelected(user);
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("load_fail"));
    }
  };

  const handleAdjust = async (points, note) => {
    try {
      await loyaltyApi.adjustPoints(adjusting.id, { points, note });
      ShowToast("success", t("save_success"));
      setAdjusting(null);
      handleView(adjusting);
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        <Users size={20} className="text-sky-500" /> {t("users")}
      </h3>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3">{t("user")}</th>
              <th className="text-left p-3">{t("tier")}</th>
              <th className="text-left p-3">{t("points")}</th>
              <th className="text-left p-3">{t("total_spent")}</th>
              <th className="text-left p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="p-3"><Badge>{u.tier?.name || "-"}</Badge></td>
                <td className="p-3">{u.points_balance?.toLocaleString("vi-VN")}</td>
                <td className="p-3">{formatCurrency(u.total_spent)}</td>
                <td className="p-3">
                  <button type="button" onClick={() => handleView(u)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">{t("view")}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} currentPage={page} onPageChange={(p) => { setPage(p); load(p); }} />

      {selected && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">{selected.full_name}</h4>
            <button type="button" onClick={() => { setSelected(null); setDetail(null); }} className="text-xs text-slate-400 cursor-pointer">{t("close")}</button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-400">{t("points")}</p>
              <p className="font-bold">{detail?.user?.points_balance?.toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <p className="text-slate-400">{t("total_spent")}</p>
              <p className="font-bold">{formatCurrency(detail?.user?.total_spent)}</p>
            </div>
            <div>
              <p className="text-slate-400">{t("tier")}</p>
              <p className="font-bold">{detail?.user?.tier?.name || "-"}</p>
            </div>
          </div>

          <button type="button" onClick={() => setAdjusting(selected)} className="px-3 py-2 bg-amber-500 text-white text-sm rounded-lg cursor-pointer">{t("adjust_points_btn")}</button>
          {adjusting && <AdjustForm user={selected} onSave={handleAdjust} onCancel={() => setAdjusting(null)} />}

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-3">{t("date")}</th>
                  <th className="text-left p-3">{t("type")}</th>
                  <th className="text-left p-3">{t("note")}</th>
                  <th className="text-right p-3">{t("points")}</th>
                </tr>
              </thead>
              <tbody>
                {(detail?.transactions ?? []).map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">{new Date(tx.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3">{tx.type}</td>
                    <td className="p-3">{tx.note || ""}</td>
                    <td className={`p-3 text-right ${tx.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>{tx.points > 0 ? "+" : ""}{tx.points?.toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
```

> Lưu ý: `Pagination` dùng props `totalPages`, `currentPage`, `onPageChange` (xem `components/ui/pagination.jsx`). Code trong Task 5 đã khớp; `totalPages` tính từ `total/limit`.

- [ ] **Step 2: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Admin/loyalty/users.jsx
git commit -m "feat: admin loyalty users page"
```

---

### Task 6: Trang dashboard loyalty + đăng ký route + sidebar

**Files:**
- Create: `client/src/pages/Admin/loyalty/index.jsx`
- Modify: `client/src/routes/adminRoutes.jsx`

- [ ] **Step 1: Tạo trang dashboard loyalty (index)**

Tạo `client/src/pages/Admin/loyalty/index.jsx`:

```jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Gift, Settings2, Users } from "lucide-react";

const LoyaltyAdminPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const items = [
    { to: "/management/loyalty/tiers", icon: Trophy, label: t("tiers"), desc: t("tiers_desc") },
    { to: "/management/loyalty/rewards", icon: Gift, label: t("rewards"), desc: t("rewards_desc") },
    { to: "/management/loyalty/settings", icon: Settings2, label: t("settings"), desc: t("settings_desc") },
    { to: "/management/loyalty/users", icon: Users, label: t("users"), desc: t("users_desc") },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-sky-500 transition-colors">
            <Icon size={24} className="text-sky-500 mb-2" />
            <p className="font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
            <p className="text-sm text-slate-400">{item.desc}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default LoyaltyAdminPage;
```

- [ ] **Step 2: Đăng ký lazy load + route**

Mở `client/src/routes/adminRoutes.jsx`. Thêm lazy imports (sau dòng CollectionPage imports):

```jsx
const LoyaltyAdminPage = lazy(() => import("@/pages/Admin/loyalty/index.jsx"));
const LoyaltyTiersPage = lazy(() => import("@/pages/Admin/loyalty/tiers.jsx"));
const LoyaltyRewardsPage = lazy(() => import("@/pages/Admin/loyalty/rewards.jsx"));
const LoyaltySettingsPage = lazy(() => import("@/pages/Admin/loyalty/settings.jsx"));
const LoyaltyUsersPage = lazy(() => import("@/pages/Admin/loyalty/users.jsx"));
```

Thêm routes vào mảng `children` (sau khối collections, trước dấu `],`):

```jsx
    // Chương trình thành viên & tích điểm
    { path: "loyalty", element: <LoyaltyAdminPage /> },
    { path: "loyalty/tiers", element: <LoyaltyTiersPage /> },
    { path: "loyalty/rewards", element: <LoyaltyRewardsPage /> },
    { path: "loyalty/settings", element: <LoyaltySettingsPage /> },
    { path: "loyalty/users", element: <LoyaltyUsersPage /> },
```

- [ ] **Step 3: Thêm link vào sidebar admin**

Mở file sidebar admin (kiểm tra `components/admin/` — xem sidebar hiện tại ở đâu; nếu dùng `SidebarCollapsed.jsx` hoặc một component khác, thêm NavLink). Thêm một mục dẫn đến `/management/loyalty` với icon phù hợp (vd `Trophy`/`Medal`):

```jsx
<Link to="/management/loyalty" ...>
  <Medal size={18} strokeWidth={1.5} />
  <span>{t("loyalty")}</span>
</Link>
```

(Điều chỉnh theo cấu trúc sidebar thực tế; đây là bước cần đối chiếu file khi thi hành.)

- [ ] **Step 4: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Admin/loyalty/ client/src/routes/adminRoutes.jsx
git commit -m "feat: admin loyalty dashboard routes and nav"
```

---

### Task 7: i18n key loyalty_admin

**Files:**
- Modify: `client/src/locales/vi/translation.json`
- Modify: `client/src/locales/en/translation.json`

- [ ] **Step 1: Thêm key vi**

Mở `client/src/locales/vi/translation.json`. Thêm đối tượng `loyalty_admin`:

```json
"loyalty_admin": {
  "tiers": "Quản lý hạng thành viên",
  "tiers_desc": "Thiết lập ngưỡng chi tiêu, hệ số điểm, ưu đãi",
  "rewards": "Bảng đổi quà",
  "rewards_desc": "Quản lý quà tặng đổi bằng điểm",
  "settings": "Cấu hình",
  "settings_desc": "Tỷ lệ quy đổi điểm thành tiền",
  "users": "Người dùng & điểm",
  "users_desc": "Xem hạng, điểm, lịch sử giao dịch",
  "add_tier": "Thêm hạng",
  "edit_tier": "Sửa hạng",
  "add_reward": "Thêm quà",
  "edit_reward": "Sửa quà",
  "tier_name": "Tên hạng",
  "min_spent": "Ngưỡng chi tối thiểu",
  "reward_rate": "Hệ số điểm",
  "discount_percent": "Ưu đãi giảm giá (%)",
  "sort_order": "Thứ tự",
  "is_active": "Kích hoạt",
  "reward_name": "Tên quà",
  "tier": "Hạng",
  "point_cost": "Số điểm đổi",
  "coupon_code": "Mã coupon",
  "save": "Lưu",
  "cancel": "Hủy",
  "close": "Đóng",
  "actions": "Thao tác",
  "active": "Hoạt động",
  "inactive": "Tạm dừng",
  "save_success": "Lưu thành công",
  "save_fail": "Lưu thất bại",
  "delete_success": "Xóa thành công",
  "delete_fail": "Xóa thất bại",
  "points_to_money_rate": "Tỷ lệ quy đổi (1 điểm = ? VND)",
  "points_to_money_hint": "Số VND quy đổi được từ 1 điểm",
  "user": "Người dùng",
  "points": "Điểm",
  "total_spent": "Tổng chi",
  "view": "Xem",
  "adjust_points_btn": "Điều chỉnh điểm",
  "adjust_points": "Điều chỉnh điểm - {{user}}",
  "points_amount": "Số điểm (+/-)",
  "note": "Ghi chú",
  "date": "Ngày",
  "type": "Loại",
  "load_fail": "Tải dữ liệu thất bại"
}
```

- [ ] **Step 2: Thêm key en**

Mở `client/src/locales/en/translation.json`. Thêm tương ứng:

```json
"loyalty_admin": {
  "tiers": "Membership Tiers",
  "tiers_desc": "Set spending thresholds, reward rate, benefits",
  "rewards": "Reward Store",
  "rewards_desc": "Manage rewards redeemable by points",
  "settings": "Settings",
  "settings_desc": "Points to money conversion rate",
  "users": "Users & Points",
  "users_desc": "View tiers, points, transaction history",
  "add_tier": "Add tier",
  "edit_tier": "Edit tier",
  "add_reward": "Add reward",
  "edit_reward": "Edit reward",
  "tier_name": "Tier name",
  "min_spent": "Min spending",
  "reward_rate": "Reward rate",
  "discount_percent": "Discount (%)",
  "sort_order": "Order",
  "is_active": "Active",
  "reward_name": "Reward name",
  "tier": "Tier",
  "point_cost": "Points cost",
  "coupon_code": "Coupon code",
  "save": "Save",
  "cancel": "Cancel",
  "close": "Close",
  "actions": "Actions",
  "active": "Active",
  "inactive": "Inactive",
  "save_success": "Saved successfully",
  "save_fail": "Save failed",
  "delete_success": "Deleted successfully",
  "delete_fail": "Delete failed",
  "points_to_money_rate": "Conversion rate (1 point = ? VND)",
  "points_to_money_hint": "VND value per 1 point",
  "user": "User",
  "points": "Points",
  "total_spent": "Total spent",
  "view": "View",
  "adjust_points_btn": "Adjust points",
  "adjust_points": "Adjust points - {{user}}",
  "points_amount": "Points amount (+/-)",
  "note": "Note",
  "date": "Date",
  "type": "Type",
  "load_fail": "Failed to load data"
}
```

- [ ] **Step 3: Build & lint**

Run: `npm run build --prefix client`
Run: `npm run lint --prefix client`
Expected: build thành công; lint không lỗi mới.

- [ ] **Step 4: Commit**

```bash
git add client/src/locales/vi/translation.json client/src/locales/en/translation.json
git commit -m "feat: loyalty admin i18n keys"
```

---

## Self-Review

- **Spec coverage:** Giai đoạn 5 phủ mục 6.3 (admin) của design doc: quản lý hạng, bảng đổi quà, cấu hình tỷ lệ, xem user + lịch sử điểm + điều chỉnh điểm. Route + sidebar đầy đủ.
- **Placeholder scan:** Không placeholder; mỗi task có code đầy đủ. Có 2 bước "đối chiếu khi thi hành": props `Pagination` (Task 5) và vị trí sidebar (Task 6 Step 3) — đây là bước kiểm tra file thực tế, không phải placeholder.
- **Type consistency:** Field khớp API giai đoạn 3: `tiers[]`, `rewards[]` (có `tier.name`), `settings.points_to_money_rate`, `users[]` + `getUserDetail().{user,transactions}`. `axiosClient` trả `response.data`, gọi `res.data`.
- **Note:** Cần kiểm tra cấu trúc sidebar admin khi thi hành (Task 6 Step 3) và đối chiếu props `Pagination` (đã khớp với `totalPages/currentPage/onPageChange`).
