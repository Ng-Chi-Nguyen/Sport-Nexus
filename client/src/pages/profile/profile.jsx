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
    <div className="space-y-8 font-sans">
      {/* Khối Thông Tin Tài Khoản */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Tài khoản
          </h2>
          <Link
            to="/tai-khoan/chinh-sua-thong-tin-ca-nhan"
            className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm italic transition-colors"
          >
            <Pencil size={14} />
            <span>Chỉnh sửa</span>
          </Link>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative group w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User size={36} />
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
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

          <div className="text-sm text-slate-800">
            <p className="font-bold text-base text-slate-900">
              {user.full_name}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {user.role?.name || "Khách hàng"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
            <Mail size={14} className="text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Email
              </p>
              <p className="text-xs font-medium text-slate-800 truncate">
                {user.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
            <Phone size={14} className="text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Điện thoại
              </p>
              <p className="text-xs font-medium text-slate-800">
                {user.phone_number || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md col-span-2 sm:col-span-1">
            <MapPin size={14} className="text-red-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Địa chỉ
              </p>
              {defaultAddr ? (
                <div>
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {formatAddress(defaultAddr)}
                  </p>
                  <Link
                    to="/tai-khoan/dia-chi"
                    className="text-[10px] text-blue-500 hover:underline mt-0.5 inline-block"
                  >
                    Quản lý địa chỉ
                  </Link>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-800">
                  <Link
                    to="/tai-khoan/dia-chi/them"
                    className="text-blue-500 hover:underline"
                  >
                    + Thêm địa chỉ
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
            <ShieldCheck size={14} className="text-purple-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Vai trò
              </p>
              <p className="text-xs font-medium text-slate-800">
                {user.role?.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
            <BadgeCheck
              size={14}
              className={
                (user.is_verified ? "text-emerald-600" : "text-slate-300") +
                " shrink-0"
              }
            />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Trạng thái
              </p>
              <p
                className={`text-xs font-medium ${user.is_verified ? "text-emerald-600" : "text-slate-400"}`}
              >
                {user.is_verified ? "Đã xác thực" : "Chưa xác thực"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
            <Calendar size={14} className="text-amber-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Ngày tham gia
              </p>
              <p className="text-xs font-medium text-slate-800">
                {user.created_at ? formatDate(user.created_at) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Đơn Hàng Của Bạn */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Đơn hàng của bạn
          </h2>
          <Link
            to="/tai-khoan/don-hang"
            className="text-sm text-blue-600 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-slate-500">
            <p className="font-medium mb-1">Chưa có đơn hàng nào</p>
            <p className="text-xs">Khi bạn đặt hàng, đơn hàng sẽ xuất hiện tại đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Thành tiền</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/tai-khoan/don-hang/${order.id}`)}
                    className="text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4">
                      {order.created_at ? formatDate(order.created_at) : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_BADGE[order.payment_status] || ""}`}
                      >
                        {STATUS_PAYMENT[order.payment_status] || order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[order.status] || ""}`}
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
