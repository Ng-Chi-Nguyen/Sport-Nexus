import loyaltyManagementService from "../../services/management/loyalty.service.js";
import { t } from "../../locales/messages.js";

const ok = (res, req, data, message) =>
  res.json({ success: true, data, message: message ? t(req, message) : undefined });

const handleError = (res, req, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
  });
};

const loyaltyManagementController = {
  // Tiers
  createTier: async (req, res) => {
    try {
      const tier = await loyaltyManagementService.createTier(req.body);
      return ok(res, req, tier, "Tạo hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  getAllTiers: async (req, res) => {
    try {
      const tiers = await loyaltyManagementService.getAllTiers();
      return ok(res, req, { tiers });
    } catch (e) { return handleError(res, req, e); }
  },
  updateTier: async (req, res) => {
    try {
      const tier = await loyaltyManagementService.updateTier(req.params.id, req.body);
      return ok(res, req, tier, "Cập nhật hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  deleteTier: async (req, res) => {
    try {
      await loyaltyManagementService.deleteTier(req.params.id);
      return ok(res, req, null, "Xóa hạng thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  getHiddenCoupons: async (req, res) => {
    try {
      const coupons = await loyaltyManagementService.getHiddenCoupons();
      return ok(res, req, { coupons });
    } catch (e) { return handleError(res, req, e); }
  },

  // Rewards
  createReward: async (req, res) => {
    try {
      const reward = await loyaltyManagementService.createReward(req.body);
      return ok(res, req, reward, "Tạo quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  getAllRewards: async (req, res) => {
    try {
      const rewards = await loyaltyManagementService.getAllRewards();
      return ok(res, req, { rewards });
    } catch (e) { return handleError(res, req, e); }
  },
  updateReward: async (req, res) => {
    try {
      const reward = await loyaltyManagementService.updateReward(req.params.id, req.body);
      return ok(res, req, reward, "Cập nhật quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },
  deleteReward: async (req, res) => {
    try {
      await loyaltyManagementService.deleteReward(req.params.id);
      return ok(res, req, null, "Xóa quà thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  // Settings
  getSettings: async (req, res) => {
    try {
      const settings = await loyaltyManagementService.getSettings();
      return ok(res, req, settings);
    } catch (e) { return handleError(res, req, e); }
  },
  updateSettings: async (req, res) => {
    try {
      const settings = await loyaltyManagementService.updateSettings(req.body);
      return ok(res, req, settings, "Cập nhật cấu hình thành công");
    } catch (e) { return handleError(res, req, e); }
  },

  // Users
  getUsers: async (req, res) => {
    try {
      const { page, search, sortBy, order, tierId } = req.query;
      const data = await loyaltyManagementService.getUsers({ page, search, sortBy, order, tierId });
      return ok(res, req, data);
    } catch (e) { return handleError(res, req, e); }
  },
  getUserDetail: async (req, res) => {
    try {
      const data = await loyaltyManagementService.getUserDetail(req.params.id);
      return ok(res, req, data);
    } catch (e) { return handleError(res, req, e); }
  },
  adjustPoints: async (req, res) => {
    try {
      const { points, note } = req.body;
      const data = await loyaltyManagementService.adjustPoints(req.params.id, points, note);
      return ok(res, req, data, "Điều chỉnh điểm thành công");
    } catch (e) { return handleError(res, req, e); }
  },
};

export default loyaltyManagementController;
