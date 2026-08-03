import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Camera, User, UserCog } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import userApi from "@/api/customer/userApi";
import { TitleWithIcon } from "@/components/ui/title";

const EditProfile = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedAvatarUrl = user?.avatar;
      if (avatar) {
        const avatarRes = await userApi.uploadAvatar(avatar);
        updatedAvatarUrl =
          avatarRes?.data?.data?.avatar ||
          avatarRes?.data?.avatar ||
          updatedAvatarUrl;
      }

      const res = await userApi.updateProfile(formData);

      if (res?.data?.success || res?.success) {
        const updatedUser = { ...user, ...formData, avatar: updatedAvatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        ShowToast("success", "Cập nhật thông tin thành công!");
        navigate("/tai-khoan");
      } else {
        ShowToast("error", "Cập nhật thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Lỗi khi cập nhật thông tin!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <TitleWithIcon icon={UserCog} title="Chỉnh sửa thông tin cá nhân" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cập nhật chi tiết hồ sơ tài khoản của bạn
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center gap-6">
          <div className="relative group w-20 h-20 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 shrink-0 shadow-sm">
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                <User size={36} />
              </div>
            )}

            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={18} />
              <span className="text-[9px] font-bold mt-0.5">Đổi ảnh</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ảnh đại diện
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hỗ trợ tệp định dạng JPG, PNG hoặc WEBP
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Họ tên
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 text-slate-800 dark:text-slate-100 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 text-slate-800 dark:text-slate-100 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 text-slate-800 dark:text-slate-100 transition-colors shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 max-w-lg">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
