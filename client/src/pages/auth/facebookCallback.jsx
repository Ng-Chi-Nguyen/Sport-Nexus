import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShowToast from "@/components/ui/toast";
import authApi from "@/api/auth/auth";

const FacebookCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      ShowToast("error", "Đăng nhập Facebook thất bại");
      navigate("/auth/login");
      return;
    }

    authApi.facebookLogin(accessToken).then((response) => {
      if (response.data.success) {
        const { accessToken: jwtToken, user } = response.data.data;
        localStorage.setItem("accessToken", jwtToken);
        localStorage.setItem("refreshToken", user.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        ShowToast("success", "Chào mừng " + user.full_name);
        navigate("/");
      }
    }).catch(() => {
      ShowToast("error", "Đăng nhập Facebook thất bại");
      navigate("/auth/login");
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Đang xử lý đăng nhập Facebook...</p>
    </div>
  );
};

export default FacebookCallback;
