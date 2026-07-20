import logService from "../services/management/log.service.js";

export const logAction = ({ actionType, entityType, getEntityId, getOldData, getChanges }) => {
  return async (req, res, next) => {
    if (getOldData) {
      try {
        req.__oldData = await getOldData(req);
      } catch (e) {
        req.__oldData = null;
      }
    }

    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      try {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        const status = isSuccess ? "SUCCESS" : "FAILED";
        const entityId = getEntityId ? getEntityId(req, body) : req.params.id ? parseInt(req.params.id) : null;
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

        let details = [];
        if (!isSuccess) {
          details = [{ error: body?.message || "Lỗi không xác định" }];
        } else if (getChanges) {
          details = getChanges(req, body);
        }

        await logService.create({
          userId: req.user?.id ?? null,
          actionType,
          entityType,
          entityId,
          status,
          details,
          ipAddress,
        });
      } catch (err) {
        console.error("Log middleware error:", err.message);
      }

      return originalJson(body);
    };

    next();
  };
};
