// @ts-nocheck
import { trimText, toText, toInt, toNumber, toDate, rowHasOwnData } from "../helpers.js";
import { buildDualSheetModule } from "../builders.js";
import { purchaseOrderColumns, purchaseOrderItemColumns } from "../columns.js";

export const purchaseOrder = buildDualSheetModule({
    parentSheetName: 'PurchaseOrders',
    childSheetName: 'PurchaseOrderItems',
    fileName: 'purchase-orders.xlsx',
    parentColumns: purchaseOrderColumns,
    childColumns: purchaseOrderItemColumns,
    exportAll: async (db) => {
      const rows = await db.PurchaseOrders.findMany({
        orderBy: { id: 'asc' },
        include: { PurchaseOrderItems: true },
      });

      return {
        parentRows: rows.map((item) => ({
          id: item.id,
          ref_code: String(item.id),
          supplier_id: item.supplier_id || '',
          expected_delivery_date: item.expected_delivery_date || '',
          total_cost: Number(item.total_cost ?? 0),
          status: item.status || '',
        })),
        childRows: rows.flatMap((item) => (item.PurchaseOrderItems || []).map((orderItem) => ({
          id: orderItem.id,
          purchase_order_ref_code: String(item.id),
          product_variant_id: orderItem.product_variant_id,
          quantity: orderItem.quantity,
          unit_cost_price: Number(orderItem.unit_cost_price ?? 0),
        }))),
      };
    },
    parseParentRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const ref_code = toText(values[1]);
      const supplier_id = toInt(values[2]);
      const expected_delivery_date = toDate(values[3]);
      const total_cost = toNumber(values[4]);
      const status = toText(values[5]);
      const errors = [];

      if (!ref_code) errors.push({ field: 'ref_code', message: 'Mã tham chiếu không được để trống' });
      if (!supplier_id) errors.push({ field: 'supplier_id', message: 'ID nhà cung cấp không được để trống' });
      if (expected_delivery_date === null) errors.push({ field: 'expected_delivery_date', message: 'Ngày giao dự kiến không hợp lệ' });
      if (total_cost === null) errors.push({ field: 'total_cost', message: 'Tổng chi phí không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        ref_code: ref_code || undefined,
        data: {
          supplier_id: supplier_id || undefined,
          expected_delivery_date: expected_delivery_date || undefined,
          total_cost: total_cost ?? undefined,
          status: status || undefined,
        },
        errors,
      };
    },
    parseChildRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const purchase_order_ref_code = toText(values[1]);
      const product_variant_id = toInt(values[2]);
      const quantity = toInt(values[3]);
      const unit_cost_price = toNumber(values[4]);
      const errors = [];

      if (!purchase_order_ref_code) errors.push({ field: 'purchase_order_ref_code', message: 'Mã tham chiếu phiếu không được để trống' });
      if (!product_variant_id) errors.push({ field: 'product_variant_id', message: 'ID biến thể không được để trống' });
      if (quantity === null) errors.push({ field: 'quantity', message: 'Số lượng không hợp lệ' });
      if (unit_cost_price === null) errors.push({ field: 'unit_cost_price', message: 'Đơn giá nhập không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        purchase_order_ref_code: purchase_order_ref_code || undefined,
        data: {
          product_variant_id: product_variant_id || undefined,
          quantity: quantity ?? undefined,
          unit_cost_price: unit_cost_price ?? undefined,
        },
        errors,
      };
    },
    importRows: async (db, parsed) => {
      const parentMap = new Map();
      const summary = { created: [], updated: [], errors: [] };
      const childRowsByParent = new Map();

      for (const row of parsed.parents) {
        if (row.errors?.length) {
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const payload = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
        const refCode = row.ref_code || String(row.id || `purchase-order-${row.rowNumber}`);

        let record;
        if (row.id) {
          record = await db.PurchaseOrders.update({ where: { id: row.id }, data: payload });
          summary.updated.push(record);
        } else {
          record = await db.PurchaseOrders.create({ data: payload });
          summary.created.push(record);
        }

        parentMap.set(refCode, record.id);
      }

      for (const row of parsed.children) {
        if (row.errors?.length) {
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const parentId = parentMap.get(row.purchase_order_ref_code);
        if (!parentId) {
          summary.errors.push({ row: row.rowNumber, field: 'purchase_order_ref_code', message: `Không tìm thấy phiếu mua hàng tham chiếu "${row.purchase_order_ref_code}"` });
          continue;
        }

        const item = {
          product_variant_id: row.data.product_variant_id,
          quantity: row.data.quantity,
          unit_cost_price: row.data.unit_cost_price,
          purchase_order_id: parentId,
        };

        if (!childRowsByParent.has(parentId)) childRowsByParent.set(parentId, []);
        childRowsByParent.get(parentId).push(item);
      }

      for (const [parentId, items] of childRowsByParent.entries()) {
        await db.PurchaseOrderItems.deleteMany({ where: { purchase_order_id: parentId } });
        await db.PurchaseOrderItems.createMany({ data: items });
      }

      return summary;
    },
  });