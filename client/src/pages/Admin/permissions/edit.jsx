import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// components
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFrom } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { BtnSubmit, BtnGoback } from "@/components/ui/button";
// api
import permissionApi from "@/api/management/permissionApi";
// constants
import { MODULE_LABELS, ACTION_OPTIONS } from "@/constants/permission";
// lib
import { queryClient } from "@/lib/react-query";
import { Submit_GoBack } from "@/components/ui/button";

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

    try {
      const response = await permissionApi.update(
        permissionData.slug,
        formData
      );
      // console.log(response);
      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["permissions"] });
        toast.success(response.message);
        navigate(-1);
      }
    } catch (error) {
      console.error(error.message);
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Đã có lỗi xảy ra!";

      toast.error(errorMessage);
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
          className="border border-gray-200 rounded-[10px] w-fit p-4 flex w-fit"
        >
          <div className="w-full flex flex-col gap-4 my-2 items-center">
            <div className="flex gap-3">
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
            <div className="flex items-center gap-3 justify-between">
              <div className="flex flex-col w-fit flex-col-reverse">
                <InputFrom
                  type="text"
                  value={permissionName}
                  onChange={(e) => {
                    setPermissionName(e.target.value);
                  }}
                />
                <Label name="Tên quyền" notNull={true} />
              </div>
              <div className="ml-auto">
                <Submit_GoBack />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePermissionPage;
