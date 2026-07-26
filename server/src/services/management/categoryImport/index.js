import ExcelJS from 'exceljs';
import slugify from 'slugify';
import prisma from '../../../db/prisma.js';
import { ACTIVE } from '../../../utils/prisma.js';
import {
    buildCategoryExportBuffer,
    buildCategoryTemplateBuffer,
} from './workbook.js';

// ==========================================
// CONSTANTS & PALETTE CONFIG
// ==========================================
const CONFIG = {
    MAX_ROWS: 1000,
    BATCH_SIZE: 100,
    ERROR_FILE_TTL_MS: 30 * 60 * 1000, // 30 phút
};

// Memory Store quản lý Error Files tạm thời
const errorFileStore = new Map();

const cleanupErrorFiles = () => {
    const now = Date.now();
    for (const [token, entry] of errorFileStore.entries()) {
        if (now - entry.createdAt > CONFIG.ERROR_FILE_TTL_MS) {
            errorFileStore.delete(token);
        }
    }
};
setInterval(cleanupErrorFiles, 5 * 60 * 1000).unref();

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const readCellText = (cell) => {
    return typeof cell?.value === 'string' ? cell.value.trim() : '';
};

const findStatusColumn = (ws) => {
    const headerRow = ws.getRow(1);

    for (let col = 1; col <= Math.max(ws.columnCount, 3); col++) {
        const header = readCellText(headerRow.getCell(col)).toLowerCase();
        if (header.includes('trạng thái') || header.includes('status')) {
            return col;
        }
    }

    return ws.columnCount >= 3 ? 3 : 2;
};

// ==========================================
// SERVICE IMPLEMENTATION
// ==========================================
const categoryImportService = {
    /**
     * Tạo File Template Excel (.xlsx) chứa sẵn ảnh nhúng thực tế
     */
    generateTemplate: async () => buildCategoryTemplateBuffer(),

    /**
     * Parse File Excel: chỉ đọc tên danh mục và trạng thái
     */
    parseFile: async (fileBuffer) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const ws = workbook.getWorksheet('Categories') || workbook.worksheets[0];

        if (!ws) {
            throw new Error('File Excel không đúng cấu trúc (thiếu sheet "Categories").');
        }

        const rows = [];
        const memoryNameSet = new Set();
        const statusCol = findStatusColumn(ws);

        // 1. Parse dữ liệu từng dòng
        ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Bỏ qua header

            const name = readCellText(row.getCell(1));
            const isActiveRaw = readCellText(row.getCell(statusCol));
            const image = null;

            // Bỏ qua dòng rỗng hoàn toàn
            if (!name && !image && !isActiveRaw) return;

            const errors = [];

            // Validate Name
            if (!name) {
                errors.push({ field: 'name', message: 'Tên danh mục không được để trống' });
            } else if (name.length > 191) {
                errors.push({ field: 'name', message: 'Tên danh mục không được vượt quá 191 ký tự' });
            } else {
                const lowerName = name.toLowerCase();
                if (memoryNameSet.has(lowerName)) {
                    errors.push({ field: 'name', message: `Tên danh mục "${name}" bị trùng lặp trong file` });
                } else {
                    memoryNameSet.add(lowerName);
                }
            }

            // Validate Status
            let isActive = true;
            if (isActiveRaw) {
                if (isActiveRaw === 'Hoạt động') {
                    isActive = true;
                } else if (isActiveRaw === 'Ngừng') {
                    isActive = false;
                } else {
                    errors.push({ field: 'is_active', message: 'Trạng thái phải là "Hoạt động" hoặc "Ngừng"' });
                }
            }

            rows.push({
                row: rowNumber,
                name,
                slug: '',
                image,
                is_active: isActive,
                errors,
            });
        });

        if (rows.length > CONFIG.MAX_ROWS) {
            throw new Error(`File vượt quá số lượng dòng tối đa cho phép (${CONFIG.MAX_ROWS} dòng).`);
        }

        return rows;
    },

    /**
     * Lưu dữ liệu vào Database theo Chunk Batching
     */
    importCategories: async (parsedRows) => {
        const validRows = parsedRows.filter((r) => r.errors.length === 0);
        const errorRows = parsedRows.filter((r) => r.errors.length > 0);

        const existingCats = await prisma.categories.findMany({
            where: { deleted_at: ACTIVE },
            select: { id: true, name: true, slug: true },
        });

        const existingByName = new Map(existingCats.map((c) => [c.name.toLowerCase(), c]));
        const usedSlugs = new Set(existingCats.map((c) => c.slug));

        const toCreate = [];
        const toUpdate = [];

        validRows.forEach((row) => {
            const lowerName = row.name.toLowerCase();
            const existing = existingByName.get(lowerName);

            if (existing) {
                toUpdate.push({
                    id: existing.id,
                    image: row.image || null,
                    is_active: row.is_active,
                });
            } else {
                let baseSlug = slugify(row.name, {
                    replacement: '-',
                    lower: true,
                    strict: true,
                    locale: 'vi',
                }) || 'category';

                let slug = baseSlug;
                let counter = 1;
                while (usedSlugs.has(slug)) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(slug);

                toCreate.push({
                    name: row.name,
                    slug,
                    image: row.image || null,
                    is_active: row.is_active,
                });
            }
        });

        const imported = [];
        const updated = [];

        // 1. Create Batching
        for (let i = 0; i < toCreate.length; i += CONFIG.BATCH_SIZE) {
            const batch = toCreate.slice(i, i + CONFIG.BATCH_SIZE);
            const result = await prisma.$transaction(
                batch.map((data) => prisma.categories.create({ data }))
            );
            imported.push(...result);
        }

        // 2. Update Batching
        for (let i = 0; i < toUpdate.length; i += CONFIG.BATCH_SIZE) {
            const batch = toUpdate.slice(i, i + CONFIG.BATCH_SIZE);
            const result = await prisma.$transaction(
                batch.map((item) =>
                    prisma.categories.update({
                        where: { id: item.id },
                        data: { image: item.image, is_active: item.is_active },
                    })
                )
            );
            updated.push(...result);
        }

        // File báo lỗi nếu có
        let errorFileUrl = null;
        if (errorRows.length > 0) {
            const token = crypto.randomBytes(16).toString('hex');
            errorFileStore.set(token, {
                createdAt: Date.now(),
                rows: errorRows,
            });
            errorFileUrl = `/api/v1/management/categories/import/error-file/${token}`;
        }

        return {
            total: parsedRows.length,
            success: imported.length + updated.length,
            failed: errorRows.length,
            errors: errorRows.flatMap((r) =>
                r.errors.map((e) => ({ row: r.row, field: e.field, message: e.message }))
            ),
            imported: imported.map((c) => ({ id: c.id, name: c.name })),
            updated: updated.map((c) => ({ id: c.id, name: c.name })),
            errorFileUrl,
        };
    },

    /**
     * Preview Import: chỉ parse + validate, không save DB
     */
    previewImport: async (fileBuffer) => {
        const parsedRows = await categoryImportService.parseFile(fileBuffer);
        const validRows = parsedRows.filter((r) => r.errors.length === 0);
        const errorRows = parsedRows.filter((r) => r.errors.length > 0);

        return {
            total: parsedRows.length,
            success: validRows.length,
            failed: errorRows.length,
            errors: errorRows.flatMap((r) =>
                r.errors.map((e) => ({ row: r.row, field: e.field, message: e.message }))
            ),
        };
    },

    /**
     * Export toàn bộ Categories ra file Excel với Thumbnail
     */
    generateExport: async () => {
        const categories = await prisma.categories.findMany({
            where: { deleted_at: ACTIVE },
            select: { name: true, image: true, is_active: true },
            orderBy: { id: 'asc' },
        });
        return buildCategoryExportBuffer(categories, fetchImageBuffer);
    },

    /**
     * Xuất file Excel chứa chi tiết các dòng lỗi từ Token
     */
    getErrorFile: async (token) => {
        const entry = errorFileStore.get(token);
        if (!entry) {
            throw new Error('File báo lỗi không tồn tại hoặc đã hết hạn (chỉ tồn tại trong 30 phút).');
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SportNexus';

        const ws = workbook.addWorksheet('Danh sách lỗi', {
            views: [{ showGridLines: true }],
        });

        ws.columns = [
            { header: 'Dòng số', key: 'row', width: 12 },
            { header: 'Tên danh mục', key: 'name', width: 35 },
            { header: 'Trạng thái', key: 'is_active', width: 15 },
            { header: 'Mô tả lỗi chi tiết', key: 'errors', width: 65 },
        ];

        const headerRow = ws.getRow(1);
        headerRow.height = 36;
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALETTE.ERROR_HEADER } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13, name: 'Calibri' };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        entry.rows.forEach((r) => {
            ws.addRow({
                row: r.row,
                name: r.name,
                is_active: r.is_active ? 'Hoạt động' : 'Ngừng',
                errors: r.errors.map((e) => e.message).join('; '),
            });
        });

        return await workbook.xlsx.writeBuffer();
    },
};

export default categoryImportService;
