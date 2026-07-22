import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
        <ShoppingBag size={64} className="text-slate-300" />
        <p className="text-slate-500 text-lg">Giỏ hàng trống</p>
        <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
        >
            Mua sắm ngay
        </Link>
    </div>
);

export default EmptyCart;
