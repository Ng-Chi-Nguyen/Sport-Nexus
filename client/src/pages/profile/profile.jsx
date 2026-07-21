import { useState, useEffect } from "react";
import {
  Calendar1,
  Mail,
  Phone,
  User,
  Pencil,
  ShieldCheck,
  Package,
  Clock,
  Banknote,
  Eye,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Link } from "react-router-dom";
import orderApi from "@/api/customer/orderApi";
import { statusStyles, statusLabels } from "@/constants/orderStatus";

const Profile = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    orderApi
      .getByEmail(user.email)
      .then((res) => {
        if (res?.data?.success) setOrders(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [user?.email]);

  if (!user) return null;

  const statItems = [
    {
      icon: Mail,
      label: "EMAIL",
      value: user.email,
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: Phone,
      label: "SỐ ĐIỆN THOẠI",
      value: user.phone_number,
      color: "from-orange-400 to-rose-400",
    },
    {
      icon: Calendar1,
      label: "NGÀY TẠO",
      value: formatDate(user.created_at),
      color: "from-purple-500 to-pink-400",
    },
    {
      icon: ShieldCheck,
      label: "CẬP NHẬT",
      value: formatDate(user.updated_at),
      color: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-[3px]">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {user.full_name}
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {user.role?.name || "customer"}
              </span>
            </div>
          </div>
          <Link
            to="/tai-khoan/chinh-sua-thong-tin-ca-nhan"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
                       bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 text-white
                       shadow-[0_2px_10px_rgba(255,107,53,0.2)]
                       hover:shadow-[0_4px_20px_rgba(255,107,53,0.3)]
                       hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Pencil size={13} />
            <span>Sửa</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-xl p-3 border border-gray-100"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} p-[1px]`}
                >
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <item.icon size={14} className="text-gray-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {item.value || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-blue-500" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Đơn hàng gần đây
            </h3>
          </div>
          <Link
            to="/profile/order"
            className="text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline transition-colors"
          >
            Xem tất cả
          </Link>
        </div>

        {loadingOrders ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 mt-2">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">
              Chưa có đơn hàng nào
            </p>
            <Link
              to="/products"
              className="inline-block mt-3 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Mã đơn
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Ngày
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                    Sản phẩm
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Tổng
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Trạng thái
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-gray-800">
                        #{order.code || order.id}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {order.created_at ? formatDate(order.created_at) : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
                      {order.description ||
                        `${order.order_items?.length || 0} sản phẩm`}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-800">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                          ${statusStyles[order.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Eye size={14} />
                      </button>
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
