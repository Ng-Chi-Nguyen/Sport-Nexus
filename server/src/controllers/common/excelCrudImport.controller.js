import excelCrudImportService from '../../services/management/excelCrudImport/index.js';
import { getExcelCrudModuleConfig } from '../../services/management/excelCrudImport/config.js';

export const createExcelCrudImportController = (moduleKey) => {
  const moduleConfig = getExcelCrudModuleConfig(moduleKey);

  return {
    previewImport: async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'Vui lòng chọn file .xlsx để xem trước.' });
        }

        const result = await excelCrudImportService.previewImport(moduleKey, req.file.buffer);
        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Đã xảy ra lỗi khi đọc file.' });
      }
    },

    importFile: async (req, res) => {
      req.setTimeout(180000);

      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'Vui lòng chọn file .xlsx để import.' });
        }

        const result = await excelCrudImportService.importFile(moduleKey, req.file.buffer);
        return res.status(200).json({
          success: true,
          message: `Import hoàn tất: ${result.success} thành công, ${result.failed} lỗi.`,
          data: result,
        });
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Đã xảy ra lỗi trong quá trình xử lý Import.' });
      }
    },

    exportFile: async (req, res) => {
      req.setTimeout(180000);

      try {
        const buffer = await excelCrudImportService.generateExport(moduleKey);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="export-${moduleConfig.fileName}"`);
        return res.send(buffer);
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    },

    downloadTemplate: async (req, res) => {
      req.setTimeout(180000);

      try {
        const buffer = await excelCrudImportService.generateTemplate(moduleKey);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="template-${moduleConfig.fileName}"`);
        return res.send(buffer);
      } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
    },
  };
};
