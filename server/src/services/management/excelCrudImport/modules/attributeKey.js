// @ts-nocheck
import { toText, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { attributeKeyColumns } from "../columns.js";

export const attributeKey = buildSingleSheetModule({
  sheetName: 'Thuộc tính',
  fileName: 'attribute-keys.xlsx',
  columns: attributeKeyColumns,
  exportAll: async (db) => {
    const rows = await db.AttributeKeys.findMany({
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => ({
      name: item.name || '',
      unit: item.unit || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const name = toText(values[0]);
    const unit = toText(values[1]);
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Tên thuộc tính không được để trống' });

    return {
      values,
      rawValues: values,
      data: {
        name: name || undefined,
        unit: unit || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    const record = await db.AttributeKeys.create({ data });
    return { action: 'create', record };
  },
});