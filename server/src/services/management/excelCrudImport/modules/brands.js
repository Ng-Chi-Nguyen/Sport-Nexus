// @ts-nocheck
import { toText, rowHasOwnData, upsertRecord } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { brandColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const countriesPath = resolve(__dirname, '../../../../../../client/src/assets/data/countries.json');
const COUNTRIES = JSON.parse(readFileSync(countriesPath, 'utf-8'));

const stripFlag = (value) => {
  if (!value) return '';
  return value.replace(/^\[[A-Z]{2}\]\s*/u, '');
};

const escapeListItems = (items) =>
  items.map((item) => (item.includes(',') || item.includes('"') ? `"${item.replace(/"/g, '""')}"` : item)).join(',');

export const brands = buildSingleSheetModule({
  sheetName: 'Thương hiệu',
  fileName: 'brands.xlsx',
  columns: brandColumns,
  templateSheets: async () => {
    const originOptions = COUNTRIES.map((c) => `[${c.code}] ${c.name}`);

    const columns = brandColumns.map((col) => {
      if (col.key === 'origin') {
        return { ...col, validation: { type: 'list', formulae: [`"${escapeListItems(originOptions)}"`], allowBlank: true } };
      }
      return col;
    });

    return [{ name: 'Thương hiệu', columns, rows: [] }];
  },
  exportAll: async (db) => {
    const rows = await db.Brands.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: 'asc' },
    });

    return rows.map((item) => {
      const country = COUNTRIES.find((c) => c.name === item.origin);
      return {
        id: item.id,
        name: item.name || '',
        origin: country ? `[${country.code}] ${item.origin}` : (item.origin || ''),
      };
    });
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const name = toText(values[0]);
    const origin = stripFlag(toText(values[1]));
    const errors = [];

    if (!name) errors.push({ field: 'name', message: 'Tên thương hiệu không được để trống' });

    return {
      values,
      rawValues: values,
      data: {
        name: name || undefined,
        origin: origin || undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    return await upsertRecord(db, 'Brands', { id: row.id }, data, { notFoundMessage: `Không tìm thấy thương hiệu có ID #${row.id}` });
  },
});
