import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, Coins, Wallet } from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import Badge from "@/components/ui/badge";
import { LabelInput } from "@/components/ui/input";
import { BtnGoback, BtnSave } from "@/components/ui/button";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import { SearchTable } from "@/components/ui/search";
import { SimpleSelect } from "@/components/ui/select";
import Pagination from "@/components/ui/pagination";
import { formatCurrency } from "@/utils/formatters";
import { queryClient } from "@/lib/react-query";
import useTableFilters from "@/hooks/useTableFilters";
import LoaderLoyalty from "@/loaders/management/loyaltyLoader";

const tierBadgeColor = (name = "") => {
  const n = name.toLowerCase();
  if (/(gold|vàng|vang)/.test(n)) return "gold";
  if (/(silver|bạc|bac)/.test(n)) return "silver";
  if (/(bronze|đồng|dong)/.test(n)) return "bronze";
  if (/(diamond|kim.cương|kimcuong)/.test(n)) return "cyan";
  if (/(platinum|bạch.kim|bachkim)/.test(n)) return "purple";
  return "nexus";
};

const TierBadge = ({ name }) =>
  name ? <Badge color={tierBadgeColor(name)}>{name}</Badge> : "—";

const PointsValue = ({ value }) => (
  <span className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
    <Coins size={15} /> {value}
  </span>
);

const SpentValue = ({ value }) => (
  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
    <Wallet size={15} /> {formatCurrency(value)}
  </span>
);

const UserDetailModal = ({ detail, onClose, onAdjust }) => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const user = detail?.user;

  const submit = async () => {
    const val = Number(points);
    if (!val) return;
    await onAdjust(user.id, val, note);
    setPoints("");
    setNote("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            {user?.full_name || user?.email}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">{t("email")}</div>
              <div className="font-medium truncate">{user?.email}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">{t("phone")}</div>
              <div className="font-medium">{user?.phone_number || "—"}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">{t("tier")}</div>
              <div className="mt-1">
                <TierBadge name={user?.tier?.name} />
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">{t("total_spent")}</div>
              <div className="mt-1">
                <SpentValue value={user?.total_spent} />
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 col-span-1 sm:col-span-2">
              <div className="text-slate-400 flex items-center gap-1">
                {t("points_balance")}
              </div>
              <div className="mt-1">
                <PointsValue value={user?.points_balance} />
              </div>
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-50/60 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {t("adjust_points")}
            </h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
              <div className="w-full sm:w-32">
                <LabelInput
                  id="adjust-points"
                  type="number"
                  label={t("points")}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="+/- điểm"
                  className="text-xs h-9"
                />
              </div>
              <div className="flex-1">
                <LabelInput
                  id="adjust-note"
                  label={t("note")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh..."
                  className="text-xs h-9"
                />
              </div>
              <BtnSave
                onClick={submit}
                className="h-9 px-3.5 text-xs font-semibold shrink-0"
              >
                {t("apply")}
              </BtnSave>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t("transactions")}
            </h4>
            <div className="max-h-64 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left p-2">{t("type")}</th>
                    <th className="text-left p-2">{t("points")}</th>
                    <th className="text-left p-2">{t("balance_after")}</th>
                    <th className="text-left p-2">{t("note")}</th>
                    <th className="text-left p-2">{t("created_at")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.transactions ?? []).map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">{tx.points}</td>
                      <td className="p-2">{tx.balance_after}</td>
                      <td className="p-2 text-slate-500">{tx.note || "—"}</td>
                      <td className="p-2 text-slate-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(detail?.transactions ?? []).length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-slate-400 italic"
                      >
                        {t("no_data")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const { t } = useTranslation("translation", { keyPrefix: "loyalty_admin" });
  const { t: tMenu } = useTranslation("translation", {
    keyPrefix: "component.menu",
  });
  const loaderData = useLoaderData();
  const {
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    setFilter,
  } = useTableFilters();
  const [detail, setDetail] = useState(null);
  const currentPage = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "points_balance";
  const order = searchParams.get("order") || "desc";
  const tierId = searchParams.get("tierId") || "";

  const query = useQuery({
    queryKey: ["loyalty-users", currentPage, search, sortBy, order, tierId],
    queryFn: () =>
      LoaderLoyalty.getUsersPage({
        page: currentPage,
        search,
        sortBy,
        order,
        tierId,
      }),
    initialData: loaderData,
    placeholderData: keepPreviousData,
  });
  const { isFetching } = query;

  const data = query.data ?? loaderData;
  const users = data?.users ?? [];
  const tiers = data?.tiers ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSortChange = (val) => setFilter("sortBy", val);
  const handleOrderChange = (val) => setFilter("order", val);
  const handleTierChange = (val) => setFilter("tierId", val);
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const openDetail = async (id) => {
    try {
      const res = await loyaltyApi.getUserDetail(id);
      setDetail(res?.data ?? { user: null, transactions: [] });
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("load_fail"));
    }
  };

  const handleAdjust = async (id, points, note) => {
    try {
      await loyaltyApi.adjustPoints(id, { points, note });
      ShowToast("success", t("save_success"));
      await openDetail(id);
      queryClient.invalidateQueries({ queryKey: ["loyalty-users"] });
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Breadcrumbs
        data={[
          { title: <LayoutDashboard size={18} strokeWidth={1.5} />, route: "" },
          { title: tMenu("membership"), route: "" },
          { title: tMenu("loyalty"), route: "/management/loyalty" },
          { title: t("users"), route: "" },
        ]}
      />

      {/* TỐI ƯU MOBILE: Xếp dọc các bộ lọc và ô tìm kiếm, co giãn hợp lý trên PC */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100 shrink-0">
            <Users size={20} className="text-sky-500" /> {t("users")}
          </h3>
          <div className="flex items-center gap-2">
            <BtnGoback />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5">
          <div className="w-full lg:w-44">
            <SimpleSelect
              placeholder={t("all_tiers")}
              options={[
                { slug: "", name: t("all_tiers") },
                ...tiers.map((tier) => ({
                  slug: String(tier.id),
                  name: tier.name,
                })),
              ]}
              value={tierId}
              onChange={handleTierChange}
            />
          </div>
          <div className="w-full lg:w-44">
            <SimpleSelect
              placeholder={t("sort_by")}
              options={[
                { slug: "id", name: t("sort_id") },
                { slug: "points_balance", name: t("sort_points") },
                { slug: "total_spent", name: t("sort_total_spent") },
              ]}
              value={sortBy}
              onChange={handleSortChange}
            />
          </div>
          <div className="w-full lg:w-36">
            <SimpleSelect
              placeholder={t("order")}
              options={[
                { slug: "desc", name: t("order_desc") },
                { slug: "asc", name: t("order_asc") },
              ]}
              value={order}
              onChange={handleOrderChange}
            />
          </div>
          <div className="w-full lg:flex-1">
            <SearchTable
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => setSearchInput("")}
              placeholder={t("search_user")}
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0D121F]/40 shadow-sm">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-[#4facf3]"></div>
          </div>
        )}
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
            <tr>
              <th className="text-left p-3.5 font-semibold">{t("email")}</th>
              <th className="text-left p-3.5 font-semibold">
                {t("full_name")}
              </th>
              <th className="text-left p-3.5 font-semibold">{t("tier")}</th>
              <th className="text-left p-3.5 font-semibold">
                {t("points_balance")}
              </th>
              <th className="text-left p-3.5 font-semibold">
                {t("total_spent")}
              </th>
              <th className="text-right p-3.5 font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-3.5 font-mono text-xs">{user.email}</td>
                <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                  {user.full_name || "—"}
                </td>
                <td className="p-3.5">
                  <TierBadge name={user.tier?.name} />
                </td>
                <td className="p-3.5">
                  <PointsValue value={user.points_balance} />
                </td>
                <td className="p-3.5">
                  <SpentValue value={user.total_spent} />
                </td>
                <td className="p-3.5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openDetail(user.id)}
                      className="px-3 py-1.5 text-xs font-semibold border border-sky-500/30 text-sky-600 dark:text-sky-400 rounded-lg cursor-pointer hover:bg-sky-500/10 active:scale-95 transition-all"
                    >
                      {t("view_detail")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-slate-400 italic"
                >
                  {t("no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {detail && (
        <UserDetailModal
          detail={detail}
          onClose={() => setDetail(null)}
          onAdjust={handleAdjust}
        />
      )}
    </div>
  );
};

export default UsersPage;
