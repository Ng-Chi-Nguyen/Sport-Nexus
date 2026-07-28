// @ts-nocheck
import { trimText, toText, toInt, toNumber, toDate, rowHasOwnData } from "../helpers.js";
import { getSheetRows } from "../workbook.js";
import { purchaseOrderColumns, purchaseOrderItemColumns, PO_STATUS_MAP, PO_STATUS_REVERSE_MAP, PO_STATUS_LABELS } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

const escapeListItems = (items) =>
  items.map((item) => (item.includes(',') || item.includes('"') ? `"${item.replace(/"/g, '""')}"` : item)).join(',');

const quoteSheetName = (name) => /[^\w]/.test(name) ? `'${name}'` : name;

const formatVariantOption = (product, variant) => {
  if (!variant) return product?.name || 'N/A';
  const attrs = (variant.VariableAttributes || [])
    .map((attr) => `${attr.attributeKey?.name || attr.attribute_key_id}=${attr.value}`)
    .sort()
    .join('; ');
  return attrs ? `${product.name} - ${attrs}` : product.name;
};

const buildVariantNameMap = async (db) => {
  const variants = await db.ProductVariants.findMany({
    where: { deleted_at: ACTIVE },
    include: {
      product: { select: { name: true } },
      VariableAttributes: { include: { attributeKey: true } },
    },
  });
  const map = new Map();
  for (const v of variants) {
    const name = formatVariantOption(v.product, v);
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(v.id);
  }
  return map;
};

export const purchaseOrder = {
  kind: 'dual',
  parentSheetName: 'Phiếu nhập',
  childSheetName: 'Chi tiết phiếu nhập',
  fileName: 'phieu-nhap.xlsx',
  parentColumns: purchaseOrderColumns,
  childColumns: purchaseOrderItemColumns,

  async templateSheets(db) {
    const [suppliers, variants] = await Promise.all([
      db.Suppliers.findMany({ where: { deleted_at: ACTIVE }, orderBy: { name: 'asc' } }),
      db.ProductVariants.findMany({
        where: { deleted_at: ACTIVE },
        include: {
          product: { select: { name: true } },
          VariableAttributes: { include: { attributeKey: true } },
        },
      }),
    ]);

    const parentCols = purchaseOrderColumns.map((col) => {
      if (col.key === 'supplier_name')
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(suppliers.map((s) => s.name))}"`], allowBlank: true } };
      if (col.key === 'status')
        return { ...col, validation: { type: 'list', formulae: [`"${PO_STATUS_LABELS.join(',')}"`], allowBlank: true } };
      return col;
    });

    const variantRefCols = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên biến thể', key: 'name', width: 50 },
    ];

    return [
      { name: 'Phiếu nhập', columns: parentCols, rows: [] },
      { name: 'Chi tiết phiếu nhập', columns: purchaseOrderItemColumns, rows: [] },
      { name: 'Danh mục biến thể', columns: variantRefCols, rows: variants.map((v) => ({ id: v.id, name: formatVariantOption(v.product, v) })) },
    ];
  },

  async exportSheets(db) {
    const rows = await db.PurchaseOrders.findMany({
      orderBy: { id: 'asc' },
      include: {
        supplier: { select: { name: true } },
        PurchaseOrderItems: {
          include: {
            product_variant: {
              include: {
                product: { select: { name: true } },
                VariableAttributes: { include: { attributeKey: true } },
              },
            },
          },
        },
      },
    });

    const allVariants = await db.ProductVariants.findMany({
      where: { deleted_at: ACTIVE },
      include: {
        product: { select: { name: true } },
        VariableAttributes: { include: { attributeKey: true } },
      },
    });

    const variantRowMap = new Map();
    const variantRefRows = allVariants.map((v, idx) => {
      variantRowMap.set(v.id, idx + 2);
      return { id: v.id, name: formatVariantOption(v.product, v) };
    });

    const variantRefCols = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên biến thể', key: 'name', width: 50 },
    ];
    const variantRefSheetName = 'Danh mục biến thể';

    const parentSheetName = 'Phiếu nhập';
    const childSheetName = 'Chi tiết phiếu nhập';

    const parentRows = rows.map((item) => ({
      id: item.id,
      ref_code: String(item.id),
      supplier_name: item.supplier?.name || '',
      expected_delivery_date: item.expected_delivery_date || '',
      total_cost: Number(item.total_cost ?? 0),
      status: PO_STATUS_REVERSE_MAP[item.status] || item.status,
    }));

    const childRows = [];
    rows.forEach((item) => {
      (item.PurchaseOrderItems || []).forEach((orderItem) => {
        const variantName = formatVariantOption(orderItem.product_variant?.product, orderItem.product_variant);
        const targetRow = variantRowMap.get(orderItem.product_variant_id);
        const variantCell = targetRow && variantName
          ? { text: variantName, hyperlink: `#${quoteSheetName(variantRefSheetName)}!A${targetRow}` }
          : (variantName || '');

        childRows.push({
          id: orderItem.id,
          purchase_order_ref_code: String(item.id),
          product_variant: variantCell,
          quantity: orderItem.quantity,
          unit_cost_price: Number(orderItem.unit_cost_price ?? 0),
        });
      });
    });

    const parentRefColIdx = purchaseOrderColumns.findIndex((col) => col.key === 'ref_code');
    const childRefColIdx = purchaseOrderItemColumns.findIndex((col) => col.key === 'purchase_order_ref_code');

    if (parentRefColIdx !== -1 && childRefColIdx !== -1) {
      const parentColLetter = String.fromCharCode(65 + parentRefColIdx);
      const childColLetter = String.fromCharCode(65 + childRefColIdx);

      const parentRefToRow = new Map();
      parentRows.forEach((row, i) => { if (row.ref_code) parentRefToRow.set(String(row.ref_code), i + 2); });

      const parentFirstChildRow = new Map();
      childRows.forEach((row, i) => {
        if (row.purchase_order_ref_code) {
          const key = String(row.purchase_order_ref_code);
          if (!parentFirstChildRow.has(key)) parentFirstChildRow.set(key, i + 2);
        }
      });

      childRows.forEach((row) => {
        const ref = row.purchase_order_ref_code;
        if (ref && !(typeof ref === 'object' && ref.text)) {
          const target = parentRefToRow.get(String(ref));
          if (target) row.purchase_order_ref_code = { text: String(ref), hyperlink: `#${quoteSheetName(parentSheetName)}!${parentColLetter}${target}` };
        }
      });

      parentRows.forEach((row) => {
        const ref = row.ref_code;
        if (ref && !(typeof ref === 'object' && ref.text)) {
          const target = parentFirstChildRow.get(String(ref));
          if (target) row.ref_code = { text: String(ref), hyperlink: `#${quoteSheetName(childSheetName)}!${childColLetter}${target}` };
        }
      });
    }

    return [
      { name: parentSheetName, columns: purchaseOrderColumns, rows: parentRows },
      { name: childSheetName, columns: purchaseOrderItemColumns, rows: childRows },
      { name: variantRefSheetName, columns: variantRefCols, rows: variantRefRows },
    ];
  },

  parseWorkbook(workbook) {
    const parentWs = workbook.getWorksheet('Phiếu nhập') || workbook.worksheets[0];
    const childWs = workbook.getWorksheet('Chi tiết phiếu nhập') || workbook.worksheets[1];

    if (!parentWs || !childWs)
      throw new Error('File Excel không đúng cấu trúc (thiếu sheet "Phiếu nhập" hoặc "Chi tiết phiếu nhập").');

    const parents = getSheetRows(parentWs, purchaseOrderColumns.length).map(({ rowNumber, values }) => {
      if (!rowHasOwnData(values)) return { rowNumber, values, rawValues: values, errors: [] };

      const ref_code = toText(values[0]);
      const supplier_name = toText(values[1]);
      const expected_delivery_date = toDate(values[2]);
      const total_cost = toNumber(values[3]);
      const status = toText(values[4]);
      const errors = [];

      if (!ref_code) errors.push({ field: 'ref_code', message: 'Mã tham chiếu không được để trống' });
      if (!supplier_name) errors.push({ field: 'supplier_name', message: 'Tên nhà cung cấp không được để trống' });
      if (expected_delivery_date === null) errors.push({ field: 'expected_delivery_date', message: 'Ngày giao dự kiến không hợp lệ' });
      if (total_cost === null) errors.push({ field: 'total_cost', message: 'Tổng chi phí không hợp lệ' });
      if (status && !PO_STATUS_MAP[status]) errors.push({ field: 'status', message: `Trạng thái "${status}" không hợp lệ` });

      return {
        rowNumber, values, rawValues: values,
        id: toInt(values[0]),
        ref_code,
        data: {
          supplier_name: supplier_name || undefined,
          expected_delivery_date: expected_delivery_date || undefined,
          total_cost: total_cost ?? undefined,
          status: PO_STATUS_MAP[status] || undefined,
        },
        errors,
      };
    });

    const children = getSheetRows(childWs, purchaseOrderItemColumns.length).map(({ rowNumber, values }) => {
      if (!rowHasOwnData(values)) return { rowNumber, values, rawValues: values, errors: [] };

      const purchase_order_ref_code = toText(values[0]);

      let productVariantRaw = values[1];
      if (productVariantRaw && typeof productVariantRaw === 'object' && productVariantRaw.text)
        productVariantRaw = productVariantRaw.text;
      const product_variant = toText(productVariantRaw);

      const quantity = toInt(values[2]);
      const unit_cost_price = toNumber(values[3]);
      const errors = [];

      if (!purchase_order_ref_code) errors.push({ field: 'purchase_order_ref_code', message: 'Mã tham chiếu phiếu không được để trống' });
      if (!product_variant) errors.push({ field: 'product_variant', message: 'Tên biến thể không được để trống' });
      if (quantity === null) errors.push({ field: 'quantity', message: 'Số lượng không hợp lệ' });
      if (unit_cost_price === null) errors.push({ field: 'unit_cost_price', message: 'Đơn giá nhập không hợp lệ' });

      return {
        rowNumber, values, rawValues: values,
        id: toInt(values[0]),
        purchase_order_ref_code,
        data: {
          product_variant: product_variant || undefined,
          quantity: quantity ?? undefined,
          unit_cost_price: unit_cost_price ?? undefined,
        },
        errors,
      };
    });

    return { parents, children };
  },

  async importRows(db, parsed) {
    const parentMap = new Map();
    const summary = { created: [], updated: [], errors: [] };
    const childRowsByParent = new Map();

    const allSuppliers = await db.Suppliers.findMany({ where: { deleted_at: ACTIVE } });
    const supplierNameToId = new Map(allSuppliers.map((s) => [s.name, s.id]));

    const variantMap = await buildVariantNameMap(db);

    for (const row of parsed.parents) {
      if (row.errors?.length) {
        summary.errors.push(...row.errors.map((e) => ({ row: row.rowNumber, ...e })));
        continue;
      }

      const payload = Object.fromEntries(Object.entries(row.data).filter(([, v]) => v !== undefined));
      const refCode = row.ref_code || String(row.id || `purchase-order-${row.rowNumber}`);

      if (payload.supplier_name) {
        const sid = supplierNameToId.get(payload.supplier_name);
        if (!sid) {
          summary.errors.push({ row: row.rowNumber, field: 'supplier_name', message: `Nhà cung cấp "${payload.supplier_name}" không tồn tại` });
          continue;
        }
        payload.supplier_id = sid;
        delete payload.supplier_name;
      }

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
        summary.errors.push(...row.errors.map((e) => ({ row: row.rowNumber, ...e })));
        continue;
      }

      const parentId = parentMap.get(row.purchase_order_ref_code);
      if (!parentId) {
        summary.errors.push({ row: row.rowNumber, field: 'purchase_order_ref_code', message: `Không tìm thấy phiếu nhập tham chiếu "${row.purchase_order_ref_code}"` });
        continue;
      }

      if (!row.data.product_variant) {
        summary.errors.push({ row: row.rowNumber, field: 'product_variant', message: 'Tên biến thể không được để trống' });
        continue;
      }

      const ids = variantMap.get(row.data.product_variant);
      if (!ids || ids.length === 0) {
        summary.errors.push({ row: row.rowNumber, field: 'product_variant', message: `Biến thể "${row.data.product_variant}" không tồn tại` });
        continue;
      }
      if (ids.length > 1) {
        summary.errors.push({ row: row.rowNumber, field: 'product_variant', message: `Biến thể "${row.data.product_variant}" có nhiều kết quả` });
        continue;
      }

      const item = {
        product_variant_id: ids[0],
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
};
