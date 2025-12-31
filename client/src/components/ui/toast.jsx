import { toast } from "sonner";

const ShowToast = (status, message) => {
  switch (status) {
    case "success":
      return toast.success(message);
    case "error":
      return toast.error(message);
    default:
      return toast(message);
  }
};

export default ShowToast;
