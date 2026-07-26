import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import sharp from 'sharp';
import categoryImportService from '../src/services/management/categoryImport/index.js';

test('parseFile ignores embedded images and leaves category image empty', async () => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Categories');
  ws.columns = [
    { header: 'Tên danh mục', key: 'name', width: 35 },
    { header: 'Trạng thái', key: 'is_active', width: 18 },
  ];

  ws.addRow({ name: 'Giày chạy bộ', is_active: 'Hoạt động' });

  const imageBuffer = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 0, g: 128, b: 255, alpha: 1 },
    },
  }).png().toBuffer();

  const imageId = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
  ws.addImage(imageId, {
    tl: { col: 1.05, row: 1.05 },
    ext: { width: 40, height: 40 },
    editAs: 'oneCell',
  });

  const parsed = await categoryImportService.parseFile(await workbook.xlsx.writeBuffer());

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, 'Giày chạy bộ');
  assert.equal(parsed[0].image, null);
  assert.equal(parsed[0].errors.length, 0);
});
