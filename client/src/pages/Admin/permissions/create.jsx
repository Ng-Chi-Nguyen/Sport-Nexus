import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFrom } from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import { ButtonSubmit } from "@/components/ui/button";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { ButtonGoback } from "@/components/ui/button";
import permissionApi from "@/api/permissionApi";

const breadcrumbData = [
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Phân quyền",
    route: "/management/permissions",
  },
  {
    title: "Thêm quyền",
    route: "#",
  },
];

const CreatePermissionPage = () => {
  const navigate = useNavigate();

  // Dữ liệu gữi đi
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [permissionName, setPermissionName] = useState("");
  // -----------

  const moduleLabels = {
    users: "👤 Quản lý Người dùng",
    roles: "🔑 Vai trò & Phân quyền",
    permissions: "🛡️ Danh mục Quyền hạn",
    products: "📦 Sản phẩm",
    categories: "📂 Danh mục Sản phẩm",
    brands: "🏷️ Thương hiệu",
    orders: "🛒 Đơn hàng",
    coupons: "🎟️ Mã giảm giá",
    suppliers: "🏭 Nhà cung cấp",
    purchaseorders: "📝 Đơn nhập hàng",
    stockmovements: "📉 Biến động kho",
    reviews: "⭐ Đánh giá khách hàng",
    systemlogs: "📋 Nhật ký hệ thống",
  };

  const actionOptions = [
    { slug: "create", name: "✨ Thêm mới (Create)" },
    { slug: "read", name: "👁️ Xem dữ liệu (Read)" },
    { slug: "update", name: "📝 Chỉnh sửa (Update)" },
    { slug: "delete", name: "🗑️ Xóa dữ liệu (Delete)" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang web tải lại

    // 2. Gom dữ liệu thành một Object
    const formData = {
      name: permissionName,
      module: selectedRole,
      action: selectedAction,
    };

    const response = await permissionApi.create(formData);

    if (response.success) {
      navigate(-1);
    }
  };

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">
        <h2>Thêm quyền</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex w-full">
            <div className="w-full flex gap-4 my-2">
              <div className="flex flex-col w-1/4 flex-col-reverse">
                <InputFrom
                  type="text"
                  value={permissionName}
                  onChange={(e) => {
                    setPermissionName(e.target.value);
                  }}
                />
                <Label name="Tên quyền" notNull={true} />
              </div>
              <div className="relative w-fit group flex flex-col flex-col-reverse">
                {/* Nhãn nằm đè lên border */}
                <label className="absolute top-0 left-2 bg-white px-1 z-[110] text-[12px] font-bold text-[#323232] transition-colors group-focus-within:text-[#4facf3]">
                  Áp dụng cho bảng <span className="text-red-500">*</span>
                </label>

                <div className="w-full">
                  <Select
                    options={moduleLabels}
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val)}
                    placeholder="Chọn chức vụ..."
                  />
                </div>
              </div>
              <div className="relative w-fit group flex flex-col flex-col-reverse">
                {/* Nhãn nằm đè lên border */}
                <label className="absolute top-0 left-2 bg-white px-1 z-[110] text-[12px] font-bold text-[#323232] transition-colors group-focus-within:text-[#4facf3]">
                  Áp dụng cho bảng <span className="text-red-500">*</span>
                </label>

                <div className="w-full">
                  <Select
                    options={actionOptions}
                    value={selectedAction}
                    onChange={(val) => setSelectedAction(val)}
                    placeholder="Chọn chức vụ..."
                  />
                </div>
              </div>
              <div className="w-fit group flex flex-col flex-col-reverse">
                <ButtonSubmit name={"Thêm"} />
              </div>
              <div className="w-fit group flex flex-col flex-col-reverse">
                <ButtonGoback />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePermissionPage;
