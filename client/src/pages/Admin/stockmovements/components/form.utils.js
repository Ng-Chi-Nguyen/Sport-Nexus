export const getRemainingQuantity = (item) => {
  const orderedQuantity = Number(item.quantity || 0);
  const receivedQuantity = Number(item.quantity_received || 0);

  return Math.max(orderedQuantity - receivedQuantity, 0);
};

export const normalizeDamagedQuantity = (value, max) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(Math.floor(parsed), max);
};

export const buildBatchStockMovementItems = ({
  orderId,
  baseReason = "",
  orderItems,
  damagedQuantities,
}) => {
  const trimmedReason = baseReason.trim();

  return orderItems.reduce((items, item) => {
    const remainingQuantity = getRemainingQuantity(item);
    const damagedQuantity = normalizeDamagedQuantity(
      damagedQuantities[item.id] || 0,
      remainingQuantity,
    );
    const actualReceived = remainingQuantity - damagedQuantity;

    if (actualReceived <= 0) {
      return items;
    }

    const reasonParts = [`Nhập từ đơn #${orderId}.`];

    if (damagedQuantity > 0) {
      reasonParts.push(`Hàng hỏng: ${damagedQuantity}/${remainingQuantity}.`);
    }

    if (trimmedReason) {
      reasonParts.push(`Ghi chú: ${trimmedReason}`);
    }

    items.push({
      variant_id: Number(item.product_variant_id),
      quantity_change: actualReceived,
      reason: reasonParts.join(" "),
    });

    return items;
  }, []);
};
