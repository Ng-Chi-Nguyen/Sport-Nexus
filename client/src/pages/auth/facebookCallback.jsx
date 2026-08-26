import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";
import { useTranslation } from "react-i18next";

const FacebookCallback = () => {
  const { t } = useTranslation("translation", { keyPrefix: "auth" });
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      ShowToast("error", t("facebook_login_failed"));
      navigate("/auth/login");
      return;
    }

    authApi
      .facebookLogin(accessToken)
      .then((response) => {
        if (response.data.success) {
          const { accessToken: jwtToken, user } = response.data.data;
          localStorage.setItem("accessToken", jwtToken);
          localStorage.setItem("refreshToken", user.refresh_token);
          localStorage.setItem("user", JSON.stringify(user));
          ShowToast("success", t("welcome", { name: user.full_name }));
          navigate("/");
        }
      })
      .catch(() => {
        ShowToast("error", t("facebook_login_failed"));
        navigate("/auth/login");
      });
  }, [navigate, t]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">{t("facebook_processing")}</p>
    </div>
  );
};

export default FacebookCallback;
