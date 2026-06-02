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

export const resolveSelectedQuantity = (value, max) => {
  const cappedMax = Math.max(Math.floor(Number(max) || 0), 0);

  if (cappedMax === 0) {
    return 0;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return cappedMax;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), cappedMax);
};

export const buildStockMovementPayload = ({
  type,
  orderId,
  baseReason = "",
  orderItems,
  selectedQuantities,
}) => {
  const numericOrderId = Number(orderId);
  const trimmedReason = baseReason.trim();
  const referencePrefix =
    type === "OUT" ? "Xuất từ đơn" : type === "IN" ? "Nhập từ đơn" : "Điều chỉnh từ đơn";

  return orderItems.reduce((items, item) => {
    const remainingQuantity = getRemainingQuantity(item);
    const selectedQuantity = resolveSelectedQuantity(
      selectedQuantities[item.id],
      remainingQuantity,
    );
    const variantId = Number(item.product_variant_id);

    if (selectedQuantity <= 0 || !Number.isFinite(variantId)) {
      return items;
    }

    const reasonParts = [];

    if (Number.isFinite(numericOrderId) && numericOrderId > 0) {
      reasonParts.push(`${referencePrefix} #${numericOrderId}.`);
    }

    if (trimmedReason) {
      reasonParts.push(`Ghi chú: ${trimmedReason}`);
    }

    items.push({
      type,
      reference_id: Number.isFinite(numericOrderId) ? numericOrderId : null,
      variant_id: variantId,
      quantity_change: selectedQuantity,
      reason: reasonParts.join(" ") || null,
    });

    return items;
  }, []);
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
