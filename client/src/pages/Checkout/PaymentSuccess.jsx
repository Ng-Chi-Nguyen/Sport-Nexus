import { useSearchParams } from "react-router-dom";
import OrderSuccess from "./components/OrderSuccess";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const cancelled = searchParams.get("cancelled") === "true";

  if (!orderId) {
    return (
      <div className="max-w-lg mx-auto mt-[100px] p-6 text-center text-slate-600 dark:text-slate-300">
        Không tìm thấy thông tin đơn hàng.
      </div>
    );
  }

  return <OrderSuccess orderId={orderId} paymentMethod={method} cancelled={cancelled} />;
};

export default PaymentSuccess;
