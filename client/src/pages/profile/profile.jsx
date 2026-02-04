import { Calendar1, Mail, PenLine, Smartphone } from "lucide-react";
import { BtnEdit } from "@/components/ui/button";
import { formatDate } from "@/utils/formatters";

const Profile = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  return (
    <div className="relative z-10">
      <h2>Thông tin cơ bản</h2>
      <div className="mt-2 pl-4">
        <div className="flex items-center my-2">
          <div className="bg-[#f99ae8] w-fit p-2">
            <Mail color="#f312c9" />
          </div>
          <div className="ml-2">
            <p className="font-bold text-gray-600 text-[14px]">EMAIL</p>
            <p className="font-bold">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center my-2">
          <div className="bg-[#7a90ff] w-fit p-2">
            <Smartphone color="#5131f2" />
          </div>
          <div className="ml-2">
            <p className="font-bold text-gray-600 text-[14px]">SỐ ĐIỆN THOẠI</p>
            <p className="font-bold">{user.phone_number}</p>
          </div>
        </div>
      </div>
      <h2>Hoạt động tài khoản</h2>
      <div className="flex gap-8">
        <div className="flex items-center my-2">
          <div className="w-fit p-2">
            <Calendar1 />
          </div>
          <div className="ml-2">
            <p className="font-bold text-gray-600 text-[14px]">Ngày tạo</p>
            <p className="text-[14px">{formatDate(user.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center my-2">
          <div className="w-fit p-2">
            <PenLine />
          </div>
          <div className="ml-2">
            <p className="font-bold text-gray-600 text-[14px]">
              Ngày cập nhật gần nhất
            </p>
            <p className="text-[14px]">{formatDate(user.updated_at)}</p>
          </div>
        </div>
      </div>
      <div className="w-fit">
        <BtnEdit route="edit" name="Chỉnh sữa thông tin" />
      </div>
    </div>
  );
};

export default Profile;
