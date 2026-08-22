// @ts-nocheck
import { toText, toInt, toNumber, toBoolean, rowHasOwnData, upsertRecord } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { productColumns, PRODUCT_STATUS_LABELS } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import slugify from 'slugify';

const escapeListItems = (items) =>
  items.map((item) => (item.includes(',') || item.includes('"') ? `"${item.replace(/"/g, '""')}"` : item)).join(',');

export const products = buildSingleSheetModule({
  sheetName: 'Sản phẩm',
  fileName: 'products.xlsx',
  columns: productColumns,
  templateSheets: async (db) => {
    const [categories, suppliers, brands] = await Promise.all([
      db.Categories.findMany({ where: { deleted_at: ACTIVE }, orderBy: { name: 'asc' } }),
      db.Suppliers.findMany({ where: { deleted_at: ACTIVE }, orderBy: { name: 'asc' } }),
      db.Brands.findMany({ where: { deleted_at: ACTIVE }, orderBy: { name: 'asc' } }),
    ]);

    const columns = productColumns.map((col) => {
      if (col.key === 'is_active') {
        return { ...col, validation: { type: 'list', formulae: [`"${PRODUCT_STATUS_LABELS.join(',')}"`], allowBlank: true } };
      }
      if (col.key === 'category_name') {
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(categories.map((c) => c.name))}"`], allowBlank: true } };
      }
      if (col.key === 'supplier_name') {
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(suppliers.map((s) => s.name))}"`], allowBlank: true } };
      }
      if (col.key === 'brand_name') {
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(brands.map((b) => b.name))}"`], allowBlank: true } };
      }
      return col;
    });

    return [{ name: 'Sản phẩm', columns, rows: [] }];
  },
  exportAll: async (db) => {
    const rows = await db.Products.findMany({
      where: { deleted_at: ACTIVE },
      include: { category: true, supplier: true, brand: true },
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => ({
      id: item.id,
      name: item.name || '',
      base_price: Number(item.base_price),
      description: item.description || '',
      is_active: item.is_active ? PRODUCT_STATUS_LABELS[0] : PRODUCT_STATUS_LABELS[1],
      category_name: item.category?.name || '',
      supplier_name: item.supplier?.name || '',
      brand_name: item.brand?.name || '',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const name = toText(values[0]);
    const base_price = toNumber(values[1]);
    const description = toText(values[2]);
    const is_active = toBoolean(values[3], true);
    const category_name = toText(values[4]);
    const supplier_name = toText(values[5]);
    const brand_name = toText(values[6]);
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Tên sản phẩm không được để trống' });
    if (base_price === null) errors.push({ field: 'base_price', message: 'Giá gốc không hợp lệ' });
    if (!category_name) errors.push({ field: 'category_name', message: 'Tên danh mục không được để trống' });
    if (!supplier_name) errors.push({ field: 'supplier_name', message: 'Tên nhà cung cấp không được để trống' });
    if (!brand_name) errors.push({ field: 'brand_name', message: 'Tên thương hiệu không được để trống' });

    return {
      values,
      rawValues: values,
      data: {
        name: name || undefined,
        base_price: base_price ?? undefined,
        description: description || '',
        is_active: is_active ?? undefined,
        category_name: category_name || undefined,
        supplier_name: supplier_name || undefined,
        brand_name: brand_name || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const errors = [];
    const data = { ...row.data };

    if (data.category_name) {
      const category = await db.Categories.findFirst({ where: { name: data.category_name, deleted_at: ACTIVE } });
      if (category) {
        data.category_id = category.id;
      } else {
        errors.push({ field: 'category_name', message: `Danh mục "${data.category_name}" không tồn tại` });
      }
      delete data.category_name;
    }

    if (data.supplier_name) {
      const supplier = await db.Suppliers.findFirst({ where: { name: data.supplier_name, deleted_at: ACTIVE } });
      if (supplier) {
        data.supplier_id = supplier.id;
      } else {
        errors.push({ field: 'supplier_name', message: `Nhà cung cấp "${data.supplier_name}" không tồn tại` });
      }
      delete data.supplier_name;
    }

    if (data.brand_name) {
      const brand = await db.Brands.findFirst({ where: { name: data.brand_name, deleted_at: ACTIVE } });
      if (brand) {
        data.brand_id = brand.id;
      } else {
        errors.push({ field: 'brand_name', message: `Thương hiệu "${data.brand_name}" không tồn tại` });
      }
      delete data.brand_name;
    }

    if (errors.length) {
      return { action: 'error', errors };
    }

    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    if (!data.description) data.description = '';

    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

    return await upsertRecord(db, 'Products', { id: row.id }, cleanData, { notFoundMessage: `Không tìm thấy sản phẩm có ID #${row.id}` });
  },
});