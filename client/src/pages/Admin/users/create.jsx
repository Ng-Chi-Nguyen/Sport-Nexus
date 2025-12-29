import Breadcrumbs from "@/components/ui/breadcrumbs";
import { InputFrom, InputPassword } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { InputFile } from "@/components/ui/input";
import { ToogleSwitchBlue3D } from "@/components/ui/toogleSwitch";
import { useState } from "react";

const breadcrumbData = [
  {
    title: "Quản lý người dùng & phần quyền",
    route: "",
  },
  {
    title: "Người dùng",
    route: "/management/users",
  },
  {
    title: "Thêm khách hàng",
    route: "#",
  },
];

const CreateUserPage = () => {
  const [showPermissions, setShowPermissions] = useState(false);
  const handleToggle = () => {
    setShowPermissions(!showPermissions);
  };
  return (
    <>
      <Breadcrumbs data={breadcrumbData} />
      <div className="">
        <h2 className="mb-2">Thêm người dùng</h2>
        <form>
          <div className="flex my-2">
            <div className="flex my-2 w-1/4 p-3 justify-center">
              <InputFile label="Ảnh đại diện" />
            </div>
            <div className="w-1/3">
              <div className="flex flex-col flex-col-reverse m-3">
                <InputFrom type="text" />
                <Label name="Tên người dùng" notNull={true} />
              </div>
              <div className="flex flex-col flex-col-reverse m-3">
                <InputFrom type="email" />
                <Label name="Email" notNull={true} />
              </div>
              <div className="flex flex-col flex-col-reverse m-3">
                <InputFrom type="phone" />
                <Label name="Số điện thoại" notNull={true} />
              </div>
              <div className="flex flex-col flex-col-reverse m-3">
                <InputPassword type="password" />
                <Label name="Mật khẩu" notNull={true} />
              </div>
            </div>

            <div className="flex my-2 w-1/3 border border-black-500 flex-col">
              <div className="w-full h-[25px]">
                <ToogleSwitchBlue3D
                  checked={showPermissions}
                  onChange={handleToggle}
                />
                <Label name={showPermissions ? "Quản lý" : "Thường"} />
              </div>
              {showPermissions ? (
                <>
                  <div className="">ok</div>
                </>
              ) : (
                <>
                  <div className="">not ok</div>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateUserPage;
