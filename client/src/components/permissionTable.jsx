import { useState, useEffect } from "react";
import { BtnGoback } from "./ui/button";

const PermissionTable = ({
  allPermissions,
  userPermissions,
  rolePermissions,
  onSave,
}) => {
  // Logic xử lý dữ liệu từ Object hoặc Array
  const groupedPermissions = Array.isArray(allPermissions)
    ? allPermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
      }, {})
    : allPermissions || {};

  const [selectedExtraIds, setSelectedExtraIds] = useState([]);
  // console.log(groupedPermissions);
  useEffect(() => {
    if (userPermissions) {
      setSelectedExtraIds(userPermissions.map((p) => p.id));
    } else {
      setSelectedExtraIds([]);
    }
  }, [userPermissions]);

  const handleToggle = (id) => {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const actions = ["Read", "Create", "Update", "Delete"];

  if (!allPermissions || Object.keys(groupedPermissions).length === 0) {
    return <div className="p-5 text-center">Đang tải danh sách quyền...</div>;
  }

  // console.log("--- DEBUG PERMISSION TABLE ---");
  // console.log("1. allPermissions (Raw):", allPermissions);
  // console.log("2. userPermissions (Raw):", userPermissions);
  // console.log("3. rolePermissions (Raw):", rolePermissions);
  // console.log("4. selectedExtraIds (State):", selectedExtraIds);

  return (
    <div className="overflow-x-auto shadow-md rounded-lg mt-5">
      <div className="w-fit flex gap-3 justify-end pb-4 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => onSave(selectedExtraIds)}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          LƯU CẤP QUYỀN
        </button>
        <BtnGoback />
      </div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-primary border-b">
          <tr>
            <th className="px-6 py-3">Module (Chức năng)</th>
            {actions.map((action) => (
              <th key={action} className="px-6 py-3 text-center">
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
            <tr key={moduleName} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-bold text-gray-900 capitalize border-r bg-gray-50/50">
                {moduleName}
              </td>
              {actions.map((action) => {
                const perm = perms.find(
                  (p) => p.action.toLowerCase() === action.toLowerCase()
                );

                if (!perm)
                  return (
                    <td key={action} className="text-center text-gray-300">
                      -
                    </td>
                  );

                const isFromRole = rolePermissions.some(
                  (rp) => rp.id === perm.id
                );
                const isExtra = selectedExtraIds.includes(perm.id);

                return (
                  <td key={action} className="px-6 py-4 text-center border-l">
                    <input
                      type="checkbox"
                      className={`w-5 h-5 rounded border-gray-300 ${
                        isFromRole
                          ? "text-blue-300 cursor-not-allowed opacity-50"
                          : "text-blue-600 cursor-pointer"
                      }`}
                      checked={isFromRole || isExtra}
                      disabled={isFromRole}
                      onChange={() => handleToggle(perm.id)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// QUAN TRỌNG: Dòng này phải có để không bị lỗi "does not provide an export named default"
export default PermissionTable;
