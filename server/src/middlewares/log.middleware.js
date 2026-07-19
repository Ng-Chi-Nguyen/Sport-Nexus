import logService from "../services/management/log.service.js";

export const logAction = ({ actionType, entityType, getEntityId, getDetails }) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      try {
        const status = res.statusCode >= 200 && res.statusCode < 300 ? "SUCCESS" : "FAILED";
        const entityId = getEntityId ? getEntityId(req, body) : req.params.id ? parseInt(req.params.id) : null;
        const details = getDetails ? getDetails(req, body) : [];
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || null;

        await logService.create({
          userId: req.user?.id,
          actionType,
          entityType,
          entityId,
          status,
          details: status === "FAILED" ? [{ error: body?.message || "Unknown error" }] : details,
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
