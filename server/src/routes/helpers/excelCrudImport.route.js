import { uploadExcelFile } from '../../middlewares/fileUpload.middleware.js';
import { checkPermission, verifyToken } from '../../middlewares/verifyToken.middlware.js';
import { createExcelCrudImportController } from '../../controllers/common/excelCrudImport.controller.js';

export const attachExcelCrudImportRoutes = (router, { moduleKey, importPermission = null }) => {
  const controller = createExcelCrudImportController(moduleKey);

  const importMiddlewares = [verifyToken];
  if (importPermission) {
    importMiddlewares.push(checkPermission(importPermission));
  }

  router
    .post('/import/preview', ...importMiddlewares, uploadExcelFile, controller.previewImport)
    .post('/import', ...importMiddlewares, uploadExcelFile, controller.importFile)
    .get('/export', verifyToken, controller.exportFile)
    .get('/template', verifyToken, controller.downloadTemplate);

  return router;
};
