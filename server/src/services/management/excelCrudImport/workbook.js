import ExcelJS from "exceljs";

const HEADER_BG = "FF1E40AF";
const HEADER_FG = "FFFFFFFF";

/**
 * Auto-fit column widths based on cell content.
 * For each column, measure the longest text (header + data) and set width accordingly.
 */
const autoFitColumns = (ws) => {
  if (!ws.columns) return;

  ws.columns.forEach((col, colIndex) => {
    let maxWidth = 0;

    for (let rowIdx = 1; rowIdx <= ws.rowCount; rowIdx++) {
      const cell = ws.getCell(rowIdx, colIndex + 1);
      let cellText = "";

      if (cell.value && typeof cell.value === "object") {
        if (cell.value.text) cellText = String(cell.value.text);
        else if (cell.value.formula) cellText = "";
        else cellText = String(cell.value);
      } else if (cell.value != null) {
        cellText = String(cell.value);
      }

      // Estimate width: count chars, with wider chars (Vietnamese, etc.) counting more
      let width = 0;
      for (const ch of cellText) {
        width += ch.charCodeAt(0) > 127 ? 1.8 : 1; // wider for Unicode
      }
      width += 2; // padding

      if (width > maxWidth) maxWidth = width;
    }

    // Set width, with min/max bounds
    col.width = Math.max(10, Math.min(60, Math.ceil(maxWidth)));
  });
};

export const buildWorkbookBuffer = async (sheets, { addBlankRow = false } = {}) => {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name);
    ws.columns = sheet.columns;

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: HEADER_FG }, size: 11 };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    ws.views = [{ state: "frozen", ySplit: 1 }];

    if (Array.isArray(sheet.rows) && sheet.rows.length > 0) {
      ws.addRows(sheet.rows);

      // Apply number formatting
      sheet.columns.forEach((col, colIndex) => {
        if (col.numFmt) {
          for (let rowIdx = 2; rowIdx <= ws.rowCount; rowIdx++) {
            ws.getCell(rowIdx, colIndex + 1).numFmt = col.numFmt;
          }
        }
      });
    } else if (addBlankRow) {
      ws.addRow(Array.from({ length: sheet.columns.length }, () => null));
    }

    sheet.columns.forEach((col, index) => {
      if (col.validation) {
        const colLetter = String.fromCharCode(65 + index);
        ws.dataValidations.add(colLetter + "2:" + colLetter + "1000", col.validation);
      }
    });

    // Auto-fit column widths after all data is populated
    autoFitColumns(ws);
  }

  return workbook.xlsx.writeBuffer();
};

export const loadWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
};

export const getSheetRows = (worksheet, columnCount) => {
  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const values = [];
    for (let col = 1; col <= columnCount; col++) {
      values.push(row.getCell(col).value ?? null);
    }
    const hasData = values.some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    });
    if (!hasData) continue;
    rows.push({ rowNumber, row, values });
  }
  return rows;
};
