import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-3 text-center text-slate-800 dark:text-slate-100 transition-colors duration-200 py-10">
      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
        <ShoppingBag
          size={32}
          className="text-emerald-600 dark:text-emerald-400"
        />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Đặt hàng thành công!
      </h2>
      <p className="text-slate-500 dark:text-slate-400">
        Mã đơn hàng:{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          #{orderId}
        </span>
      </p>
      <p className="text-slate-400 dark:text-slate-500 text-sm">
        Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm nhất.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-2.5 bg-sky-600 dark:bg-sky-500 text-white rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium cursor-pointer shadow-sm mt-2"
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
};

export default OrderSuccess;
