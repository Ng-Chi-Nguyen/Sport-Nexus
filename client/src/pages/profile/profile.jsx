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
  UserCheck,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import ShowToast from "@/components/ui/toast";
import userApi from "@/api/customer/userApi";
import { TitleWithIcon } from "@/components/ui/title";
import { useTranslation } from "react-i18next";
import MembershipBlock from "@/components/customer/MembershipBlock";

const Profile = () => {
  const { t: tProfile } = useTranslation("translation", {
    keyPrefix: "profile",
  });
  const { t: tAddress } = useTranslation("translation", {
    keyPrefix: "address",
  });
  const { t: tOrder } = useTranslation("translation", { keyPrefix: "order" });

  const { user, orders, addresses } = useLoaderData();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ShowToast("error", "Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await userApi.uploadAvatar(file);
      const newAvatarUrl = res?.data?.data?.avatar || res?.data?.avatar;

      if (newAvatarUrl) {
        const updatedUser = { ...user, avatar: newAvatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        ShowToast("success", "Cập nhật ảnh đại diện thành công!");
      } else {
        ShowToast("error", "Không nhận được đường dẫn ảnh từ máy chủ!");
      }
    } catch (err) {
      ShowToast(
        "error",
        err?.response?.data?.message || "Tải ảnh đại diện thất bại!",
      );
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

  // Hàm style cho trạng thái thanh toán
  const getPaymentBadgeStyle = (status) => {
    const isPaid = status === "Paid";
    return isPaid
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-block"
      : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-block";
  };

  // Hàm style cho trạng thái đơn hàng
  const getOrderStatusStyle = (status) => {
    if (status === "Delivered")
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-block";
    if (status === "Cancelled")
      return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-block";
    return "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-block";
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Khối Thông Tin Tài Khoản */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <TitleWithIcon
            icon={UserCheck}
            title={tProfile("account", "Tài khoản")}
          />
          <Link
            to="/tai-khoan/chinh-sua-thong-tin-ca-nhan"
            className="flex items-center gap-1.5 text-primary dark:text-primary hover:primaryHOver dark:hover:primaryHover text-sm font-semibold transition-colors"
          >
            <Pencil size={14} />
            <span>{tProfile("edit", "Chỉnh sửa")}</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group w-20 h-20 border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 shrink-0 shadow-sm">
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
                {uploadingAvatar ? "Đang tải..." : tProfile("edit", "Đổi ảnh")}
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
              {user.role?.name || tProfile("customer")}
            </p>
          </div>
        </div>

        <MembershipBlock />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <Mail
              size={16}
              className="text-sky-600 dark:text-sky-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {tProfile("email")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {user.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <Phone
              size={16}
              className="text-emerald-600 dark:text-emerald-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {tProfile("phone")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.phone_number || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm sm:col-span-2 lg:col-span-1">
            <MapPin
              size={16}
              className="text-rose-600 dark:text-rose-400 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {tProfile("address")}
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
                    {tProfile("manage_address")}
                  </Link>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  <Link
                    to="/tai-khoan/dia-chi/them"
                    className="text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {tAddress("add_address")}
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <ShieldCheck
              size={16}
              className="text-purple-600 dark:text-purple-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {tProfile("role")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.role?.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
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
                {tProfile("status", "Trạng thái")}
              </p>
              <p
                className={`text-xs font-semibold mt-0.5 ${user.is_verified ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
              >
                {user.is_verified
                  ? tProfile("verified", "Đã xác thực")
                  : tProfile("unverified", "Chưa xác thực")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <Calendar
              size={16}
              className="text-amber-600 dark:text-amber-400 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {tProfile("joined_date", "Ngày tham gia")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {user.created_at ? formatDate(user.created_at) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Đơn Hàng Của Bạn */}
      <div className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            {tProfile("recent_orders", "Đơn hàng gần đây")}
          </h2>
          <Link
            to="/tai-khoan/don-hang"
            className="text-sm font-semibold text-primary dark:text-primary hover:underline"
          >
            {tProfile("view_all", "Xem tất cả")}
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#111827]/40">
            <p className="font-semibold mb-1 text-slate-700 dark:text-slate-300">
              {tOrder("no_orders", "Chưa có đơn hàng nào")}
            </p>
            <p className="text-xs">
              {tOrder(
                "no_orders_desc",
                "Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây",
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827]/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">
                    {tOrder("order_code", "Mã đơn hàng")}
                  </th>
                  <th className="py-3.5 px-4">
                    {tOrder("order_date", "Ngày đặt")}
                  </th>
                  <th className="py-3.5 px-4">
                    {tOrder("total_amount", "Thành tiền")}
                  </th>
                  <th className="py-3.5 px-4">
                    {tOrder("payment_method", "Thanh toán")}
                  </th>
                  <th className="py-3.5 px-4">
                    {tOrder("order_status", "Trạng thái")}
                  </th>
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
                        className={getPaymentBadgeStyle(order.payment_status)}
                      >
                        {STATUS_PAYMENT[order.payment_status] ||
                          order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={getOrderStatusStyle(order.status)}>
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
