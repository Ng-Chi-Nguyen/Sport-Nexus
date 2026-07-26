// @ts-nocheck
import { trimText, toText, toInt, toNumber, toBoolean, toDate, toJson, normalizeLookupText, parseVariantAttributePairs, buildVariantAttributeSignature, buildVariantAttributeLabel, resolveProductVariant, rowHasOwnData } from './helpers.js';
import { buildSingleSheetModule, buildDualSheetModule, buildSingleExportRow } from './builders.js';
import { brandColumns, supplierColumns, userColumns, attributeKeyColumns, productAttributeKeyColumns, productColumns, productVariantColumns, STATUS_REVERSE_MAP, PAYMENT_METHOD_REVERSE_MAP, PAYMENT_STATUS_REVERSE_MAP, STATUS_MAP, PAYMENT_METHOD_MAP, PAYMENT_STATUS_MAP, orderColumns, orderItemColumns, purchaseOrderColumns, purchaseOrderItemColumns, categoryColumns } from './columns.js';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import { ACTIVE } from '../../../utils/prisma.js';

export const moduleConfigs = {
  brands: buildSingleSheetModule({
    sheetName: 'Brands',
    fileName: 'brands.xlsx',
    columns: brandColumns,
    exportAll: async (db) => {
      const rows = await db.Brands.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
      });

      return rows.map((item) => ({
        id: item.id,
        name: item.name || '',
        origin: item.origin || '',
        logo: item.logo || '',
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

      if (!name) errors.push({ field: 'name', message: 'Tên thương hiệu không được để trống' });

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
        return { action: 'update', record };
      }
      const record = await db.Brands.create({ data });
      return { action: 'create', record };
    },
  }),

  orders: buildDualSheetModule({
    parentSheetName: 'Đơn hàng',
    childSheetName: 'Chi tiết đơn',
    fileName: 'don-hang.xlsx',
    parentColumns: orderColumns,
    childColumns: orderItemColumns,
    exportAll: async (db) => {
      const rows = await db.Orders.findMany({
        orderBy: { id: 'asc' },
        include: {
          OrderItems: {
            include: {
              product_variant: {
                include: {
                  product: true,
                  VariableAttributes: { include: { attributeKey: true } },
                },
              },
            },
          },
        },
      });

      return {
        parentRows: rows.map((item) => ({
          id: item.id,
          ref_code: String(item.id),
          total_amount: Number(item.total_amount ?? 0),
          discount_amount: Number(item.discount_amount ?? 0),
          final_amount: Number(item.final_amount ?? 0),
          coupon_code: item.coupon_code || item.coupon?.code || '',
          status: STATUS_REVERSE_MAP[item.status] || item.status || '',
          payment_method: PAYMENT_METHOD_REVERSE_MAP[item.payment_method] || item.payment_method || '',
          payment_status: PAYMENT_STATUS_REVERSE_MAP[item.payment_status] || item.payment_status || '',
          shipping_address: item.shipping_address || '',
          user_email: item.user_email || '',
        })),
        childRows: rows.flatMap((item) => (item.OrderItems || []).map((orderItem) => ({
          id: orderItem.id,
          order_ref_code: String(item.id),
          product_name: orderItem.product_variant?.product?.name || '',
          variant_attributes: buildVariantAttributeLabel(orderItem.product_variant?.VariableAttributes || []),
          quantity: orderItem.quantity,
          price_at_purchase: Number(orderItem.price_at_purchase ?? 0),
        }))),
      };
    },
    parseParentRow: ({ rowNumber, values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const ref_code = toText(values[1]);
      const total_amount = toNumber(values[2]);
      const discount_amount = toNumber(values[3]);
      const final_amount = toNumber(values[4]);
      const coupon_code = toText(values[5]);
      const status = toText(values[6]);
      const payment_method = toText(values[7]);
      const payment_status = toText(values[8]);
      const shipping_address = toText(values[9]);
      const user_email = toText(values[10]);
      const errors = [];

      if (total_amount === null) errors.push({ field: 'total_amount', message: 'Tổng tiền không hợp lệ' });
      if (!status) errors.push({ field: 'status', message: 'Trạng thái không được để trống' });
      if (!shipping_address) errors.push({ field: 'shipping_address', message: 'Địa chỉ giao hàng không được để trống' });
      if (!payment_method) errors.push({ field: 'payment_method', message: 'Phương thức thanh toán không được để trống' });
      if (!payment_status) errors.push({ field: 'payment_status', message: 'Trạng thái thanh toán không được để trống' });
      if (final_amount === null) errors.push({ field: 'final_amount', message: 'Thành tiền cuối không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        refCode: ref_code || `ORDER_ROW_${rowNumber}`,
        data: {
          total_amount: total_amount ?? undefined,
          discount_amount: discount_amount ?? undefined,
          final_amount: final_amount ?? undefined,
          coupon_code: coupon_code || undefined,
          status: status ? (STATUS_MAP[status] || status) : undefined,
          payment_method: payment_method ? (PAYMENT_METHOD_MAP[payment_method] || payment_method) : undefined,
          payment_status: payment_status ? (PAYMENT_STATUS_MAP[payment_status] || payment_status) : undefined,
          shipping_address: shipping_address || undefined,
          user_email: user_email || undefined,
        },
        errors,
      };
    },
    parseChildRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const order_ref_code = toText(values[1]);
      const product_name = toText(values[2]);
      const variant_attributes = toText(values[3]);
      const quantity = toInt(values[4]);
      const price_at_purchase = toNumber(values[5]);
      const errors = [];

      if (!product_name) errors.push({ field: 'product_name', message: 'Tên sản phẩm không được để trống' });
      if (quantity === null) errors.push({ field: 'quantity', message: 'Số lượng không hợp lệ' });
      if (price_at_purchase === null) errors.push({ field: 'price_at_purchase', message: 'Giá mua không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        order_ref_code: order_ref_code || undefined,
        data: {
          product_name: product_name || undefined,
          variant_attributes: variant_attributes || undefined,
          quantity: quantity ?? undefined,
          price_at_purchase: price_at_purchase ?? undefined,
        },
        errors,
      };
    },
    importRows: async (db, parsed) => {
      const parentMap = new Map();
      const summary = { created: [], updated: [], errors: [] };
      const childRowsByParent = new Map();
      const productCatalog = await db.Products.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
        include: {
          ProductVariants: {
            include: {
              VariableAttributes: { include: { attributeKey: true } },
            },
          },
        },
      });

      for (const row of parsed.parents) {
        if (row.errors?.length) {
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const payload = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
        const refCode = row.refCode || String(row.id || `order-${row.rowNumber}`);

        let record;
        if (row.id) {
          record = await db.Orders.update({ where: { id: row.id }, data: payload });
          summary.updated.push(record);
        } else {
          record = await db.Orders.create({
            data: {
              ...payload,
              OrderItems: undefined,
            },
          });
          summary.created.push(record);
        }

        parentMap.set(refCode, record.id);
      }

      let lastChildRefCode = null;
      for (const row of parsed.children) {
        if (row.errors?.length) {
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const childRefCode = row.order_ref_code || lastChildRefCode;
        if (!childRefCode) {
          summary.errors.push({ row: row.rowNumber, field: 'order_ref_code', message: 'Mã tham chiếu đơn không được để trống (không có giá trị tham chiếu trước đó)' });
          continue;
        }
        lastChildRefCode = childRefCode;

        const parentId = parentMap.get(childRefCode);
        if (!parentId) {
          summary.errors.push({ row: row.rowNumber, field: 'order_ref_code', message: `Không tìm thấy đơn hàng tham chiếu "${childRefCode}"` });
          continue;
        }

        const resolvedVariant = resolveProductVariant(productCatalog, row.data.product_name, row.data.variant_attributes);
        if (resolvedVariant.error) {
          summary.errors.push({ row: row.rowNumber, field: 'product_name', message: resolvedVariant.error });
          continue;
        }

        const item = {
          product_variant_id: resolvedVariant.variant.id,
          quantity: row.data.quantity,
          price_at_purchase: row.data.price_at_purchase,
          order_id: parentId,
        };

        if (!childRowsByParent.has(parentId)) childRowsByParent.set(parentId, []);
        childRowsByParent.get(parentId).push(item);
      }

      for (const [parentId, items] of childRowsByParent.entries()) {
        await db.OrderItems.deleteMany({ where: { order_id: parentId } });
        await db.OrderItems.createMany({
          data: items,
        });
      }

      return summary;
    },
  }),

  suppliers: buildSingleSheetModule({
    sheetName: 'Suppliers',
    fileName: 'suppliers.xlsx',
    columns: supplierColumns,
    exportAll: async (db) => {
      const rows = await db.Suppliers.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
      });

      return rows.map((item) => ({
        id: item.id,
        contact_person: item.contact_person || '',
        email: item.email || '',
        phone: item.phone || '',
        name: item.name || '',
        location_data: JSON.stringify(item.location_data) || '',
        logo_url: item.logo_url || '',
      }));
    },
    parseRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const contact_person = toText(values[1]);
      const email = toText(values[2]);
      const phone = toText(values[3]);
      const name = toText(values[4]);
      const location_data = toJson(values[5], {});
      const logo_url = toText(values[6]);
      const errors = [];

      if (!contact_person) errors.push({ field: 'contact_person', message: 'Người liên hệ không được để trống' });
      if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });
      if (!phone) errors.push({ field: 'phone', message: 'Số điện thoại không được để trống' });

      return {
        values,
        rawValues: values,
        id,
        data: {
          contact_person: contact_person || undefined,
          email: email || undefined,
          phone: phone || undefined,
          name: name || undefined,
          location_data: location_data || undefined,
          logo_url: logo_url || undefined,
        },
        errors,
      };
    },
    importRow: async (db, row) => {
      const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      if (row.id) {
        const record = await db.Suppliers.update({ where: { id: row.id }, data });
        return { action: 'update', record };
      }
      const record = await db.Suppliers.create({ data });
      return { action: 'create', record };
    },
  }),

  users: buildSingleSheetModule({
    sheetName: 'Users',
    fileName: 'users.xlsx',
    columns: userColumns,
    exportAll: async (db) => {
      const rows = await db.Users.findMany({
        where: { deleted_at: ACTIVE },
        orderBy: { id: 'asc' },
        include: { role: true },
      });

      return rows.map((item) => ({
        id: item.id,
        full_name: item.full_name || '',
        email: item.email || '',
        password: '',
        phone_number: item.phone_number || '',
        role_id: item.role_id || item.role?.id || '',
        status: item.status || '',
        is_verified: item.is_verified ? 'Có' : 'Không',
        avatar: item.avatar || '',
      }));
    },
    parseRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const full_name = toText(values[1]);
      const email = toText(values[2]);
      const password = toText(values[3]);
      const phone_number = toText(values[4]);
      const role_id = toInt(values[5]);
      const status = toText(values[6]);
      const is_verified = toBoolean(values[7]);
      const avatar = toText(values[8]);
      const errors = [];

      if (!full_name) errors.push({ field: 'full_name', message: 'Họ tên không được để trống' });
      if (!email) errors.push({ field: 'email', message: 'Email không được để trống' });

      return {
        values,
        rawValues: values,
        id,
        data: {
          full_name: full_name || undefined,
          email: email || undefined,
          password: password || undefined,
          phone_number: phone_number || undefined,
          role_id: role_id || undefined,
          status: status || undefined,
          is_verified: is_verified ?? undefined,
          avatar: avatar || undefined,
        },
        errors,
      };
    },
    importRow: async (db, row) => {
      const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }
      if (row.id) {
        const record = await db.Users.update({ where: { id: row.id }, data });
        return { action: 'update', record };
      }
      const record = await db.Users.create({ data });
      return { action: 'create', record };
    },
  }),

  attributeKey: buildSingleSheetModule({
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
  }),

  category: buildSingleSheetModule({
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
  }),

  productAttributeKey: buildSingleSheetModule({
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
  }),

  products: buildSingleSheetModule({
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
  }),

  productVariants: buildSingleSheetModule({
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
  }),

  purchaseOrder: buildDualSheetModule({
    parentSheetName: 'PurchaseOrders',
    childSheetName: 'PurchaseOrderItems',
    fileName: 'purchase-orders.xlsx',
    parentColumns: purchaseOrderColumns,
    childColumns: purchaseOrderItemColumns,
    exportAll: async (db) => {
      const rows = await db.PurchaseOrders.findMany({
        orderBy: { id: 'asc' },
        include: { PurchaseOrderItems: true },
      });

      return {
        parentRows: rows.map((item) => ({
          id: item.id,
          ref_code: String(item.id),
          supplier_id: item.supplier_id || '',
          expected_delivery_date: item.expected_delivery_date || '',
          total_cost: Number(item.total_cost ?? 0),
          status: item.status || '',
        })),
        childRows: rows.flatMap((item) => (item.PurchaseOrderItems || []).map((orderItem) => ({
          id: orderItem.id,
          purchase_order_ref_code: String(item.id),
          product_variant_id: orderItem.product_variant_id,
          quantity: orderItem.quantity,
          unit_cost_price: Number(orderItem.unit_cost_price ?? 0),
        }))),
      };
    },
    parseParentRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const ref_code = toText(values[1]);
      const supplier_id = toInt(values[2]);
      const expected_delivery_date = toDate(values[3]);
      const total_cost = toNumber(values[4]);
      const status = toText(values[5]);
      const errors = [];

      if (!ref_code) errors.push({ field: 'ref_code', message: 'Mã tham chiếu không được để trống' });
      if (!supplier_id) errors.push({ field: 'supplier_id', message: 'ID nhà cung cấp không được để trống' });
      if (expected_delivery_date === null) errors.push({ field: 'expected_delivery_date', message: 'Ngày giao dự kiến không hợp lệ' });
      if (total_cost === null) errors.push({ field: 'total_cost', message: 'Tổng chi phí không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        ref_code: ref_code || undefined,
        data: {
          supplier_id: supplier_id || undefined,
          expected_delivery_date: expected_delivery_date || undefined,
          total_cost: total_cost ?? undefined,
          status: status || undefined,
        },
        errors,
      };
    },
    parseChildRow: ({ values }) => {
      if (!rowHasOwnData(values)) {
        return { values, rawValues: values, errors: [] };
      }

      const id = toInt(values[0]);
      const purchase_order_ref_code = toText(values[1]);
      const product_variant_id = toInt(values[2]);
      const quantity = toInt(values[3]);
      const unit_cost_price = toNumber(values[4]);
      const errors = [];

      if (!purchase_order_ref_code) errors.push({ field: 'purchase_order_ref_code', message: 'Mã tham chiếu phiếu không được để trống' });
      if (!product_variant_id) errors.push({ field: 'product_variant_id', message: 'ID biến thể không được để trống' });
      if (quantity === null) errors.push({ field: 'quantity', message: 'Số lượng không hợp lệ' });
      if (unit_cost_price === null) errors.push({ field: 'unit_cost_price', message: 'Đơn giá nhập không hợp lệ' });

      return {
        values,
        rawValues: values,
        id,
        purchase_order_ref_code: purchase_order_ref_code || undefined,
        data: {
          product_variant_id: product_variant_id || undefined,
          quantity: quantity ?? undefined,
          unit_cost_price: unit_cost_price ?? undefined,
        },
        errors,
      };
    },
    importRows: async (db, parsed) => {
      const parentMap = new Map();
      const summary = { created: [], updated: [], errors: [] };
      const childRowsByParent = new Map();

      for (const row of parsed.parents) {
        if (row.errors?.length) {
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const payload = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
        const refCode = row.ref_code || String(row.id || `purchase-order-${row.rowNumber}`);

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
          summary.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
          continue;
        }

        const parentId = parentMap.get(row.purchase_order_ref_code);
        if (!parentId) {
          summary.errors.push({ row: row.rowNumber, field: 'purchase_order_ref_code', message: `Không tìm thấy phiếu mua hàng tham chiếu "${row.purchase_order_ref_code}"` });
          continue;
        }

        const item = {
          product_variant_id: row.data.product_variant_id,
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
  }),
};
