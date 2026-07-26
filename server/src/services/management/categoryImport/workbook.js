import ExcelJS from 'exceljs';
import sharp from 'sharp';

const CONFIG = {
    MAX_ROWS: 1000,
};

const PALETTE = {
    REQUIRED_HEADER: 'FF667EEA',
    OPTIONAL_HEADER: 'FFA8B5E8',
    EXPORT_HEADER: 'FF2563EB',
    ERROR_HEADER: 'FFDC2626',
    BORDER_DARK: 'FF475569',
    BORDER_LIGHT: 'FFE5E7EB',
    SAMPLE_BG_REQ: 'FFFEF3C7',
    SAMPLE_BG_OPT: 'FFF9FAFB',
    ZEBRA_BG: 'FFF9FAFB',
    TEXT_MAIN: 'FF1E293B',
    TEXT_MUTED: 'FF475569',
};

const detectBufferExtension = (buffer) => {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;

    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return 'png';
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'jpeg';
    }

    if (
        buffer.length >= 4 &&
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38
    ) {
        return 'gif';
    }

    if (
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
    ) {
        return 'webp';
    }

    return null;
};

export const prepareImageForExcel = async ({ buffer }) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return null;

    const detectedExtension = detectBufferExtension(buffer);
    if (!detectedExtension) return null;

    if (detectedExtension === 'png' || detectedExtension === 'jpeg') {
        return { buffer, extension: detectedExtension };
    }

    try {
        const pngBuffer = await sharp(buffer).png().toBuffer();
        return { buffer: pngBuffer, extension: 'png' };
    } catch {
        return null;
    }
};

const buildTemplateWorksheet = (workbook) => {
    const ws = workbook.addWorksheet('Categories', {
        properties: { tabColor: { argb: PALETTE.REQUIRED_HEADER } },
        views: [{ showGridLines: true }],
    });

    ws.columns = [
        { header: 'Tên danh mục *', key: 'name', width: 38 },
        { header: 'Trạng thái', key: 'is_active', width: 18 },
    ];

    for (let rowIndex = 2; rowIndex <= 1001; rowIndex++) {
        ws.getRow(rowIndex).height = 28;
    }

    const headerRow = ws.getRow(1);
    headerRow.height = 34;

    for (let col = 1; col <= 2; col++) {
        const cell = headerRow.getCell(col);
        const isRequired = col === 1;

        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isRequired ? PALETTE.REQUIRED_HEADER : PALETTE.OPTIONAL_HEADER },
        };
        cell.font = {
            bold: true,
            color: { argb: isRequired ? 'FFFFFFFF' : PALETTE.TEXT_MAIN },
            size: isRequired ? 14 : 13,
            name: 'Calibri',
        };
        cell.border = {
            top: { style: 'thin', color: { argb: PALETTE.BORDER_DARK } },
            left: { style: 'thin', color: { argb: PALETTE.BORDER_DARK } },
            bottom: { style: 'medium', color: { argb: 'FF334155' } },
            right: { style: 'thin', color: { argb: PALETTE.BORDER_DARK } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }

    ws.dataValidations.add('B2:B1001', {
        type: 'list',
        formulae: ['"Hoạt động,Ngừng"'],
        showErrorMessage: true,
        errorTitle: 'Giá trị không hợp lệ',
        error: 'Vui lòng chọn "Hoạt động" hoặc "Ngừng"',
    });

    ws.addConditionalFormatting({
        ref: 'A2:A1001',
        rules: [
            {
                type: 'expression',
                formulae: ['A2=""'],
                priority: 1,
                style: {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
                    font: { color: { argb: 'FF991B1B' } },
                    border: {
                        top: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                        bottom: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                        left: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                        right: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                    },
                },
            },
        ],
    });

    const instructionsSheet = workbook.addWorksheet('Hướng dẫn', {
        properties: { tabColor: { argb: PALETTE.REQUIRED_HEADER } },
        views: [{ showGridLines: true }],
    });

    instructionsSheet.getCell('A1').value = 'HƯỚNG DẪN NHẬP DANH MỤC';
    instructionsSheet.getCell('A1').font = { bold: true, size: 20, color: { argb: PALETTE.REQUIRED_HEADER }, name: 'Calibri' };
    instructionsSheet.mergeCells('A1:B1');
    instructionsSheet.getRow(1).height = 48;

    const instructions = [
        ['1. Cột "Tên danh mục *"', 'Bắt buộc. Tối đa 191 ký tự. Không được trùng lặp.'],
        ['2. Cột "Trạng thái"', 'Chọn từ dropdown (Hoạt động / Ngừng). Mặc định là Hoạt động.'],
        ['3. Ảnh danh mục', 'Không nhập ảnh trong file import. Ảnh được cập nhật ở màn admin khi tạo/sửa danh mục.'],
        ['4. Dữ liệu nhập', 'Bắt đầu nhập dữ liệu từ dòng 2.'],
        ['5. Giới hạn', `Tối đa ${CONFIG.MAX_ROWS.toLocaleString()} dòng mỗi lần import. File max 5MB.`],
    ];

    instructions.forEach(([title, detail], idx) => {
        const rowNum = idx + 3;
        const r = instructionsSheet.getRow(rowNum);
        r.height = 26;

        const cellA = instructionsSheet.getCell(`A${rowNum}`);
        cellA.value = title;
        cellA.font = { bold: true, size: 12, color: { argb: PALETTE.TEXT_MAIN }, name: 'Calibri' };
        cellA.alignment = { vertical: 'middle' };

        const cellB = instructionsSheet.getCell(`B${rowNum}`);
        cellB.value = detail;
        cellB.font = { size: 12, color: { argb: PALETTE.TEXT_MUTED }, name: 'Calibri' };
        cellB.alignment = { vertical: 'middle' };
    });

    instructionsSheet.getColumn('A').width = 28;
    instructionsSheet.getColumn('B').width = 75;

    return ws;
};

const buildExportWorksheet = async (workbook, categories, fetchImageBuffer) => {
    const ws = workbook.addWorksheet('Categories', {
        views: [{ showGridLines: true }],
    });

    ws.columns = [
        { header: 'Tên danh mục', key: 'name', width: 35 },
        { header: 'URL ảnh', key: 'image', width: 22 },
        { header: 'Trạng thái', key: 'is_active', width: 18 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 36;
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.EXPORT_HEADER } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13, name: 'Calibri' };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const rowIndex = i + 2;

        const row = ws.addRow({
            name: cat.name,
            image: '',
            is_active: cat.is_active ? 'Hoạt động' : 'Ngừng',
        });
        row.height = 60;

        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                bottom: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                left: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
                right: { style: 'thin', color: { argb: PALETTE.BORDER_LIGHT } },
            };
            if (i % 2 === 0) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.ZEBRA_BG } };
            }
        });

        const statusCell = row.getCell(3);
        if (cat.is_active) {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            statusCell.font = { bold: true, color: { argb: 'FF15803D' }, size: 11, name: 'Calibri' };
        } else {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            statusCell.font = { bold: true, color: { argb: 'FFB91C1C' }, size: 11, name: 'Calibri' };
        }
    }

    const exportImageTasks = await Promise.all(
        categories.map(async (cat, idx) => {
            if (!cat.image) return null;

            const imgData = await fetchImageBuffer(cat.image);
            const excelImage = await prepareImageForExcel(imgData);
            if (!excelImage) return null;

            return {
                rowIndex: idx + 2,
                imgData: excelImage,
            };
        })
    );

    for (const item of exportImageTasks.filter(Boolean)) {
        try {
            const imgId = workbook.addImage({
                buffer: item.imgData.buffer,
                extension: item.imgData.extension,
            });
            ws.addImage(imgId, {
                tl: { col: 1.1, row: item.rowIndex - 0.9 },
                ext: { width: 80, height: 50 },
                editAs: 'oneCell',
            });
        } catch {
            ws.getRow(item.rowIndex).getCell(2).value = categories[item.rowIndex - 2].image;
        }
    }

    return ws;
};

export const buildCategoryTemplateBuffer = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SportNexus';
    workbook.created = new Date();

    buildTemplateWorksheet(workbook);

    return workbook.xlsx.writeBuffer();
};

export const buildCategoryExportBuffer = async (categories, fetchImageBuffer) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SportNexus';

    await buildExportWorksheet(workbook, categories, fetchImageBuffer);

    return workbook.xlsx.writeBuffer();
};
