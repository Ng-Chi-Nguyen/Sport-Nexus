import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-800 dark:text-slate-100 transition-colors duration-200">
    <ShoppingBag size={64} className="text-slate-300 dark:text-slate-600" />
    <p className="text-slate-500 dark:text-slate-400 text-lg">Giỏ hàng trống</p>
    <Link
      to="/"
      className="px-6 py-2.5 bg-sky-600 dark:bg-sky-500 text-white rounded-xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors text-sm font-medium shadow-sm"
    >
      Mua sắm ngay
    </Link>
  </div>
);

export default EmptyCart;
