import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { createExcelCrudImportService } from '../src/services/management/excelCrudImport/index.js';

const buildService = () => {
  const calls = [];
  const fakeDb = {
    Brands: {
      findMany: async () => [{ id: 7, name: 'Nike', origin: 'US', logo: 'nike.png' }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'brand.update', where, data });
        return { id: where.id, name: data.name ?? 'Nike', origin: data.origin ?? 'US', logo: data.logo ?? 'nike.png' };
      },
      create: async ({ data }) => {
        calls.push({ type: 'brand.create', data });
        return { id: 99, ...data };
      },
    },
    Roles: {
      findMany: async () => [{ id: 1, name: 'Admin' }],
    },
    Users: {
      findMany: async () => [],
      count: async () => 0,
      update: async ({ where, data }) => {
        calls.push({ type: 'user.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'user.create', data });
        return { id: 501, ...data };
      },
    },
    Orders: {
      findMany: async () => [],
      count: async () => 0,
      update: async ({ where, data }) => {
        calls.push({ type: 'order.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'order.create', data });
        return { id: 801, ...data };
      },
    },
    OrderItems: {
      deleteMany: async ({ where }) => {
        calls.push({ type: 'orderItems.deleteMany', where });
        return { count: 0 };
      },
      createMany: async ({ data }) => {
        calls.push({ type: 'orderItems.createMany', data });
        return { count: data.length };
      },
    },
    Products: {
      findMany: async () => [{
        id: 3,
        name: 'Áo chạy',
        base_price: 120000,
        description: 'Test',
        thumbnail: null,
        is_active: true,
        category_id: 4,
        supplier_id: 5,
        brand_id: 7,
        ProductVariants: [{
          id: 4,
          product_id: 3,
          stock: 10,
          price: 130000,
          VariableAttributes: [{ attributeKey: { name: 'Size' }, value: 'M' }],
        }],
      }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'product.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'product.create', data });
        return { id: 701, ...data };
      },
    },
    ProductVariants: {
      findMany: async () => [{ id: 4, product_id: 3, stock: 10, price: 130000, attributes_json: '[]' }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'variant.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'variant.create', data });
        return { id: 901, ...data };
      },
    },
    AttributeKeys: {
      findMany: async () => [{ id: 11, name: 'Size', unit: '' }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'attribute.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'attribute.create', data });
        return { id: 111, ...data };
      },
    },
    ProductAttributeKeys: {
      findMany: async () => [{ id: 12, product_id: 3, attribute_key_id: 11 }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'productAttribute.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'productAttribute.create', data });
        return { id: 121, ...data };
      },
    },
    Suppliers: {
      findMany: async () => [{ id: 5, name: 'Supplier A', contact_person: 'Nguyen', email: 'a@example.com', phone: '0901', location_data: { province: 'HCM' }, logo_url: null }],
      count: async () => 1,
      update: async ({ where, data }) => {
        calls.push({ type: 'supplier.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'supplier.create', data });
        return { id: 601, ...data };
      },
    },
    PurchaseOrders: {
      findMany: async () => [],
      count: async () => 0,
      update: async ({ where, data }) => {
        calls.push({ type: 'purchaseOrder.update', where, data });
        return { id: where.id, ...data };
      },
      create: async ({ data }) => {
        calls.push({ type: 'purchaseOrder.create', data });
        return { id: 9010, ...data };
      },
    },
    PurchaseOrderItems: {
      deleteMany: async ({ where }) => {
        calls.push({ type: 'purchaseOrderItems.deleteMany', where });
        return { count: 0 };
      },
      createMany: async ({ data }) => {
        calls.push({ type: 'purchaseOrderItems.createMany', data });
        return { count: data.length };
      },
    },
    purchaseOrderItems: {
      findMany: async () => [],
    },
    productVariants: {
      findUnique: async ({ where }) => ({ id: where.id, stock: 10 }),
      update: async ({ where, data }) => {
        calls.push({ type: 'variant.stock.update', where, data });
        return { id: where.id, ...data };
      },
    },
    variableAttributes: {
      deleteMany: async ({ where }) => {
        calls.push({ type: 'variant.attributes.deleteMany', where });
        return { count: 0 };
      },
      createMany: async ({ data }) => {
        calls.push({ type: 'variant.attributes.createMany', data });
        return { count: data.length };
      },
    },
  };

  return { service: createExcelCrudImportService({ db: fakeDb }), calls };
};

const loadWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
};

test('generateTemplate creates a one-sheet workbook for brands', async () => {
  const { service } = buildService();
  const buffer = await service.generateTemplate('brands');
  const workbook = await loadWorkbook(buffer);

  assert.deepEqual(workbook.worksheets.map((ws) => ws.name), ['Brands']);
  const headers = workbook.getWorksheet('Brands').getRow(1).values.slice(1);
  assert.deepEqual(headers, ['ID', 'Tên thương hiệu', 'Xuất xứ', 'Logo']);
});

test('generateTemplate creates parent and child sheets for orders', async () => {
  const { service } = buildService();
  const buffer = await service.generateTemplate('orders');
  const workbook = await loadWorkbook(buffer);

  assert.deepEqual(workbook.worksheets.map((ws) => ws.name), ['Đơn hàng', 'Chi tiết đơn']);
  const parentHeaders = workbook.getWorksheet('Đơn hàng').getRow(1).values.slice(1);
  const childHeaders = workbook.getWorksheet('Chi tiết đơn').getRow(1).values.slice(1);
  assert.ok(parentHeaders.includes('Tổng tiền'));
  assert.ok(childHeaders.includes('Mã tham chiếu đơn'));
});

test('previewImport skips invalid brand rows and reports errors', async () => {
  const { service } = buildService();
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Brands');
  ws.addRow(['ID', 'Tên thương hiệu', 'Xuất xứ', 'Logo']);
  ws.addRow([null, 'Nike', 'US', 'nike.png']);
  ws.addRow([null, '', 'VN', '']);

  const result = await service.previewImport('brands', await workbook.xlsx.writeBuffer());

  assert.equal(result.total, 2);
  assert.equal(result.success, 1);
  assert.equal(result.failed, 1);
  assert.match(result.errors[0].message, /Tên thương hiệu/i);
});

test('importFile updates existing brand rows and creates new ones', async () => {
  const { service, calls } = buildService();
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Brands');
  ws.addRow(['ID', 'Tên thương hiệu', 'Xuất xứ', 'Logo']);
  ws.addRow([7, 'Nike Updated', 'US', 'nike-new.png']);
  ws.addRow([null, 'Puma', 'DE', 'puma.png']);
  ws.addRow([null, '', 'VN', '']);

  const result = await service.importFile('brands', await workbook.xlsx.writeBuffer());

  assert.equal(result.success, 2);
  assert.equal(result.failed, 1);
  assert.equal(calls.filter((c) => c.type === 'brand.update').length, 1);
  assert.equal(calls.filter((c) => c.type === 'brand.create').length, 1);
  assert.match(calls[0].data.name, /Nike Updated|Puma/);
});

test('importFile creates an order and its items using product name and variant attributes', async () => {
  const { service, calls } = buildService();
  const workbook = new ExcelJS.Workbook();
  const parent = workbook.addWorksheet('Đơn hàng');
  parent.addRow(['ID', 'Mã tham chiếu', 'Tổng tiền', 'Giảm giá', 'Thành tiền cuối', 'Mã coupon', 'Trạng thái', 'Phương thức thanh toán', 'Trạng thái thanh toán', 'Địa chỉ giao hàng', 'Email khách hàng']);
  parent.addRow([null, 'ORD-001', 200000, 0, 200000, '', 'Đang xử lý', 'COD', 'Chờ thanh toán', 'HCM', 'customer@example.com']);
  const items = workbook.addWorksheet('Chi tiết đơn');
  items.addRow(['ID', 'Mã tham chiếu đơn', 'Tên sản phẩm', 'Thuộc tính biến thể', 'Số lượng', 'Giá mua']);
  items.addRow([null, 'ORD-001', 'Áo chạy', 'Size=M', 2, 100000]);
  items.addRow([null, null, 'Áo chạy', 'Size=M', 3, 150000]);

  const result = await service.importFile('orders', await workbook.xlsx.writeBuffer());


  assert.equal(result.success, 1);
  assert.equal(calls.some((c) => c.type === 'order.create'), true);
  assert.equal(calls.some((c) => c.type === 'orderItems.createMany'), true);
  const createManyCall = calls.find((c) => c.type === 'orderItems.createMany');
  assert.equal(createManyCall.data.length, 2);
  assert.equal(createManyCall.data[0].product_variant_id, 4);
});
