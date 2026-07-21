import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Camera, User } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import axiosClient from "@/lib/axiosClient";

const EditProfile = () => {
  const navigate = useNavigate();

  // Lấy dữ liệu user hiện tại từ LocalStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
  });

  // Xử lý gửi Form cập nhật thông tin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Avatar nếu người dùng chọn tệp mới
      let updatedAvatarUrl = user?.avatar;
      if (avatar) {
        const formDataUpload = new FormData();
        formDataUpload.append("avatar", avatar);
        const avatarRes = await axiosClient.post(
          "user/upload-avatar",
          formDataUpload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        updatedAvatarUrl =
          avatarRes?.data?.data?.avatar ||
          avatarRes?.data?.avatar ||
          updatedAvatarUrl;
      }

      // 2. Gửi thông tin cá nhân cập nhật lên API
      const res = await axiosClient.put("user/profile", formData);

      if (res?.data?.success || res?.success) {
        // Cập nhật lại LocalStorage với thông tin mới
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
    <div className="max-w-2xl font-sans select-none">
      {/* Tiêu đề & Nút Quay lại */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Chỉnh sửa thông tin cá nhân
          </h2>
          <p className="text-xs text-slate-500">
            Cập nhật chi tiết hồ sơ tài khoản của bạn
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Ảnh Đại Diện */}
        <div className="flex items-center gap-6">
          <div className="relative group w-20 h-20 rounded-full border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
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
              <div className="w-full h-full flex items-center justify-center text-slate-400">
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
            <p className="text-sm font-bold text-slate-800">Ảnh đại diện</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ tệp định dạng JPG, PNG hoặc WEBP
            </p>
          </div>
        </div>

        {/* Các Trường Nhập Liệu Tối Giản */}
        <div className="space-y-4 max-w-lg text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Họ tên
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-600 text-slate-800"
            />
          </div>
        </div>

        {/* Nút Nhóm Hành Động */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 max-w-lg">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
