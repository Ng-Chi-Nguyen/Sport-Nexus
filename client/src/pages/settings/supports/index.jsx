import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
  Headphones,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ShowToast from "@/components/ui/toast";
import { LabelInput } from "@/components/ui/input";
import supportApi from "@/api/customer/settings/support";
import { TitleWithIcon } from "@/components/ui/title";
import { useTranslation } from "react-i18next";

const Support = () => {
  const { t } = useTranslation("translation", { keyPrefix: "support" });
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
            { title: t("home"), route: "/" },
            {
              title: t("contact_support"),
              route: "/ho-tro",
            },
          ]}
        />

        {/* Header Section */}
        <div className="mt-6 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <HelpCircle className="w-3.5 h-3.5" />
            {t("help_center")}
          </span>
          <TitleWithIcon icon={Headphones} title={t("contact_support")} />
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              "support_description",
              "Bạn có thắc mắc hoặc cần giúp đỡ? Hãy gửi yêu cầu cho chúng tôi, đội ngũ SportNexus sẽ phản hồi qua email sớm nhất!",
            )}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin liên hệ tĩnh */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                {t("contact_info")}
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-100 dark:border-sky-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {t("support_email")}
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
                      {t("hotline")}
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
                      {t("headquarters")}
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
                      {t("working_hours")}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      {t("working_time_range")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner hỗ trợ nhanh */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 dark:from-sky-700 dark:to-indigo-900 p-6 text-white shadow-xl dark:shadow-2xl">
              <h3 className="font-bold text-base mb-1">{t("urgent_help")}</h3>
              <p className="text-xs text-sky-100 leading-relaxed">
                {t("faq_note")}
              </p>
            </div>
          </div>

          {/* Cột phải: Form gửi Email */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-[#0D121F]/40 p-6 md:p-8 shadow-xl dark:shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {t("send_request")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {t("request_description")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabelInput
                  id="full_name"
                  name="full_name"
                  label={t("full_name_label")}
                  placeholder={t("name_placeholder")}
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                />

                <LabelInput
                  id="email"
                  name="email"
                  type="email"
                  label={t("email_label")}
                  placeholder={t("email_placeholder")}
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
                  label={t("phone_label")}
                  placeholder={t("phone_placeholder")}
                  value={formData.phone}
                  onChange={handleChange}
                />

                <LabelInput
                  id="subject"
                  name="subject"
                  label={t("topic_label")}
                  placeholder={t("subject_placeholder")}
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t("content_label")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("message_placeholder")}
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
                    {t("submit_btn")}
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
