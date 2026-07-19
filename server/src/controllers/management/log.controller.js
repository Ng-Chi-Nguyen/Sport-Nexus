import logService from "../../services/management/log.service.js";

const logController = {
  getAll: async (req, res) => {
    try {
      const { page, user_id, action_type, entity_type, status, from, to, ip_address, search } = req.query;
      const result = await logService.getAll({
        page: parseInt(page || 1),
        userId: user_id,
        actionType: action_type,
        entityType: entity_type,
        status,
        from,
        to,
        ipAddress: ip_address,
        search,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách logs.",
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const log = await logService.getById(req.params.id);
      if (!log) {
        return res.status(404).json({ success: false, message: "Không tìm thấy log." });
      }
      return res.status(200).json({ success: true, data: log });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy chi tiết log.",
        error: error.message,
      });
    }
  },
};

export default logController;
