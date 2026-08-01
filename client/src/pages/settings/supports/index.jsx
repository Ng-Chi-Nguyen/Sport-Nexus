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
import axiosClient from "@/lib/axiosClient";
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
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-[1400px] px-4 pt-4 md:pt-6 mt-10">
        <Breadcrumbs
          data={[
            { title: "Trang chủ", route: "/" },
            { title: "Hỗ trợ khách hàng", route: "/ho-tro" },
          ]}
        />

        {/* Header Section */}
        <div className="mt-6 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            <HelpCircle className="w-3.5 h-3.5" />
            Trung tâm trợ giúp
          </span>
          <h3 className="mt-2 text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Liên Hệ & Hỗ Trợ
          </h3>
          <p className="mt-2 text-sm md:text-base text-slate-500">
            Bạn có thắc mắc hoặc cần giúp đỡ? Hãy gửi yêu cầu cho chúng tôi, đội
            ngũ SportNexus sẽ phản hồi qua email sớm nhất!
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin liên hệ tĩnh */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Thông tin liên hệ
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Email hỗ trợ</p>
                    <p className="text-slate-500 text-xs">
                      support@sportnexus.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Hotline</p>
                    <p className="text-slate-500 text-xs">
                      1900 123 456 (8:00 - 21:00)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Địa chỉ trụ sở
                    </p>
                    <p className="text-slate-500 text-xs">Cần Thơ, Việt Nam</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Thời gian làm việc
                    </p>
                    <p className="text-slate-500 text-xs">
                      Thứ 2 - Chủ Nhật: 08:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner hỗ trợ nhanh */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-md">
              <h3 className="font-bold text-base mb-1">Cần giải đáp gấp?</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Kiểm tra phần Các câu hỏi thường gặp (FAQ) hoặc nhắn tin trực
                tiếp qua Hotline để được phản hồi trong 5 phút.
              </p>
            </div>
          </div>

          {/* Cột phải: Form gửi Email */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Gửi yêu cầu hỗ trợ
            </h2>
            <p className="text-xs text-slate-500 mb-6">
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

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết thắc mắc hoặc sự cố bạn gặp phải..."
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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
