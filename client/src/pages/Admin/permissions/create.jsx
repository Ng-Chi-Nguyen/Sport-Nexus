import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  // state select chọn bảng
  // ----------

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
        <h2>Thêm quyền</h2>
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
                <div className="w-full">
                  <Select
                    label="Chọn chức vụ"
                    options={moduleOptions}
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val)}
                  />
                </div>
              </div>
              <div className="relative w-fit group flex flex-col flex-col-reverse">
                <div className="w-full">
                  <Select
                    label="Áp dụng cho bảng"
                    options={ACTION_OPTIONS}
                    value={selectedAction}
                    onChange={(val) => setSelectedAction(val)}
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
              <BtnSubmit name={"Thêm"} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePermissionPage;
