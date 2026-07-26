import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import sharp from 'sharp';
import {
  buildCategoryExportBuffer,
  buildCategoryTemplateBuffer,
  prepareImageForExcel,
} from '../src/services/management/categoryImport/workbook.js';

const validPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64'
);

test('buildCategoryTemplateBuffer leaves the first data row empty', async () => {
  const buffer = await buildCategoryTemplateBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.getWorksheet('Categories');
  assert.equal(ws.getCell('A2').value, null);
  assert.equal(ws.getCell('B2').value, null);
  assert.equal(ws.getCell('C2').value, null);
  assert.equal(ws.getRow(2).height, 28);
});

test('buildCategoryTemplateBuffer removes the image column from import', async () => {
  const buffer = await buildCategoryTemplateBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.getWorksheet('Categories');
  const guide = workbook.getWorksheet('Hướng dẫn');

  assert.equal(ws.getCell('B1').value, 'Trạng thái');
  assert.match(String(guide.getCell('B5').value), /admin/i);
  assert.doesNotMatch(String(guide.getCell('B5').value), /URL ảnh/i);
});

test('buildCategoryExportBuffer keeps original row positions and skips invalid images', async () => {
  const categories = [
    { name: 'Không ảnh', image: null, is_active: true },
    { name: 'Ảnh hợp lệ', image: 'https://example.com/valid.png', is_active: true },
    { name: 'Ảnh lỗi', image: 'https://example.com/bad.png', is_active: false },
  ];

  const buffer = await buildCategoryExportBuffer(categories, async (url) => {
    if (url.includes('bad')) {
      return { buffer: Buffer.from('not-an-image'), extension: 'png' };
    }

    return { buffer: validPng, extension: 'png' };
  });

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.getWorksheet('Categories');
  const images = ws.getImages();

  assert.equal(images.length, 1);
  assert.equal(ws.getCell('A2').value, 'Không ảnh');
  assert.equal(ws.getCell('A3').value, 'Ảnh hợp lệ');
  assert.equal(ws.getCell('A4').value, 'Ảnh lỗi');
  assert.equal(Math.round(images[0].range.tl.row) + 1, 3);
});

test('prepareImageForExcel converts webp to png for Excel embedding', async () => {
  const webpBuffer = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  }).webp().toBuffer();

  const result = await prepareImageForExcel({ buffer: webpBuffer });

  assert.equal(result.extension, 'png');
  assert.equal(result.buffer[0], 0x89);
  assert.equal(result.buffer[1], 0x50);
  assert.equal(result.buffer[2], 0x4e);
  assert.equal(result.buffer[3], 0x47);
});
