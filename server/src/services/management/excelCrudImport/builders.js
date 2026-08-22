// @ts-nocheck
import { getSheetRows } from './workbook.js';
import { rowHasOwnData, toInt } from './helpers.js';



export const buildSingleSheetModule = ({
  sheetName,
  fileName,
  columns,
  exportAll,
  parseRow,
  importRow,
  templateSheets,
}) => ({
  kind: 'single',
  sheetName,
  fileName,
  columns,
  templateSheets: templateSheets || (() => Promise.resolve([{ name: sheetName, columns, rows: [] }])),
  async exportSheets(db) {
    const quoteSheetName = (name) => /[^\w]/.test(name) ? `'${name}'` : name;
    const rows = await exportAll(db);
    return [{ name: sheetName, columns, rows }];
  },
  parseWorkbook(workbook) {
    const worksheet = workbook.getWorksheet(sheetName) || workbook.worksheets[0];
    if (!worksheet) {
      throw new Error(`File Excel không đúng cấu trúc (thiếu sheet "${sheetName}").`);
    }

    // Detect whether the first header cell is an ID column (header A1 === 'ID')
    const headerCell = worksheet.getRow(1).getCell(1).value;
    const headerText = headerCell ? String(headerCell).trim().toLowerCase() : '';
    const hasIdColumn = headerText === 'id';

    return getSheetRows(worksheet, columns.length)
      .map(({ rowNumber, row, values }) => {
        let rowId = null;
        let businessValues = values;
        if (hasIdColumn) {
          rowId = toInt(values[0]);
          businessValues = values.slice(1);
        }

        const parsed = parseRow({ rowNumber, row, values: businessValues, sheetName });
        return { rowNumber, id: rowId, ...parsed };
      })
      .filter((entry) => rowHasOwnData(entry.rawValues ?? entry.values ?? []));
  },
  async importRows(db, parsedRows) {
    const result = { created: [], updated: [], errors: [] };

    for (const row of parsedRows) {
      if (row.errors?.length) {
        result.errors.push(...row.errors.map((error) => ({ row: row.rowNumber, ...error })));
        continue;
      }

      const imported = await importRow(db, row);
      if (imported.action === 'update') result.updated.push(imported.record);
      else if (imported.action === 'create') result.created.push(imported.record);
      else if (imported.action === 'error' && imported.errors) {
        result.errors.push(...imported.errors.map((error) => ({ row: row.rowNumber, ...error })));
      }
    }

    return result;
  },
});

export const buildDualSheetModule = ({
  parentSheetName,
  childSheetName,
  fileName,
  parentColumns,
  childColumns,
  exportAll,
  parseParentRow,
  parseChildRow,
  importRows,
}) => ({
  kind: 'dual',
  parentSheetName,
  childSheetName,
  fileName,
  parentColumns,
  childColumns,
  templateSheets() {
    return [
      { name: parentSheetName, columns: parentColumns, rows: [] },
      { name: childSheetName, columns: childColumns, rows: [] },
    ];
  },
  async exportSheets(db) {
    const quoteSheetName = (name) => /[^\w]/.test(name) ? `'${name}'` : name;
    const { parentRows, childRows } = await exportAll(db);

    // Build hyperlinks from child ref_code cells to parent rows
    const childRefColIdx = childColumns.findIndex(
      (col) => col.key.includes('ref_code') || col.key === 'refCode'
    );
    const parentRefColIdx = parentColumns.findIndex(
      (col) => col.key === 'ref_code' || col.key === 'refCode'
    );

    if (childRefColIdx !== -1 && parentRefColIdx !== -1) {
      const childRefKey = childColumns[childRefColIdx].key;
      const parentRefKey = parentColumns[parentRefColIdx].key;
      const parentColLetter = String.fromCharCode(65 + parentRefColIdx);
      const childColLetter = String.fromCharCode(65 + childRefColIdx);

      // Map parent ref_code -> parent row number (header is row 1, data starts row 2)
      const parentRefToRow = new Map();
      parentRows.forEach((row, index) => {
        const refValue = row[parentRefKey];
        if (refValue != null && refValue !== '') {
          parentRefToRow.set(String(refValue), index + 2);
        }
      });

      // Also track first child row per parent for reverse links
      const parentFirstChildRow = new Map();
      childRows.forEach((row, index) => {
        const refValue = row[childRefKey];
        if (refValue != null && refValue !== '') {
          const key = String(refValue);
          if (!parentFirstChildRow.has(key)) {
            parentFirstChildRow.set(key, index + 2);
          }
        }
      });

      // Convert child ref_code cells to hyperlinks pointing to parent sheet
      childRows.forEach((row) => {
        const refValue = row[childRefKey];
        if (refValue != null && refValue !== '') {
          if (typeof refValue === 'object' && refValue !== null && refValue.text) return;
          const targetRow = parentRefToRow.get(String(refValue));
          if (targetRow) {
            row[childRefKey] = {
              text: String(refValue),
              hyperlink: '#' + quoteSheetName(parentSheetName) + '!' + parentColLetter + targetRow,
            };
          }
        }
      });

      // Convert parent ref_code cells to hyperlinks pointing to first child item
      parentRows.forEach((row) => {
        const refValue = row[parentRefKey];
        if (refValue != null && refValue !== '') {
          if (typeof refValue === 'object' && refValue !== null && refValue.text) return;
          const targetRow = parentFirstChildRow.get(String(refValue));
          if (targetRow) {
            row[parentRefKey] = {
              text: String(refValue),
              hyperlink: '#' + quoteSheetName(childSheetName) + '!' + childColLetter + targetRow,
            };
          }
        }
      });
    }

    return [
      { name: parentSheetName, columns: parentColumns, rows: parentRows },
      { name: childSheetName, columns: childColumns, rows: childRows },
    ];
  },
  parseWorkbook(workbook) {
    const parentWorksheet = workbook.getWorksheet(parentSheetName) || workbook.worksheets[0];
    const childWorksheet = workbook.getWorksheet(childSheetName) || workbook.worksheets[1];

    if (!parentWorksheet || !childWorksheet) {
      throw new Error(`File Excel không đúng cấu trúc (thiếu sheet "${parentSheetName}" hoặc "${childSheetName}").`);
    }

    const parents = getSheetRows(parentWorksheet, parentColumns.length).map(({ rowNumber, row, values }) => ({
      rowNumber,
      ...parseParentRow({ rowNumber, row, values, sheetName: parentSheetName }),
    }));

    const children = getSheetRows(childWorksheet, childColumns.length).map(({ rowNumber, row, values }) => ({
      rowNumber,
      ...parseChildRow({ rowNumber, row, values, sheetName: childSheetName }),
    }));

    return { parents, children };
  },
  async importRows(db, parsed) {
    return importRows(db, parsed);
  },
});

export const buildSingleExportRow = (record, map) => map(record) || {};
