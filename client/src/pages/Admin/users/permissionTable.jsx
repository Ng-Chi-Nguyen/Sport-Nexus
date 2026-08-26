import { useState, useEffect } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MODULE_LABELS } from "@/constants/permission";

const PermissionTable = ({
  allPermissions = {},
  userPermissions = [],
  onSave,
}) => {
  const { t } = useTranslation("translation", { keyPrefix: "permission" });
  const { t: tc } = useTranslation("translation", { keyPrefix: "constants" });
  const navigate = useNavigate();
  const actions = ["Read", "Create", "Update", "Delete", "Gift"];

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (Array.isArray(userPermissions)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds(userPermissions.map((p) => p?.id).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  }, [userPermissions]);

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSaveData = () => {
    if (onSave) {
      onSave(selectedIds);
    }
  };

  if (!allPermissions || Object.keys(allPermissions).length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 animate-pulse font-medium text-sm tracking-wide">
        {t("loading_matrix")}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Bao bọc bằng div overflow-x-auto để mobile không bị bóp méo bảng */}
      <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#0a0f1d]/40 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm text-left min-w-[550px]">
            <thead className="text-xs text-slate-600 dark:text-slate-400 uppercase bg-slate-100 dark:bg-[#161F32]/60 border-b border-slate-200 dark:border-slate-900 font-semibold tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800">
                  {t("module_function_col")}
                </th>
                {actions.map((action) => (
                  <th
                    key={action}
                    className="px-3 sm:px-6 py-3.5 text-center border-b border-slate-200 dark:border-slate-800"
                  >
                    {t(`action.${action.toLowerCase()}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
              {Object.entries(allPermissions).map(([moduleName, perms]) => (
                <tr
                  key={moduleName}
                  className="hover:bg-slate-50 dark:hover:bg-[#161F32]/30 transition-colors duration-100 group"
                >
                  <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-700 dark:text-slate-300 capitalize bg-slate-50/50 dark:bg-[#0D121F]/20 border-r border-slate-200 dark:border-slate-900/40 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-xs sm:text-sm whitespace-nowrap">
                    {MODULE_LABELS[moduleName]
                      ? tc(MODULE_LABELS[moduleName])
                      : moduleName}
                  </td>

                  {actions.map((action) => {
                    const perm =
                      Array.isArray(perms) &&
                      perms.find((p) => {
                        const rawValue = p.action || p.name || p.type || p.code;
                        if (!rawValue) return false;

                        const dbValue = String(rawValue).toLowerCase();
                        const uiValue = action.toLowerCase();

                        if (
                          uiValue === "read" &&
                          (dbValue === "xem" ||
                            dbValue === "read" ||
                            dbValue === "view")
                        )
                          return true;
                        if (
                          uiValue === "create" &&
                          (dbValue === "them" ||
                            dbValue === "create" ||
                            dbValue === "add")
                        )
                          return true;
                        if (
                          uiValue === "update" &&
                          (dbValue === "sua" ||
                            dbValue === "update" ||
                            dbValue === "edit")
                        )
                          return true;
                        if (
                          uiValue === "delete" &&
                          (dbValue === "xoa" ||
                            dbValue === "delete" ||
                            dbValue === "remove")
                        )
                          return true;
                        if (
                          uiValue === "gift" &&
                          (dbValue === "tang" ||
                            dbValue === "gift" ||
                            dbValue === "tặng")
                        )
                          return true;

                        return dbValue === uiValue;
                      });

                    if (!perm) {
                      return (
                        <td
                          key={action}
                          className="text-center text-slate-300 dark:text-slate-700 font-mono select-none"
                        >
                          -
                        </td>
                      );
                    }

                    const isChecked = selectedIds.includes(perm.id);

                    return (
                      <td
                        key={action}
                        className="px-3 sm:px-6 py-3.5 text-center border-r border-slate-100 dark:border-slate-900/20 last:border-r-0"
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D121F] text-sky-600 dark:text-sky-500 cursor-pointer focus:ring-offset-0 focus:ring-0 checked:bg-sky-500 shadow-sm"
                            checked={isChecked}
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
      </div>

      {/* Cụm nút bấm thao tác ở chân trang */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/5 pt-4 mt-4 w-full">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-[38px] px-4 sm:px-5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold uppercase tracking-wider hover:bg-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} /> {t("go_back")}
        </button>

        <button
          type="button"
          onClick={handleSaveData}
          className="h-[38px] px-5 sm:px-6 bg-primary text-[#FFF] border border-primary dark:text-[#FFF] dark:border-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primaryHover hover:text-white hover:border-sky-500 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <Save size={14} /> {t("save_permissions")}
        </button>
      </div>
    </div>
  );
};

export default PermissionTable;
