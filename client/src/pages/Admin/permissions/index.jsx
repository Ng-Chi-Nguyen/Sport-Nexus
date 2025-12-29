import { useLoaderData } from "react-router-dom";
import React, { useMemo } from "react";

import Breadcrumbs from "@/components/ui/breadcrumbs";
import { Button3DLink } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { PERMISSION_TRANSLATIONS } from "@/constants/permission";
import Badge from "@/components/ui/badge";
import { BtnDelete, BtnEdit } from "@/components/ui/button";

const breadcrumbData = [
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Phân quyền",
    route: "#",
  },
];

const ACTION_COLORS = {
  create: "green", // Thêm mới
  read: "blue", // Xem
  update: "yellow", // Cập nhật
  delete: "red", // Xóa
};

const PermissionPagePage = () => {
  const groupedData = useLoaderData();

  const allPermissions = useMemo(() => {
    if (!groupedData) return [];

    // Làm phẳng mảng và dịch sang tiếng Việt
    return Object.values(groupedData)
      .flat()
      .map((item) => ({
        ...item,
        // Dịch module
        moduleVi: PERMISSION_TRANSLATIONS.modules[item.module] || item.module,
        // Dịch hành động
        actionVi: PERMISSION_TRANSLATIONS.actions[item.action] || item.action,
        // Tạo nhãn đầy đủ: ví dụ "Thêm mới Người dùng"
        fullName: `${PERMISSION_TRANSLATIONS.actions[item.action] || ""} ${
          PERMISSION_TRANSLATIONS.modules[item.module] || ""
        }`,
      }));
  }, [groupedData]);

  // console.log(allPermissions);

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />

      <div className="p-2 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-[80%] relative group">
            <SearchTable placeholder="Tìm kiếm quyền hạn..." />
          </div>
          <Button3DLink
            route={"/management/permissions/create"}
            className="w-[20%]"
            name="Thêm quyền"
          />
        </div>
      </div>

      <div className="p-2 mt-6">
        <h3 className="font-black text-xl mb-4 uppercase text-[#323232]">
          Danh sách các quyền
        </h3>

        {/* 2. Container bảng với bóng đổ Sport Nexus */}
        <div className="relative overflow-x-auto bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-[5px]">
          <table className="w-full text-sm text-left text-[#323232]">
            <thead className="text-sm uppercase bg-[#f8f9fa] border-b-2 border-[#323232]">
              <tr>
                <th scope="col" className="px-6 py-4 font-black">
                  Tên quyền hạn
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Bảng dữ liệu
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Hành động
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Mã (Slug)
                </th>
                <th scope="col" className="px-6 py-4 font-black text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {allPermissions.length > 0 ? (
                allPermissions.map((permission, index) => (
                  <tr
                    key={permission.id || index}
                    className="border-b border-gray-200 hover:bg-[#4facf310] transition-colors duration-200"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-bold text-[#323232] whitespace-nowrap"
                    >
                      {permission.fullName}
                    </th>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 px-3 py-1 rounded border border-[#323232] text-[12px] font-bold">
                        {permission.moduleVi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={ACTION_COLORS[permission.action] || "gray"}>
                        {permission.actionVi}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-500">
                      {permission.slug}
                    </td>
                    <td className="flex px-6 gap-3 py-4 text-center justify-center font-mono text-gray-500">
                      <BtnEdit
                        route={`/management/permissions/edit/${permission.slug}`}
                      />
                      <BtnDelete />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Chưa có dữ liệu quyền hạn...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PermissionPagePage;
