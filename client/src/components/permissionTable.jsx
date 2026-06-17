import { useState, useEffect } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PermissionTable = ({
  allPermissions,
  userPermissions,
  rolePermissions,
  onSave,
}) => {
  const navigate = useNavigate();

  // Logic xử lý dữ liệu từ Object hoặc Array
  const groupedPermissions = Array.isArray(allPermissions)
    ? allPermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
      }, {})
    : allPermissions || {};

  const [selectedExtraIds, setSelectedExtraIds] = useState([]);

  useEffect(() => {
    if (userPermissions) {
      setSelectedExtraIds(userPermissions.map((p) => p.id));
    } else {
      setSelectedExtraIds([]);
    }
  }, [userPermissions]);

  const handleToggle = (id) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const actions = ["Read", "Create", "Update", "Delete"];

  if (!allPermissions || Object.keys(groupedPermissions).length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 animate-pulse font-medium text-sm tracking-wide">
        Đang nạp cấu trúc ma trận quyền hạn...
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* THÀNH PHẦN BẢNG MA TRẬN CHUẨN TỐI */}
      <div className="w-full border border-slate-900/60 rounded-xl overflow-hidden bg-[#0a0f1d]/40 shadow-inner">
        <table className="w-full border-separate border-spacing-0 text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-[#161F32]/60 border-b border-slate-900 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-900/80">
                Module (Chức năng)
              </th>
              {actions.map((action) => (
                <th
                  key={action}
                  className="px-6 py-4 text-center border-b border-slate-900/80"
                >
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <tr
                key={moduleName}
                className="hover:bg-[#161F32]/30 transition-colors duration-100 group"
              >
                {/* Tên danh mục Module bên trái */}
                <td className="px-6 py-4 font-bold text-slate-300 capitalize bg-[#0D121F]/20 border-r border-slate-900/40 group-hover:text-sky-400 transition-colors">
                  {moduleName}
                </td>

                {actions.map((action) => {
                  const perm = perms.find(
                    (p) => p.action.toLowerCase() === action.toLowerCase(),
                  );

                  if (!perm)
                    return (
                      <td
                        key={action}
                        className="text-center text-slate-700 font-mono select-none"
                      >
                        -
                      </td>
                    );

                  const isFromRole = rolePermissions.some(
                    (rp) => rp.id === perm.id,
                  );
                  const isExtra = selectedExtraIds.includes(perm.id);

                  return (
                    <td
                      key={action}
                      className="px-6 py-4 text-center border-r border-slate-900/20 last:border-r-0"
                    >
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className={`w-5 h-5 rounded border-slate-800 bg-[#0D121F] transition-all duration-150
                            ${
                              isFromRole
                                ? "text-emerald-500/40 border-emerald-500/20 cursor-not-allowed opacity-40 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                                : "text-sky-500 border-slate-700 cursor-pointer focus:ring-offset-0 focus:ring-0 checked:bg-sky-500 shadow-sm"
                            }`}
                          checked={isFromRole || isExtra}
                          disabled={isFromRole}
                          onChange={() => handleToggle(perm.id)}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* THANH HÀNH ĐỘNG BIÊN ĐÁY: Chuyển xuống dưới bảng để người dùng cuộn xem xong bấm lưu cực tiện */}
      <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-4 w-full">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-[40px] px-5 bg-slate-900/60 text-slate-400 border border-slate-800 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 hover:text-slate-200 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          Quay lại
        </button>

        <button
          type="button"
          onClick={() => onSave(selectedExtraIds)}
          className="h-[40px] px-6 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2
                     hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all duration-200"
        >
          <Save size={14} />
          Lưu cấp quyền
        </button>
      </div>
    </div>
  );
};

export default PermissionTable;
