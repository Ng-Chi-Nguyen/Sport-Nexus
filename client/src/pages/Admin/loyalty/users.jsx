import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Coins } from "lucide-react";
import loyaltyApi from "@/api/management/loyaltyApi";
import ShowToast from "@/components/ui/toast";
import { SearchTable } from "@/components/ui/search";
import Pagination from "@/components/ui/pagination";
import { formatCurrency } from "@/utils/formatters";
import LoadingSpinner from "@/components/ui/loadingSpinner";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{user?.full_name || user?.email}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
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
              <div className="font-medium">{user?.tier?.name || "—"}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400">{t("total_spent")}</div>
              <div className="font-medium">{formatCurrency(user?.total_spent)}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-slate-400 flex items-center gap-1"><Coins size={14} /> {t("points_balance")}</div>
              <div className="font-medium">{user?.points_balance}</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{t("adjust_points")}</h4>
            <div className="flex flex-wrap gap-2">
              <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder={t("points")} className="px-3 py-2 border rounded-lg w-32" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("note")} className="px-3 py-2 border rounded-lg flex-1 min-w-[160px]" />
              <button type="button" onClick={submit} className="px-3 py-2 bg-sky-600 text-white rounded-lg cursor-pointer">{t("apply")}</button>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("transactions")}</h4>
            <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-sm">
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
                    <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">{tx.points}</td>
                      <td className="p-2">{tx.balance_after}</td>
                      <td className="p-2 text-slate-500">{tx.note || "—"}</td>
                      <td className="p-2 text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(detail?.transactions ?? []).length === 0 && (
                    <tr><td colSpan="5" className="p-4 text-center text-slate-400 italic">{t("no_data")}</td></tr>
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
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await loyaltyApi.getUsers({ page, search });
      setUsers(res?.data?.users ?? []);
      setTotal(res?.data?.total ?? 0);
      setLimit(res?.data?.limit ?? 10);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

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
      load();
    } catch (err) {
      ShowToast("error", err?.response?.data?.message || t("save_fail"));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <Users size={20} className="text-sky-500" /> {t("users")}
        </h3>
        <div className="w-72">
          <SearchTable value={search} onChange={setSearch} onClear={() => setSearch("")} placeholder={t("search_user")} />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="text-left p-3">{t("email")}</th>
              <th className="text-left p-3">{t("full_name")}</th>
              <th className="text-left p-3">{t("tier")}</th>
              <th className="text-left p-3">{t("points_balance")}</th>
              <th className="text-left p-3">{t("total_spent")}</th>
              <th className="text-right p-3">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.full_name || "—"}</td>
                <td className="p-3">{user.tier?.name || "—"}</td>
                <td className="p-3">{user.points_balance}</td>
                <td className="p-3">{formatCurrency(user.total_spent)}</td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => openDetail(user.id)} className="px-3 py-1.5 text-xs border border-sky-500/30 text-sky-600 dark:text-sky-400 rounded-lg cursor-pointer hover:bg-sky-500/10">
                      {t("view_detail")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">{t("no_data")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
      )}

      {detail && <UserDetailModal detail={detail} onClose={() => setDetail(null)} onAdjust={handleAdjust} />}
    </div>
  );
};

export default UsersPage;
