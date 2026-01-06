import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFrom } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BtnSubmit, BtnGoback } from "@/components/ui/button";
// api
import permissionApi from "@/api/management/permissionApi";
import { MODULE_LABELS, ACTION_OPTIONS } from "@/constants/permission";

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
    title: "Phân quyền",
    route: "/management/permissions",
  },
  {
    title: "Chỉnh sữa quyền",
    route: "#",
  },
];

const CreatePermissionPage = () => {
  const navigate = useNavigate();
  const permissionData = useLoaderData();

  // Dữ liệu gữi đi
  const [selectedRole, setSelectedRole] = useState(permissionData.module);
  const [selectedAction, setSelectedAction] = useState(permissionData.action);
  const [permissionName, setPermissionName] = useState(permissionData.name);
  // -----------
  // console.log(permissionData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. Gom dữ liệu thành một Object
    const formData = {
      name: permissionName,
      module: selectedRole,
      action: selectedAction,
    };

    const response = await permissionApi.update(permissionData.slug, formData);

    if (response.success) {
      navigate(-1);
    }
  };

  //   console.log(permissionData);

  // Chuyển thành arr để phù hợp với component Select
  const moduleOptions = useMemo(() => {
    return Object.entries(MODULE_LABELS).map(([key, value]) => ({
      slug: key,
      name: value,
    }));
  }, []);

  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">
        <h2>Sữa quyền</h2>
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-[10px] w-fit p-4"
        >
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
                    options={moduleOptions}
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
                    options={ACTION_OPTIONS}
                    value={selectedAction}
                    onChange={(val) => setSelectedAction(val)}
                    placeholder="Chọn chức vụ..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <div className="w-fit group flex flex-col flex-col-reverse">
              <BtnGoback />
            </div>
            <div className="w-fit group flex flex-col flex-col-reverse">
              <BtnSubmit name={"Sửa"} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePermissionPage;
