// @ts-nocheck
import { toText, toInt, toNumber, rowHasOwnData, parseVariantAttributePairs, normalizeLookupText, upsertRecord } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { productVariantColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

const escapeListItems = (items) =>
  items.map((item) => (item.includes(',') || item.includes('"') ? `"${item.replace(/"/g, '""')}"` : item)).join(',');

export const productVariants = buildSingleSheetModule({
  sheetName: 'Biến thể',
  fileName: 'product-variants.xlsx',
  columns: productVariantColumns,
  templateSheets: async (db) => {
    const [products, attrKeys] = await Promise.all([
      db.Products.findMany({ where: { deleted_at: ACTIVE }, orderBy: { name: 'asc' } }),
      db.AttributeKeys.findMany({ orderBy: { name: 'asc' } }),
    ]);

    const columns = productVariantColumns.map((col) => {
      if (col.key === 'product_name') {
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(products.map((p) => p.name))}"`], allowBlank: true } };
      }
      return col;
    });

    const guideColumns = [
      { header: 'HƯỚNG DẪN NHẬP BIẾN THỂ', key: 'title', width: 30 },
      { header: 'Chi tiết', key: 'detail', width: 60 },
    ];

    const guideRows = [
      { title: '1. Cột Sản phẩm', detail: 'Chọn tên sản phẩm từ dropdown. Bắt buộc.' },
      { title: '2. Cột Tồn kho', detail: 'Số lượng tồn. Bắt buộc.' },
      { title: '3. Cột Giá bán', detail: 'Giá bán của biến thể. Bắt buộc.' },
      { title: '4. Cột Thuộc tính', detail: 'Định dạng: key=value; key=value. Ví dụ: Màu sắc=Đỏ; Kích thước=XL' },
      { title: '5. Nhiều thuộc tính', detail: 'Dùng dấu ; hoặc | để phân cách giữa các cặp key=value' },
      { title: '6. Key không hợp lệ', detail: 'Nếu key không có trong danh sách thuộc tính, import sẽ báo lỗi dòng đó.' },
      { title: '7. Không có thuộc tính', detail: 'Để trống cột Thuộc tính nếu biến thể không có thuộc tính.' },
      { title: '8. Dữ liệu mẫu', detail: 'Màu sắc=Đỏ; Kích thước=XL' },
      { title: '', detail: 'Màu sắc=Xanh; Kích thước=L' },
      { title: '', detail: 'Chất liệu=Da' },
    ];

    const attrColumns = [
      { header: 'Tên thuộc tính', key: 'name', width: 30 },
      { header: 'Đơn vị', key: 'unit', width: 20 },
    ];

    const attrRows = attrKeys.map((k) => ({
      name: k.name,
      unit: k.unit || '',
    }));

    return [
      { name: 'Biến thể', columns, rows: [] },
      { name: 'Hướng dẫn', columns: guideColumns, rows: guideRows },
      { name: 'Danh sách thuộc tính', columns: attrColumns, rows: attrRows },
    ];
  },
  exportAll: async (db) => {
    const rows = await db.ProductVariants.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
      include: {
        product: { select: { name: true } },
        VariableAttributes: { include: { attributeKey: true } },
      },
    });

    return rows.map((item) => ({
      id: item.id,
      product_name: item.product?.name || '',
      stock: Number(item.stock),
      price: Number(item.price),
      attributes_text: (item.VariableAttributes || [])
        .map((attr) => `${attr.attributeKey?.name || attr.attribute_key_id}=${attr.value}`)
        .sort()
        .join('; '),
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const product_name = toText(values[0]);
    const stock = toInt(values[1]);
    const price = toNumber(values[2]);
    const attributes_text = toText(values[3]);
    const errors = [];

    if (!product_name) errors.push({ field: 'product_name', message: 'Tên sản phẩm không được để trống' });
    if (stock === null) errors.push({ field: 'stock', message: 'Tồn kho không hợp lệ' });
    if (price === null) errors.push({ field: 'price', message: 'Giá bán không hợp lệ' });

    return {
      values,
      rawValues: values,
      data: {
        product_name: product_name || undefined,
        stock: stock ?? undefined,
        price: price ?? undefined,
        attributes_text: attributes_text || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const errors = [];
    const data = { ...row.data };

    if (data.product_name) {
      const product = await db.Products.findFirst({ where: { name: data.product_name, deleted_at: ACTIVE } });
      if (product) {
        data.product_id = product.id;
      } else {
        errors.push({ field: 'product_name', message: `Sản phẩm "${data.product_name}" không tồn tại` });
      }
      delete data.product_name;
    }

    let parsedAttributes = [];
    if (data.attributes_text) {
      const pairs = parseVariantAttributePairs(data.attributes_text);
      const attrKeys = await db.AttributeKeys.findMany();
      const attrKeyMap = new Map();
      for (const ak of attrKeys) {
        attrKeyMap.set(normalizeLookupText(ak.name), ak.id);
      }

      for (const pair of pairs) {
        const attrId = attrKeyMap.get(normalizeLookupText(pair.key));
        if (attrId) {
          parsedAttributes.push({ attribute_key_id: attrId, value: pair.value });
        } else {
          errors.push({ field: 'attributes_text', message: `Thuộc tính "${pair.key}" không tồn tại` });
        }
      }
      delete data.attributes_text;
    }

    if (errors.length) {
      return { action: 'error', errors };
    }

    if (!data.stock) data.stock = 0;
    if (!data.price) data.price = 0;

    const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

    // perform upsert (create or update)
    const upsertResult = await upsertRecord(db, 'ProductVariants', { id: row.id }, cleanData, { notFoundMessage: `Không tìm thấy biến thể có ID #${row.id}` });
    if (upsertResult.action === 'error') return upsertResult;

    const record = upsertResult.record;

    if (parsedAttributes.length > 0) {
      // ensure attributes synced: delete old and create new
      await db.variableAttributes.deleteMany({ where: { variable_id: record.id } });
      await db.variableAttributes.createMany({
        data: parsedAttributes.map((item) => ({
          variable_id: record.id,
          attribute_key_id: item.attribute_key_id,
          value: item.value,
        })),
      });
    }

    return { action: upsertResult.action, record };
  },
});
