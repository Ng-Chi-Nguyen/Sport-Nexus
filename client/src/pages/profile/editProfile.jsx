import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { FloatingInput } from "@/components/ui/input";
import ShowToast from "@/components/ui/toast";

const EditProfile = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      ShowToast("success", "Cập nhật thành công");
      setLoading(false);
      navigate("/profile");
    }, 1000);
  };

  return (
    <div className="max-w-2xl">
      <div className="relative bg-white rounded-2xl p-3 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center
                       text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:border-gray-300
                       transition-all duration-200"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Chỉnh sửa thông tin
            </h2>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Cập nhật hồ sơ của bạn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-[3px]">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-gray-300" />
                  )}
                </div>
              </div>
              <label
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500
                                flex items-center justify-center cursor-pointer shadow-md
                                hover:scale-105 active:scale-95 transition-transform"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </label>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-3 uppercase tracking-wider">
              Ảnh đại diện
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <FloatingInput
              id="full_name"
              label="Họ tên"
              light
              defaultValue={user?.full_name || ""}
            />
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              light
              defaultValue={user?.email || ""}
            />
            <FloatingInput
              id="phone"
              label="Số điện thoại"
              type="tel"
              light
              defaultValue={user?.phone_number || ""}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-white
                         text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300
                         text-sm font-bold uppercase tracking-wider transition-all duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-[0.12em]
                         bg-gradient-to-r from-orange-500 via-rose-500 to-red-600
                         text-white shadow-[0_4px_20px_rgba(255,107,53,0.25)]
                         hover:shadow-[0_6px_30px_rgba(255,107,53,0.35)]
                         hover:scale-[1.01] active:scale-[0.98]
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
