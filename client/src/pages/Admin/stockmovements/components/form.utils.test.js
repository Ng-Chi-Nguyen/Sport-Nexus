import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBatchStockMovementItems,
  getRemainingQuantity,
  normalizeDamagedQuantity,
} from "./form.utils.js";

test("getRemainingQuantity tinh dung so luong con lai", () => {
  assert.equal(getRemainingQuantity({ quantity: 10, quantity_received: 4 }), 6);
  assert.equal(getRemainingQuantity({ quantity: 3, quantity_received: 5 }), 0);
});

test("normalizeDamagedQuantity gioi han gia tri trong khoang hop le", () => {
  assert.equal(normalizeDamagedQuantity(-2, 8), 0);
  assert.equal(normalizeDamagedQuantity(3.9, 8), 3);
  assert.equal(normalizeDamagedQuantity(10, 8), 8);
});

test("buildBatchStockMovementItems bo qua item thuc nhap bang 0 va tao reason", () => {
  const items = buildBatchStockMovementItems({
    orderId: 55,
    baseReason: "Kiểm tra lô đầu vào",
    orderItems: [
      {
        id: 1,
        quantity: 10,
        quantity_received: 4,
        product_variant_id: 101,
      },
      {
        id: 2,
        quantity: 5,
        quantity_received: 0,
        product_variant_id: 202,
      },
    ],
    damagedQuantities: {
      1: 2,
      2: 5,
    },
  });

  assert.deepEqual(items, [
    {
      variant_id: 101,
      quantity_change: 4,
      reason:
        "Nhập từ đơn #55. Hàng hỏng: 2/6. Ghi chú: Kiểm tra lô đầu vào",
    },
  ]);
});
