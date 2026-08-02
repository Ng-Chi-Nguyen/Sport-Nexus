import { useSearchParams } from "react-router-dom";
import OrderSuccess from "./components/OrderSuccess";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");

  if (!orderId) {
    return (
      <div className="max-w-lg mx-auto my-8 p-6 text-center text-slate-600 dark:text-slate-300">
        Không tìm thấy thông tin đơn hàng.
      </div>
    );
  }

  return <OrderSuccess orderId={orderId} paymentMethod={method} />;
};

export default PaymentSuccess;