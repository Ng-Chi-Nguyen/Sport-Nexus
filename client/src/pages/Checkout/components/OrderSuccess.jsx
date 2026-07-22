import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <ShoppingBag size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Đặt hàng thành công!</h2>
      <p className="text-slate-500">
        Mã đơn hàng:{" "}
        <span className="font-semibold text-slate-700">#{orderId}</span>
      </p>
      <p className="text-slate-400 text-sm">
        Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm nhất.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
      >
        Tiếp tục mua sắm
      </button>
    </div>
  );
};

export default OrderSuccess;
