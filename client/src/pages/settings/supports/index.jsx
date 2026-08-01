import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ShowToast from "@/components/ui/toast";
import { LabelInput } from "@/components/ui/input";
import supportApi from "@/api/customer/settings/support";

const Support = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.message) {
      ShowToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      const res = await supportApi.sendEmail(formData);
      if (res?.data?.success || res?.success) {
        ShowToast("success", "Yêu cầu của bạn đã được gửi thành công!");
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        ShowToast("error", res?.data?.message || "Gửi yêu cầu thất bại!");
      }
    } catch (error) {
      ShowToast(
        "error",
        error?.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng thử lại sau!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-[1400px] px-4 pt-4 md:pt-6 mt-10">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Hỗ trợ khách hàng", route: "/ho-tro" },
          ]}
        />

        {/* Header Section */}
        <div className="mt-6 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <HelpCircle className="w-3.5 h-3.5" />
            Trung tâm trợ giúp
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Liên Hệ & Hỗ Trợ
          </h3>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Bạn có thắc mắc hoặc cần giúp đỡ? Hãy gửi yêu cầu cho chúng tôi, đội
            ngũ SportNexus sẽ phản hồi qua email sớm nhất!
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin liên hệ tĩnh */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                Thông tin liên hệ
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-100 dark:border-sky-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Email hỗ trợ
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      support@sportnexus.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-100 dark:border-sky-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Hotline
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      1900 123 456 (8:00 - 21:00)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-100 dark:border-sky-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Địa chỉ trụ sở
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Cần Thơ, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-100 dark:border-sky-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Thời gian làm việc
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Thứ 2 - Chủ Nhật: 08:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner hỗ trợ nhanh */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 dark:from-sky-700 dark:to-indigo-900 p-6 text-white shadow-xl dark:shadow-2xl">
              <h3 className="font-bold text-base mb-1">Cần giải đáp gấp?</h3>
              <p className="text-xs text-sky-100 leading-relaxed">
                Kiểm tra phần Các câu hỏi thường gặp (FAQ) hoặc nhắn tin trực
                tiếp qua Hotline để được phản hồi trong 5 phút.
              </p>
            </div>
          </div>

          {/* Cột phải: Form gửi Email */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 p-6 md:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Gửi yêu cầu hỗ trợ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Điền thông tin bên dưới, chúng tôi sẽ phản hồi lại qua Email của
              bạn trong vòng 24h.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabelInput
                  id="full_name"
                  name="full_name"
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                />

                <LabelInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email nhận phản hồi"
                  placeholder="nguyenvana@gmail.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabelInput
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Số điện thoại"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <LabelInput
                  id="subject"
                  name="subject"
                  label="Chủ đề"
                  placeholder="Tư vấn đơn hàng / Bảo hành / Lỗi web..."
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết thắc mắc hoặc sự cố bạn gặp phải..."
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#111827]/40 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 dark:focus:border-sky-500 resize-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 dark:bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 dark:hover:bg-sky-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {loading ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi yêu cầu qua Email
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
