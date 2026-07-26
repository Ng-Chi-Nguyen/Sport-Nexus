// @ts-nocheck
import { trimText, toText, toInt, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { productAttributeKeyColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const productAttributeKey = buildSingleSheetModule({
    sheetName: 'ProductAttributeKeys',
    fileName: 'product-attribute-keys.xlsx',
    columns: productAttributeKeyColumns,
    exportAll: async (db) => {
      const rows = await db.ProductAttributeKeys.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
      });

      return rows.map((item) => ({
        id: item.id,
        product_id: item.product_id || '',
        attribute_key_id: item.attribute_key_id || '',
      }));
    },
    parseRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const product_id = toInt(values[1]);
      const attribute_key_id = toInt(values[2]);
      const errors = [];

      if (!product_id) errors.push({ field: 'product_id', message: 'ID sản phẩm không được để trống' });
      if (!attribute_key_id) errors.push({ field: 'attribute_key_id', message: 'ID thuộc tính không được để trống' });

      return {
        values,
        rawValues: values,
        id,
        data: {
          product_id: product_id || undefined,
          attribute_key_id: attribute_key_id || undefined,
        },
        errors,
      };
    },
    importRow: async (db, row) => {
      const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      if (row.id) {
        const record = await db.ProductAttributeKeys.update({ where: { id: row.id }, data });
        return { action: 'update', record };
      }
      const record = await db.ProductAttributeKeys.create({ data });
      return { action: 'create', record };
    },
  });