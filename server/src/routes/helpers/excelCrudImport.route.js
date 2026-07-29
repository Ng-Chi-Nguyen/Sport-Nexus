import { uploadExcelFile } from '../../middlewares/fileUpload.middleware.js';
import { checkPermission, verifyToken } from '../../middlewares/verifyToken.middlware.js';
import { createExcelCrudImportController } from '../../controllers/common/excelCrudImport.controller.js';

export const attachExcelCrudImportRoutes = (router, { moduleKey, importPermission = null, exportPermission = null }) => {
  const controller = createExcelCrudImportController(moduleKey);

  const importMiddlewares = [verifyToken];
  if (importPermission) {
    importMiddlewares.push(checkPermission(importPermission));
  }

  const exportMiddlewares = [verifyToken];
  if (exportPermission) {
    exportMiddlewares.push(checkPermission(exportPermission));
  }

  router
    .post('/import/preview', ...importMiddlewares, uploadExcelFile, controller.previewImport)
    .post('/import', ...importMiddlewares, uploadExcelFile, controller.importFile)
    .get('/export', ...exportMiddlewares, controller.exportFile)
    .get('/template', ...exportMiddlewares, controller.downloadTemplate);

  return router;
};
