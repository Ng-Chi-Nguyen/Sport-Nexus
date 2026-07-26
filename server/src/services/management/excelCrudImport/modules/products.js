// @ts-nocheck
import { trimText, toText, toInt, toNumber, toBoolean, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { productColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import slugify from 'slugify';

export const products = buildSingleSheetModule({
  sheetName: 'Products',
  fileName: 'products.xlsx',
  columns: productColumns,
  exportAll: async (db) => {
    const rows = await db.Products.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => ({
      id: item.id,
      name: item.name || '',
      base_price: item.base_price ?? '',
      description: item.description || '',
      is_active: item.is_active ? 'Hoạt động' : 'Ngừng',
      thumbnail: item.thumbnail || '',
      category_id: item.category_id || '',
      supplier_id: item.supplier_id || '',
      brand_id: item.brand_id || '',
      slug: item.slug || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const name = toText(values[1]);
    const base_price = toNumber(values[2]);
    const description = toText(values[3]);
    const is_active = toBoolean(values[4], true);
    const thumbnail = toText(values[5]);
    const category_id = toInt(values[6]);
    const supplier_id = toInt(values[7]);
    const brand_id = toInt(values[8]);
    const slug = slugify(name, { lower: true, strict: true });
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Tên sản phẩm không được để trống' });
    if (base_price === null) errors.push({ field: 'base_price', message: 'Giá gốc không hợp lệ' });

    return {
      values,
      rawValues: values,
      id,
      data: {
        name: name || undefined,
        base_price: base_price ?? undefined,
        description: description || undefined,
        is_active: is_active ?? undefined,
        thumbnail: thumbnail || undefined,
        category_id: category_id || undefined,
        supplier_id: supplier_id || undefined,
        brand_id: brand_id || undefined,
        slug: slug || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (row.id) {
      const record = await db.Products.update({ where: { id: row.id }, data });
      return { action: 'update', record };
    }
    const record = await db.Products.create({ data });
    return { action: 'create', record };
  },
});