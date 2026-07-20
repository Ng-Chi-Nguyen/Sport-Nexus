import { Calendar1, Mail, Phone, User, Pencil, ShieldCheck } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { Link } from "react-router-dom";

const Profile = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return null;

  const statItems = [
    { icon: Mail, label: "EMAIL", value: user.email, color: "from-blue-500 to-cyan-400" },
    { icon: Phone, label: "SỐ ĐIỆN THOẠI", value: user.phone_number, color: "from-orange-400 to-rose-400" },
    { icon: Calendar1, label: "NGÀY TẠO", value: formatDate(user.created_at), color: "from-purple-500 to-pink-400" },
    { icon: ShieldCheck, label: "CẬP NHẬT", value: formatDate(user.updated_at), color: "from-emerald-500 to-teal-400" },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        {/* Avatar + Name */}
        <div className="relative flex items-center gap-6 mb-8">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-[3px]">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {user.role?.slug || "customer"}
              </span>
              <span className="text-[11px] text-gray-300">•</span>
              <span className="text-[11px] text-gray-400 font-medium">ID: {String(user.id).slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="relative group bg-gray-50 border border-gray-100 rounded-xl p-4
                         hover:bg-blue-50 hover:border-blue-100 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} p-[1px]`}>
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <item.icon size={15} className="text-gray-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {item.value || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Button */}
        <Link
          to="/profile/edit"
          className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl
                     bg-gradient-to-r from-orange-500 via-rose-500 to-red-600
                     text-white font-black text-sm uppercase tracking-[0.15em]
                     shadow-[0_4px_20px_rgba(255,107,53,0.25)]
                     hover:shadow-[0_6px_30px_rgba(255,107,53,0.35)]
                     hover:scale-[1.01] active:scale-[0.98]
                     transition-all duration-200"
        >
          <Pencil size={15} />
          <span>Chỉnh sửa thông tin</span>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
