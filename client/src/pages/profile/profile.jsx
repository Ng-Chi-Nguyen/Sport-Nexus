import { useRef, useState } from "react";
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Camera,
  User,
  Pencil,
  Mail,
  Calendar,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import { STATUS_BADGE, PAYMENT_BADGE } from "@/constants/web/profile";
import { toast } from "sonner";
import userApi from "@/api/customer/userApi";

const Profile = () => {
  const { user, orders, addresses } = useLoaderData();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await userApi.uploadAvatar(file);
      const newAvatarUrl = res?.data?.data?.avatar || res?.data?.avatar;

      if (newAvatarUrl) {
        const updatedUser = { ...user, avatar: newAvatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Cập nhật ảnh đại diện thành công!");
      } else {
        toast.error("Không nhận được đường dẫn ảnh từ máy chủ!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tải ảnh đại diện thất bại!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const defaultAddr = addresses.find((a) => a.is_default);

  const formatAddress = (addr) => {
    if (!addr) return "";
    const loc = addr.location_data || {};
    return [addr.detail_address, loc.ward?.name, loc.province?.name]
      .filter(Boolean)
      .join(", ");
  };

  if (!user) return null;

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Khối Thông Tin Tài Khoản */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            Tài khoản
          </h2>
          <Link
            to="/tai-khoan/chinh-sua-thong-tin-ca-nhan"
            className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-semibold transition-colors"
          >
            <Pencil size={14} />
            <span>Chỉnh sửa</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 shrink-0 shadow-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                <User size={36} />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Đổi ảnh đại diện"
            >
              <Camera size={18} />
              <span className="text-[9px] font-bold mt-0.5">
                {uploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="text-sm">
            <p className="font-bold text-base text-slate-900 dark:text-slate-100">
              {user.full_name}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
              {user.role?.name || "Khách hàng"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
            <Mail
              size={16}
              className="text-sky-600 dark:text-sky-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Email
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {user.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
            <Phone
              size={16}
              className="text-emerald-600 dark:text-emerald-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Điện thoại
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.phone_number || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm sm:col-span-2 lg:col-span-1">
            <MapPin
              size={16}
              className="text-rose-600 dark:text-rose-400 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Địa chỉ
              </p>
              {defaultAddr ? (
                <div className="mt-0.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {formatAddress(defaultAddr)}
                  </p>
                  <Link
                    to="/tai-khoan/dia-chi"
                    className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline mt-0.5 inline-block font-semibold"
                  >
                    Quản lý địa chỉ
                  </Link>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  <Link
                    to="/tai-khoan/dia-chi/them"
                    className="text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    + Thêm địa chỉ
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
            <ShieldCheck
              size={16}
              className="text-purple-600 dark:text-purple-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Vai trò
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.role?.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
            <BadgeCheck
              size={16}
              className={`${
                user.is_verified
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-300 dark:text-slate-600"
              } shrink-0`}
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Trạng thái
              </p>
              <p
                className={`text-xs font-semibold mt-0.5 ${user.is_verified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
              >
                {user.is_verified ? "Đã xác thực" : "Chưa xác thực"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm">
            <Calendar
              size={16}
              className="text-amber-600 dark:text-amber-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Ngày tham gia
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.created_at ? formatDate(user.created_at) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Đơn Hàng Của Bạn */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            Đơn hàng gần đây
          </h2>
          <Link
            to="/tai-khoan/don-hang"
            className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#111827]/40">
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Chưa có đơn hàng nào
            </p>
            <p className="text-xs">
              Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">Mã đơn hàng</th>
                  <th className="py-3.5 px-4">Ngày đặt</th>
                  <th className="py-3.5 px-4">Thành tiền</th>
                  <th className="py-3.5 px-4">Thanh toán</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/tai-khoan/don-hang/${order.id}`)}
                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-sky-600 dark:text-sky-400">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.created_at ? formatDate(order.created_at) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${PAYMENT_BADGE[order.payment_status] || ""}`}
                      >
                        {STATUS_PAYMENT[order.payment_status] ||
                          order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_BADGE[order.status] || ""}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
