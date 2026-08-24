import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Pencil, Trash2, MapPin, Check, BookUser } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import addressApi from "@/api/customer/addressApi";
import Badge from "@/components/ui/badge";
import { TYPE_LABEL, TYPE_ICON } from "@/constants/web/profile";
import { TitleWithIcon } from "@/components/ui/title";
import { BtnAdd } from "@/components/ui/button"; // <--- Import component nút thêm ở đây
import { useTranslation } from "react-i18next";

const AddressList = () => {
  const { t } = useTranslation("translation", { keyPrefix: "address" });
  const navigate = useNavigate();
  const { addresses: initialAddresses, user } = useLoaderData();
  const [addresses, setAddresses] = useState(initialAddresses || []);

  const handleDelete = async (id) => {
    try {
      await addressApi.delete(id);
      ShowToast("success", "Xoá địa chỉ thành công");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
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
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === addr.id })),
      );
    } catch (error) {
      ShowToast("error", error?.response?.data?.message || "Cập nhật thất bại");
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
      <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
        {t("login_required")}
      </div>
    );
  }

  return (
    <div className="text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* HEADER: Dùng component BtnAdd thay vì viết chay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <TitleWithIcon icon={BookUser} title={t("address_book")} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("manage_address_desc")}
          </p>
        </div>

        {/* Gọi component BtnAdd có sẵn */}
        <BtnAdd
          route="/tai-khoan/dia-chi/them"
          name={t("add_address")}
          className="w-full sm:w-auto"
        />
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-md px-4">
          <MapPin
            size={48}
            className="mx-auto mb-3 opacity-40 text-slate-400 dark:text-slate-500"
          />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("no_addresses", "Bạn chưa có địa chỉ nào")}
          </p>

          {/* Ở đây cũng có thể tái sử dụng BtnAdd thay vì dùng thẻ button thuần */}
          <div className="mt-3 inline-block">
            <BtnAdd
              route="/tai-khoan/dia-chi/them"
              name={t("add_new_address")}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const TypeIcon = TYPE_ICON[addr.type] || MapPin;
            return (
              <div
                key={addr.id}
                className="bg-white dark:bg-[#0D121F]/40 border border-slate-200 dark:border-slate-900 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl backdrop-blur-md hover:border-sky-300 dark:hover:border-sky-500/40 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {addr.recipient_name}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                        |
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {addr.recipient_phone}
                      </span>
                      {addr.is_default && (
                        <Badge color="green_bold">
                          <Check size={12} className="mr-1.5" />
                          {t("default_label")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[13px] sm:text-sm leading-relaxed">
                      {formatAddress(addr)}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold uppercase text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2.5 py-1 rounded-md">
                      <TypeIcon size={12} />
                      {TYPE_LABEL[addr.type] || addr.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors cursor-pointer"
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
                      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
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
