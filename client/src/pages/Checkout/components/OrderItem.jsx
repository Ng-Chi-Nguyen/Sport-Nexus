import { formatCurrency } from "@/utils/formatters";

const OrderItem = ({ item }) => (
  <div className="flex items-start justify-between text-sm">
    <div className="flex-1 min-w-0 space-y-1">
      <p className="text-blue-700 truncate font-medium">
        {item.name || `SP #${item.product_variant_id}`}
      </p>
      <p className="text-xs text-slate-400">
        SL: {item.quantity} | ID: #{item.product_variant_id}
        {item.attributes?.length > 0 && (
          <> | {item.attributes.map((attr, i) => (
            <span key={i}>
              {attr.name}: {attr.value}{i < item.attributes.length - 1 ? ', ' : ''}
            </span>
          ))}</>
        )}
      </p>
    </div>
    <p className="text-slate-700 font-medium ml-2 shrink-0">
      {formatCurrency(item.price_at_purchase * item.quantity)}
    </p>
  </div>
);

export default OrderItem;
