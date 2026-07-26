// @ts-nocheck
import { trimText, toText, toInt, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { categoryColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import slugify from 'slugify';

export const category = buildSingleSheetModule({
    sheetName: 'Categories',
    fileName: 'categories.xlsx',
    columns: categoryColumns,
    exportAll: async (db) => {
      const rows = await db.Categories.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
      });

      return rows.map((item) => ({
        id: item.id,
        name: item.name || '',
        slug: item.slug || '',
        parent_id: item.parent_id || '',
        description: item.description || '',
        image: item.image || '',
      }));
    },
    parseRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const name = toText(values[1]);
      const slug = slugify(name, { lower: true, strict: true });
      const parent_id = toInt(values[2]);
      const description = toText(values[3]);
      const image = toText(values[4]);
      const errors = [];

      if (!name) errors.push({ field: 'name', message: 'Tên danh mục không được để trống' });

      return {
        values,
        rawValues: values,
        id,
        data: {
          name: name || undefined,
          slug: slug || undefined,
          parent_id: parent_id || undefined,
          description: description || undefined,
          image: image || undefined,
        },
        errors,
      };
    },
    importRow: async (db, row) => {
      const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      if (row.id) {
        const record = await db.Categories.update({ where: { id: row.id }, data });
        return { action: 'update', record };
      }
      const record = await db.Categories.create({ data });
      return { action: 'create', record };
    },
  });