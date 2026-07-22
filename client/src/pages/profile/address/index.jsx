import { useLoaderData, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Check,
} from "lucide-react";
import ShowToast from "@/components/ui/toast";
import addressApi from "@/api/customer/addressApi";
import Badge from "@/components/ui/badge";
import { TYPE_LABEL, TYPE_ICON } from "@/constants/web/profile";

const AddressList = () => {
  const navigate = useNavigate();
  const { addresses, user } = useLoaderData();

  const handleDelete = async (id) => {
    try {
      await addressApi.delete(id);
      ShowToast("success", "Xoá địa chỉ thành công");
      window.location.reload();
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Xoá địa chỉ thất bại",
      );
    }
  };

  const handleSetDefault = async (addr) => {
    if (addr.is_default) return;
    try {
      await addressApi.update(addr.id, { is_default: true, user_id: user.id });
      ShowToast("success", "Đã đặt làm mặc định");
      window.location.reload();
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message || "Cập nhật thất bại",
      );
    }
  };

  const formatAddress = (addr) => {
    const loc = addr.location_data || {};
    const parts = [
      addr.detail_address,
      loc.ward?.name,
      loc.district?.name,
      loc.province?.name,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        Vui lòng đăng nhập để quản lý địa chỉ
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex-1">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Sổ địa chỉ
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/tai-khoan/dia-chi/them")}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
        >
          <Plus size={15} />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Bạn chưa có địa chỉ nào</p>
          <button
            type="button"
            onClick={() => navigate("/tai-khoan/dia-chi/them")}
            className="mt-3 text-blue-600 text-sm font-bold hover:underline"
          >
            Thêm địa chỉ mới
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const TypeIcon = TYPE_ICON[addr.type] || MapPin;
            return (
              <div
                key={addr.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {addr.recipient_name}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600 text-sm">
                        {addr.recipient_phone}
                      </span>
                      {addr.is_default && (
                        <Badge color="green_bold">
                          <Check size={12} className="mr-2" />
                          Mặc định
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {formatAddress(addr)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      <TypeIcon size={12} />
                      {TYPE_LABEL[addr.type] || addr.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/tai-khoan/dia-chi/sua/${addr.id}`)
                      }
                      className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xoá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressList;
