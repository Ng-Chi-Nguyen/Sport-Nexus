import { useMemo, useState } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import {
  CheckCheck,
  LayoutDashboard,
  LockOpen,
  Menu,
  X,
  Lock,
} from "lucide-react";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";

import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import userApi from "@/api/management/userApi";

const breadcrumbData = [
  {
    title: <LayoutDashboard size={20} />,
    route: "",
  },
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Người dùng",
    route: "#",
  },
];

const UserPage = () => {
  const responses = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  // 1. Lấy danh sách 6 item cho bảng
  const usersData = responses?.data?.data || {};

  // console.log(responses);
  // 2. Lấy pagination thực tế (bây giờ sẽ là 2)
  const paginationInfo = responses?.data?.pagination || {
    totalPages: 1,
    currentPage: 1,
  };
  // console.log(paginationInfo);
  const allUsers = useMemo(() => {
    if (!usersData) return [];
    // Làm phẳng mảng users để render 6 dòng
    return Object.values(usersData).flat();
  }, [usersData]);

  // LOG KIỂM TRA: Pagination Info lúc này phải hiện totalPages: 2
  // console.log("Pagination Info thực tế:", paginationInfo);
  // LOG để kiểm tra - Bây giờ sẽ hiện Array(6)
  // console.log("Pagination Info:", paginationInfo);
  // console.log("Dữ liệu bảng thực tế:", allusers);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const openConfirm = (email) => {
    setDeleteTarget(email);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await userApi.delete(deleteTarget); // Gọi API xóa
      revalidator.revalidate(); // Cập nhật UI
      setIsConfirmOpen(false); // Đóng modal
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  // console.log(allUsers);

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="p-2">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <SearchTable placeholder="Tìm kiếm quyền hạn..." />
          </div>
          <BtnAdd
            route={"/management/users/create"}
            className="w-[30%]"
            name="Thêm người dùng"
          />
        </div>
      </div>
      <div className="">
        <div className="p-2">
          <h3 className="mb-2">Danh sách người dùng</h3>

          <div className="relative bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-[5px]">
            <table className="w-full text-sm text-left text-[#323232]">
              <thead className="text-sm uppercase bg-primary border-b-2 text-[#fff] border-[#323232]">
                <tr>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Tên
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Số điện thoại
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Xác thực
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Loại tài khoản
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length > 0 ? (
                  allUsers.map((user, index) => (
                    <tr
                      key={user.id || index}
                      className="border-b border-gray-200 hover:bg-blue-200 cursor-pointer transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-bold text-[#323232] whitespace-nowrap">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className=" px-3 py-1 rounded text-[14px] font-bold">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge color="pink">{user.phone_number}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.is_verified ? (
                          <Badge color="green">
                            <CheckCheck />
                          </Badge>
                        ) : (
                          <Badge color="red">
                            <X />
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.role_id !== 5 ? (
                          <Badge color="nexus">{user.role.name}</Badge>
                        ) : (
                          <Badge color="yellow">{user.role.name}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.status ? (
                          <Badge color="green">
                            <LockOpen />
                          </Badge>
                        ) : (
                          <Badge color="red">
                            <Lock />
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        {" "}
                        {/* relative là bắt buộc ở đây */}
                        <div className="flex justify-center items-center">
                          {/* MENU NỔI - Tuyệt đối không chiếm diện tích hàng */}
                          <div
                            className={`absolute right-[70%] top-1/2 -translate-y-1/2 z-50 flex gap-2 items-center transition-all duration-300 ${
                              openMenuId === user.id
                                ? "opacity-100 visible translate-x-0"
                                : "opacity-0 invisible translate-x-4 pointer-events-none"
                            }`}
                          >
                            <div className="flex gap-2 p-1.5 bg-white border-2 border-[#323232] shadow-[4px_4px_0px_0px_#323232] rounded-md">
                              <BtnEdit
                                route={`/management/users/edit/${user.id}`}
                                name="Sửa"
                              />
                              <BtnDelete onClick={() => openConfirm(user.id)} />
                              <BtnAdd
                                route={`/management/users/add-role/${user.id}`}
                                name="Quyền"
                              />

                              {/* Mũi tên nhỏ trỏ vào nút Menu */}
                              <div className="absolute top-1/2 -right-[9px] -translate-y-1/2 w-4 h-4 bg-white border-r-2 border-t-2 border-[#323232] rotate-45 z-[-1]"></div>
                            </div>
                          </div>

                          {/* NÚT ICON BAR CỐ ĐỊNH DIỆN TÍCH */}
                          <button
                            onClick={() => toggleMenu(user.id)}
                            className={`relative z-10 p-2 rounded-md border-2 border-[#323232] transition-all duration-200 ${
                              openMenuId === user.id
                                ? "bg-[#ff5252] text-white shadow-none translate-x-[2px] translate-y-[2px]"
                                : "bg-white text-[#323232] shadow-[3px_3px_0px_0px_#323232] hover:bg-[#4facf3] hover:text-white"
                            }`}
                          >
                            {openMenuId === user.id ? (
                              <X size={18} />
                            ) : (
                              <Menu size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-3 text-center text-gray-400 italic"
                    >
                      Không có quyền nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* HIỂN THỊ PHÂN TRANG */}
          <div className="py-4 border-t-2 border-[#323232] bg-[#f8f9fa]">
            <Pagination
              totalPages={paginationInfo.totalPages}
              currentPage={paginationInfo.currentPage}
              onPageChange={handlePageChange}
            />
          </div>
          <ConfirmDelete
            isOpen={isConfirmOpen}
            title="Xóa người dùng"
            message={`Bạn đang thực hiện xóa người "${deleteTarget}". Dữ liệu này sẽ mất vĩnh viễn khỏi Sport Nexus.`}
            onConfirm={handleDelete}
            onCancel={() => setIsConfirmOpen(false)}
          />
        </div>
      </div>
    </>
  );
};

export default UserPage;
