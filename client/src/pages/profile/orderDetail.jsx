import { useLoaderData, Link } from "react-router-dom";
import { formatCurrency, formatFullDateTime } from "@/utils/formatters";
import { STATUS_LABELS, STATUS_PAYMENT } from "@/constants/order";
import { STATUS_BADGE, PAYMENT_BADGE, PAYMENT_METHOD_LABELS } from "@/constants/web/profile";
import { ArrowLeft } from "lucide-react";

const OrderDetail = () => {
  const { order } = useLoaderData();

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Không tìm thấy đơn hàng</p>
        <Link
          to="/tai-khoan/don-hang"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method;

  return (
    <div>
      <Link
        to="/tai-khoan/don-hang"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={16} />
        Quay lại đơn hàng
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
          Đơn hàng #{order.id}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_BADGE[order.status] || ""}`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">Ngày đặt</p>
          <p className="text-sm font-medium">
            {order.created_at ? formatFullDateTime(order.created_at) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">
            Phương thức thanh toán
          </p>
          <p className="text-sm font-medium">{paymentMethodLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">Trạng thái thanh toán</p>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_BADGE[order.payment_status] || ""}`}
          >
            {STATUS_PAYMENT[order.payment_status] || order.payment_status}
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">Tạm tính</p>
          <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">
            Địa chỉ giao hàng
          </p>
          <p className="text-sm font-medium">{order.shipping_address}</p>
        </div>
        {Number(order.discount_amount) > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Giảm giá</p>
            <p className="text-sm font-medium text-green-600">
              -{formatCurrency(order.discount_amount)}
            </p>
          </div>
        )}
        {order.coupon_code && (
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Mã giảm giá</p>
            <p className="text-sm font-medium text-blue-600">{order.coupon_code}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-400 uppercase font-medium">Tổng cộng</p>
          <p className="text-sm font-bold text-slate-900">
            {formatCurrency(order.final_amount)}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-3">Sản phẩm đã đặt</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[23%]" />
          </colgroup>
          <thead>
            <tr className="border-b bg-slate-50 text-slate-700 font-semibold">
              <th className="py-3 px-4 text-left">Sản phẩm</th>
              <th className="py-3 px-4 text-right">Đơn giá</th>
              <th className="py-3 px-4 text-right">Số lượng</th>
              <th className="py-3 px-4 text-right">Tạm tính</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.OrderItems?.map((item) => {
              const variant = item.product_variant;
              const attributes = variant?.VariableAttributes?.map(
                (attr) => `${attr.attributeKey?.name}: ${attr.value}`,
              ).join(", ");
              return (
                <tr key={item.id}>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {variant?.product?.name || "Sản phẩm"}
                      </p>
                      {attributes && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {attributes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(item.price_at_purchase)}
                  </td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(
                      Number(item.price_at_purchase) * Number(item.quantity),
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDetail;
