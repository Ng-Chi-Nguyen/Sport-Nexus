// @ts-nocheck
import { trimText, toText, toInt, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { attributeKeyColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const attributeKey = buildSingleSheetModule({
  sheetName: 'AttributeKeys',
  fileName: 'attribute-keys.xlsx',
  columns: attributeKeyColumns,
  exportAll: async (db) => {
    const rows = await db.AttributeKeys.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => ({
      id: item.id,
      name: item.name || '',
      unit: item.unit || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const name = toText(values[1]);
    const unit = toText(values[2]);
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Tên thuộc tính không được để trống' });

    return {
      values,
      rawValues: values,
      id,
      data: {
        name: name || undefined,
        unit: unit || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (row.id) {
      const record = await db.AttributeKeys.update({ where: { id: row.id }, data });
      return { action: 'update', record };
    }
    const record = await db.AttributeKeys.create({ data });
    return { action: 'create', record };
  },
});