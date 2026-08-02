import { toast } from "sonner";

const ShowToast = (status, message) => {
  const options = {
    closeButton: true, // Hiển thị nút 'x' để người dùng chủ động tắt
    duration: Infinity, // Giữ thông báo không tự biến mất
  };

  switch (status) {
    case "success":
      return toast.success(message, options);
    case "error":
      return toast.error(message, options);
    case "warning":
      return toast.warning(message, options);
    case "info":
      return toast.info(message, options);
    case "dismiss":
    default:
      return toast(message, options);
  }
};

export default ShowToast;
