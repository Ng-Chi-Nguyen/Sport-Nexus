import ExcelJS from "exceljs";
import AdmZip from "adm-zip";

const HEADER_BG = "FF1E40AF";
const HEADER_FG = "FFFFFFFF";

const fixInternalHyperlinks = (buffer) => {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  let modified = false;

  for (const entry of entries) {
    const name = entry.entryName;
    if (!name.startsWith("xl/worksheets/sheet") || !name.endsWith(".xml")) continue;

    const relsName = name.replace("/sheet", "/_rels/sheet").replace(".xml", ".xml.rels");
    const relsEntry = zip.getEntry(relsName);
    if (!relsEntry) continue;

    let relsText = relsEntry.getData().toString("utf-8");
    let sheetText = entry.getData().toString("utf-8");
    let sheetModified = false;

    // Collect all matches first
    const matches = [];
    const relRegex = /<Relationship\s+Id="([^"]+)"\s+Type="[^"]*hyper[Ll]ink[^"]*"\s+Target="#([^"]+)"\s+TargetMode="External"\s*\/>/g;
    let match;
    while ((match = relRegex.exec(relsText)) !== null) {
      matches.push({ full: match[0], relId: match[1], loc: match[2] });
    }

    // Apply all fixes after collecting matches
    for (const { full, relId, loc } of matches) {
      // Remove r:id from sheet XML
      sheetText = sheetText.replace(' r:id="' + relId + '"', "");

      // Fix location value (remove # prefix)
      const locWithHash = 'location="#' + loc + '"';
      const locWithoutHash = 'location="' + loc + '"';
      sheetText = sheetText.replace(locWithHash, locWithoutHash);

      // Remove relationship from rels
      relsText = relsText.replace(full, "");
      sheetModified = true;
      modified = true;
    }

    if (sheetModified) {
      relsText = relsText.replace(
        /<Relationships>\s*<\/Relationships>/,
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>'
      );
      zip.updateFile(relsName, Buffer.from(relsText, "utf-8"));
      zip.updateFile(name, Buffer.from(sheetText, "utf-8"));
    }
  }

  return modified ? zip.toBuffer() : buffer;
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
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return fixInternalHyperlinks(buffer);
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
