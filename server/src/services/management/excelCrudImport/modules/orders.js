﻿// @ts-nocheck
import { trimText, toText, toInt, toNumber, rowHasOwnData, buildVariantAttributeLabel, resolveProductVariant } from "../helpers.js";
import { buildDualSheetModule } from "../builders.js";
import { orderColumns, orderItemColumns, STATUS_REVERSE_MAP, STATUS_MAP, PAYMENT_METHOD_REVERSE_MAP, PAYMENT_METHOD_MAP, PAYMENT_STATUS_REVERSE_MAP, PAYMENT_STATUS_MAP } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const orders = buildDualSheetModule({
  parentSheetName: 'Đơn hàng',
  childSheetName: 'Chi tiết đơn',
  fileName: 'don-hang.xlsx',
  parentColumns: orderColumns,
  childColumns: orderItemColumns,
  exportAll: async (db) => {
    const rows = await db.Orders.findMany({
      orderBy: { id: 'asc' },
      include: {
        OrderItems: {
          include: {
            product_variant: {
              include: {
                product: true,
                VariableAttributes: { include: { attributeKey: true } },
              },
            },
          },
        },
      },
    });

    return {
      parentRows: rows.map((item) => ({
        ref_code: String(item.id),
        coupon_code: item.coupon_code || item.coupon?.code || '',
        status: STATUS_REVERSE_MAP[item.status] || item.status || '',
        payment_method: PAYMENT_METHOD_REVERSE_MAP[item.payment_method] || item.payment_method || '',
        payment_status: PAYMENT_STATUS_REVERSE_MAP[item.payment_status] || item.payment_status || '',
        shipping_address: item.shipping_address || '',
        user_email: item.user_email || '',
      })),
      childRows: rows.flatMap((item) => (item.OrderItems || []).map((orderItem) => ({
        order_ref_code: String(item.id),
        product_name: orderItem.product_variant?.product?.name || '',
        variant_attributes: buildVariantAttributeLabel(orderItem.product_variant?.VariableAttributes || []),
        quantity: orderItem.quantity,
        price_at_purchase: Number(orderItem.price_at_purchase ?? 0),
      }))),
    };
  },
  parseParentRow: ({ rowNumber, values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const ref_code = toText(values[0]);
    const coupon_code = toText(values[1]);
    const status = toText(values[2]);
    const payment_method = toText(values[3]);
    const payment_status = toText(values[4]);
    const shipping_address = toText(values[5]);
    const user_email = toText(values[6]);
    const errors = [];

    if (!status) errors.push({ field: 'status', message: 'Trạng thái không được để trống' });
    if (!shipping_address) errors.push({ field: 'shipping_address', message: 'Địa chỉ giao hàng không được để trống' });
    if (!payment_method) errors.push({ field: 'payment_method', message: 'Phương thức thanh toán không được để trống' });
    if (!payment_status) errors.push({ field: 'payment_status', message: 'Trạng thái thanh toán không được để trống' });

    return {
      values,
      rawValues: values,
      refCode: ref_code || `ORDER_ROW_${rowNumber}`,
      data: {
        coupon_code: coupon_code || undefined,
        status: status ? (STATUS_MAP[status] || status) : undefined,
        payment_method: payment_method ? (PAYMENT_METHOD_MAP[payment_method] || payment_method) : undefined,
        payment_status: payment_status ? (PAYMENT_STATUS_MAP[payment_status] || payment_status) : undefined,
        shipping_address: shipping_address || undefined,
        user_email: user_email || undefined,
      },
      errors,
    };
  },
  parseChildRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const order_ref_code = toText(values[0]);
    const product_name = toText(values[1]);
    const variant_attributes = toText(values[2]);
    const quantity = toInt(values[3]);
    const price_at_purchase = toNumber(values[4]);
    const errors = [];

    if (!product_name) errors.push({ field: 'product_name', message: 'Tên sản phẩm không được để trống' });
    if (quantity === null) errors.push({ field: 'quantity', message: 'Số lượng không hợp lệ' });
    if (price_at_purchase === null) errors.push({ field: 'price_at_purchase', message: 'Giá mua không hợp lệ' });

    return {
      values,
      rawValues: values,
      order_ref_code: order_ref_code || undefined,
      data: {
        product_name: product_name || undefined,
        variant_attributes: variant_attributes || undefined,
        quantity: quantity ?? undefined,
        price_at_purchase: price_at_purchase ?? undefined,
      },
      errors,
    };
  },
  importRows: async (db, parsed) => {
    const parentMap = new Map();
    const summary = { created: [], updated: [], errors: [] };
    const childRowsByParent = new Map();
    const productCatalog = await db.Products.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
      include: {
        ProductVariants: {
          include: {
            VariableAttributes: { include: { attributeKey: true } },
          },
        },
      },
    });

    for (const row of parsed.parents) {
      if (row.errors?.length) {
        summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
        continue;
      }

      const payload = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      const refCode = row.refCode || `order-${row.rowNumber}`;

      const record = await db.Orders.create({
        data: {
          ...payload,
          total_amount: 0,
          discount_amount: 0,
          final_amount: 0,
          OrderItems: undefined,
        },
      });
      summary.created.push(record);

      parentMap.set(refCode, record.id);
    }

    let lastChildRefCode = null;
    for (const row of parsed.children) {
      if (row.errors?.length) {
        summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
        continue;
      }

      const childRefCode = row.order_ref_code || lastChildRefCode;
      if (!childRefCode) {
        summary.errors.push({ row: row.rowNumber, field: 'order_ref_code', message: 'Mã tham chiếu đơn không được để trống (không có giá trị tham chiếu trước đó)' });
        continue;
      }
      lastChildRefCode = childRefCode;

      const parentId = parentMap.get(childRefCode);
      if (!parentId) {
        summary.errors.push({ row: row.rowNumber, field: 'order_ref_code', message: `Không tìm thấy đơn hàng tham chiếu "${childRefCode}"` });
        continue;
      }

      const resolvedVariant = resolveProductVariant(productCatalog, row.data.product_name, row.data.variant_attributes);
      if (resolvedVariant.error) {
        summary.errors.push({ row: row.rowNumber, field: 'product_name', message: resolvedVariant.error });
        continue;
      }

      const item = {
        product_variant_id: resolvedVariant.variant.id,
        quantity: row.data.quantity,
        price_at_purchase: row.data.price_at_purchase,
        order_id: parentId,
      };

      if (!childRowsByParent.has(parentId)) childRowsByParent.set(parentId, []);
      childRowsByParent.get(parentId).push(item);
    }

    for (const [parentId, items] of childRowsByParent.entries()) {
      await db.OrderItems.deleteMany({ where: { order_id: parentId } });
      await db.OrderItems.createMany({
        data: items,
      });
    }

    return summary;
  },
});