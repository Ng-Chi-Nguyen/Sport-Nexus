import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <ShoppingBag size={64} className="text-slate-300 dark:text-slate-600" />
      <p className="text-slate-500 dark:text-slate-400 text-lg">
        Giỏ hàng trống
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 py-2.5 bg-sky-600 dark:bg-sky-500 text-white rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium cursor-pointer shadow-sm"
      >
        Mua sắm ngay
      </button>
    </div>
  );
};

export default EmptyCart;
