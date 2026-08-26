import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation("translation", { keyPrefix: "auth" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res?.success) {
        setSent(true);
      } else {
        ShowToast("error", res?.message || t("send_failed"));
      }
    } catch (error) {
      ShowToast("error", error?.response?.data?.message || t("send_error"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle size={48} className="mx-auto text-green-500" />
        <h3 className="text-lg font-bold text-slate-800">
          {t("sent_email_title")}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t("sent_email_desc", { email })}
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          <ArrowLeft size={16} />
          {t("back_to_login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-500 leading-relaxed">
        {t("forgot_intro")}
      </p>

      <LabelInput
        id="email"
        label={t("email")}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <BtnSave
        loading={loading}
        loadingText={t("sending")}
        icon={<Mail size={16} />}
        className="!w-full !py-3 !rounded-xl !text-sm"
      >
        {t("send_request")}
      </BtnSave>

      <p className="text-center text-gray-400 text-xs">
        <Link
          to="/auth/login"
          className="text-blue-500 hover:text-blue-600 font-bold hover:underline transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          {t("back_to_login")}
        </Link>
      </p>
    </form>
  );
};

export default ForgotPassword;
