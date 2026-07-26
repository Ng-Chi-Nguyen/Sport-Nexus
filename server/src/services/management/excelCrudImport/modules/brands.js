// @ts-nocheck
import { trimText, toText, toInt, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { brandColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const brands = buildSingleSheetModule({
  sheetName: "Brands",
  fileName: "brands.xlsx",
  columns: brandColumns,
  exportAll: async (db) => {
    const rows = await db.Brands.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: "asc" },
    });

    return rows.map((item) => ({
      id: item.id,
      name: item.name || "",
      origin: item.origin || "",
      logo: item.logo || "",
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const name = toText(values[1]);
    const origin = toText(values[2]);
    const logo = toText(values[3]);
    const errors = [];

    if (!name) errors.push({ field: "name", message: "Tên thương hiệu không được để trống" });

    return {
      values,
      rawValues: values,
      id,
      data: {
        name: name || undefined,
        origin: origin || undefined,
        logo: logo || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (row.id) {
      const record = await db.Brands.update({ where: { id: row.id }, data });
      return { action: "update", record };
    }
    const record = await db.Brands.create({ data });
    return { action: "create", record };
  },
});
