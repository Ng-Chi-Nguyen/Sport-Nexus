// @ts-nocheck
import { trimText, toText, toInt, toNumber, toJson, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { productVariantColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const productVariants = buildSingleSheetModule({
    sheetName: 'ProductVariants',
    fileName: 'product-variants.xlsx',
    columns: productVariantColumns,
    exportAll: async (db) => {
      const rows = await db.ProductVariants.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
        include: {
          VariableAttributes: { include: { attributeKey: true } },
        },
      });

      return rows.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        stock: item.stock ?? 0,
        price: item.price ?? 0,
        attributes_json: JSON.stringify((item.VariableAttributes || []).map((attr) => ({
          attribute_key_id: attr.attribute_key_id ?? attr.attributeKey?.id,
          value: attr.value,
        }))),
      }));
    },
    parseRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const product_id = toInt(values[1]);
      const stock = toInt(values[2]);
      const price = toNumber(values[3]);
      const attributes_json = toJson(values[4], []);
      const errors = [];

      if (!product_id) errors.push({ field: 'product_id', message: 'ID sản phẩm không được để trống' });
      if (stock === null) errors.push({ field: 'stock', message: 'Tồn kho không hợp lệ' });
      if (price === null) errors.push({ field: 'price', message: 'Giá bán không hợp lệ' });
      if (trimText(values[4]) && attributes_json === null) errors.push({ field: 'attributes_json', message: 'Thuộc tính JSON không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        data: {
          product_id: product_id || undefined,
          stock: stock ?? undefined,
          price: price ?? undefined,
          attributes_json: attributes_json ?? undefined,
        },
        errors,
      };
    },
    importRow: async (db, row) => {
      const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      const attributes = Array.isArray(data.attributes_json) ? data.attributes_json : [];
      delete data.attributes_json;

      let record;
      if (row.id) {
        record = await db.ProductVariants.update({ where: { id: row.id }, data });
      } else {
        record = await db.ProductVariants.create({ data });
      }

      if (attributes.length > 0) {
        await db.variableAttributes.deleteMany({ where: { variable_id: record.id } });
        await db.variableAttributes.createMany({
          data: attributes.map((item) => ({
            variable_id: record.id,
            attribute_key_id: Number(item.attribute_key_id),
            value: item.value,
          })),
        });
      }

      return { action: row.id ? 'update' : 'create', record };
    },
  });