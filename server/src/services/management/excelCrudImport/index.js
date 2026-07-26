import prisma from '../../../db/prisma.js';
import { ACTIVE } from '../../../utils/prisma.js';
import { buildWorkbookBuffer, loadWorkbook } from './workbook.js';
import { getExcelCrudModuleConfig } from './config.js';

const toSummary = (result) => ({
  total: result.total ?? 0,
  success: result.success ?? 0,
  failed: result.failed ?? 0,
  created: result.created ?? [],
  updated: result.updated ?? [],
  errors: result.errors ?? [],
});

export const createExcelCrudImportService = ({ db = prisma } = {}) => ({
  async generateTemplate(moduleKey) {
    const moduleConfig = getExcelCrudModuleConfig(moduleKey);
    const sheets = await moduleConfig.templateSheets(db);
    return buildWorkbookBuffer(sheets);
  },

  async generateExport(moduleKey) {
    const moduleConfig = getExcelCrudModuleConfig(moduleKey);
    const sheets = await moduleConfig.exportSheets(db);
    return buildWorkbookBuffer(sheets);
  },

  async previewImport(moduleKey, buffer) {
    const moduleConfig = getExcelCrudModuleConfig(moduleKey);
    const workbook = await loadWorkbook(buffer);
    const parsed = moduleConfig.parseWorkbook(workbook);

    if (moduleConfig.kind === 'single') {
      const total = parsed.filter((row) => row.errors?.length || row.data || row.id || row.rawValues).length;
      const success = parsed.filter((row) => !row.errors?.length).length;
      const errors = parsed.flatMap((row) => (row.errors || []).map((error) => ({ row: row.rowNumber, ...error })));

      return toSummary({ total, success, failed: errors.length, errors });
    }

    const parentErrors = parsed.parents.flatMap((row) => (row.errors || []).map((error) => ({ row: row.rowNumber, ...error })));
    const childErrors = parsed.children.flatMap((row) => (row.errors || []).map((error) => ({ row: row.rowNumber, ...error })));
    const success = parsed.parents.filter((row) => !(row.errors?.length)).length;
    const total = parsed.parents.length + parsed.children.length;
    const errors = [...parentErrors, ...childErrors];

    return toSummary({ total, success, failed: errors.length, errors });
  },

  async importFile(moduleKey, buffer) {
    const moduleConfig = getExcelCrudModuleConfig(moduleKey);
    const workbook = await loadWorkbook(buffer);
    const parsed = moduleConfig.parseWorkbook(workbook);

    const summary = moduleConfig.kind === 'single'
      ? await moduleConfig.importRows(db, parsed)
      : await moduleConfig.importRows(db, parsed);

    const total = moduleConfig.kind === 'single'
      ? parsed.filter((row) => row.errors?.length || row.data || row.id || row.rawValues).length
      : parsed.parents.length + parsed.children.length;
    const success = (summary.created?.length || 0) + (summary.updated?.length || 0);

    return toSummary({
      total,
      success,
      failed: summary.errors?.length || 0,
      created: summary.created,
      updated: summary.updated,
      errors: summary.errors,
    });
  },
});

const excelCrudImportService = createExcelCrudImportService();

export default excelCrudImportService;
