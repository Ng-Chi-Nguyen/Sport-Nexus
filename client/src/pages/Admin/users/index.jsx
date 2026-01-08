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
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { BtnAdd } from "@/components/ui/button";
import { SearchTable } from "@/components/ui/search";
import { ConfirmDelete } from "@/components/ui/confirm";
import Pagination from "@/components/ui/pagination";
import { BtnDelete, BtnEdit } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
// api
import userApi from "@/api/management/userApi";
// utils
import { formatToGmt7 } from "@/utils/formatToGmt7";
// lib
import { queryClient } from "@/lib/react-query";

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
      const response = await userApi.delete(deleteTarget); // Gọi API xóa
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        revalidator.revalidate(); // Cập nhật UI
        setIsConfirmOpen(false); // Đóng modal
      }
    } catch (error) {
      // 1. Log để kiểm tra cấu trúc lỗi thực tế trong Console
      console.log("Cấu trúc error nhận được:", error);
      setIsConfirmOpen(false);
      // 2. Lấy thông báo lỗi linh hoạt
      // Nếu có Interceptor: dùng error.message
      // Nếu không có Interceptor: dùng error.response?.data?.message
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
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
                    Người dùng
                  </th>
                  <th scope="col" className="px-6 py-4 font-black text-center">
                    Liên hệ
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
                      <td className="flex items-center px-6 py-4 font-bold text-[#323232] whitespace-nowrap">
                        <div className="w-12 h-12 border border-gray-200 rounded overflow-hidden bg-gray-50">
                          <img
                            src={
                              user.avatar ||
                              "https://placehold.co/200x200/png?text=No+Logo"
                            }
                            alt={user.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="ml-2">
                          <p>{user.full_name}</p>
                          <p className="text-[12px] text-gray-500">
                            Ngày tạo:
                            {formatToGmt7(user.created_at)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-start text-gray-500">
                            {user.email}
                          </span>
                          <Badge color="pink">{user.phone_number}</Badge>
                        </div>
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
                              <BtnDelete
                                name="Xóa"
                                onClick={() => openConfirm(user.id)}
                              />
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
