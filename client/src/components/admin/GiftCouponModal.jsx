import { useEffect, useRef, useState } from "react";
import { Search, Gift, X } from "lucide-react";
import userApi from "@/api/management/userApi";
import couponApi from "@/api/management/couponApi";
import ShowToast from "@/components/ui/toast";

const GiftCouponModal = ({ isOpen, coupon, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setUsers([]);
      setSelectedUser(null);
      return;
    }
    handleSearch("");
  }, [isOpen]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!term.trim()) {
        setUsers([]);
        return;
      }
      setSearching(true);
      try {
        const res = await userApi.getAll({ search: term.trim() });
        setUsers(res?.data?.data || []);
      } catch {
        setUsers([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      ShowToast("error", "Vui lòng chọn user nhận");
      return;
    }
    setSubmitting(true);
    try {
      const res = await couponApi.gift({
        coupon_id: coupon.id,
        user_id: selectedUser.id,
      });
      ShowToast("success", res.message || "Đã tặng mã giảm giá thành công");
      onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
      ShowToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D121F] shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift size={16} className="text-sky-500" />
            Tặng mã giảm giá: {coupon.code}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm user theo email hoặc tên..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827]/40 text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
            />
          </div>

          {searching && <p className="text-xs text-slate-400">Đang tìm...</p>}

          {!searching && searchTerm && users.length > 0 && (
            <div className="max-h-52 overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    selectedUser?.id === u.id
                      ? "bg-sky-50 dark:bg-sky-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {u.full_name}
                  </div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </button>
              ))}
            </div>
          )}

          {!searching && searchTerm && users.length === 0 && (
            <p className="text-xs text-slate-400">Không tìm thấy user</p>
          )}

          {selectedUser && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {selectedUser.full_name}
                </div>
                <div className="text-xs text-slate-500">
                  {selectedUser.email}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Đã chọn
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Đang gửi..." : "Gửi tặng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftCouponModal;