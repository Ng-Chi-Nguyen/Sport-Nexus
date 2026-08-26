import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { LabelInput } from "@/components/ui/input";
import { BtnSave } from "@/components/ui/button";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";
import { useTranslation } from "react-i18next";

const ResetForgotPassword = () => {
  const { t } = useTranslation("translation", { keyPrefix: "auth" });
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ pass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <AlertCircle size={48} className="mx-auto text-red-400" />
        <h3 className="text-lg font-bold text-slate-800">
          {t("invalid_link_title")}
        </h3>
        <p className="text-sm text-slate-500">{t("invalid_link_desc")}</p>
        <Link
          to="/auth/quen-mat-khau"
          className="text-sm text-blue-500 hover:underline font-medium"
        >
          {t("resend_request")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      ShowToast("error", t("password_mismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, {
        password,
        confirm_password: confirmPassword,
      });
      if (res?.success) {
        setDone(true);
      } else {
        ShowToast("error", res?.message || t("reset_failed"));
      }
    } catch (error) {
      ShowToast("error", error?.response?.data?.message || t("reset_error"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle size={48} className="mx-auto text-green-500" />
        <h3 className="text-lg font-bold text-slate-800">
          {t("reset_success_title")}
        </h3>
        <p className="text-sm text-slate-500">{t("reset_success_desc")}</p>
        <Link
          to="/auth/login"
          className="inline-block mt-2 px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider
                     bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 text-white
                     shadow-[0_4px_20px_rgba(255,107,53,0.3)]
                     hover:shadow-[0_6px_30px_rgba(255,107,53,0.4)]
                     transition-all duration-200"
        >
          {t("login_now")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-500 leading-relaxed">
        {t("reset_intro")}
      </p>

      <LabelInput
        id="password"
        label={t("new_password")}
        type={show.pass ? "text" : "password"}
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, pass: !s.pass }))}
            tabIndex={-1}
          >
            {show.pass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <LabelInput
        id="confirmPassword"
        label={t("confirm_password")}
        type={show.confirm ? "text" : "password"}
        required
        minLength={6}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        rightElement={
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            tabIndex={-1}
          >
            {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      <BtnSave
        loading={loading}
        loadingText={t("processing")}
        className="!w-full !py-3 !rounded-xl !text-sm"
      >
        {t("reset_now")}
      </BtnSave>
    </form>
  );
};

export default ResetForgotPassword;
