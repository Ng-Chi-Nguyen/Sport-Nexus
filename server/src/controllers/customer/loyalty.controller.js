import loyaltyService from "../../services/customer/loyalty.service.js";
import { t } from "../../locales/messages.js";

const loyaltyCustomerController = {
  getMembership: async (req, res) => {
    try {
      const data = await loyaltyService.getUserMembership(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  getRewards: async (req, res) => {
    try {
      const data = await loyaltyService.getTierRewards(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  redeemReward: async (req, res) => {
    try {
      const { rewardId } = req.params;
      const result = await loyaltyService.redeemReward(req.user.id, rewardId);
      return res.json({
        success: true,
        data: result,
        message: t(req, "Đổi quà thành công"),
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const data = await loyaltyService.getTransactions(req.user.id);
      return res.json({ success: true, data });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },

  applyPoints: async (req, res) => {
    try {
      const { points } = req.body;
      const result = await loyaltyService.applyPoints(req.user.id, points);
      return res.json({
        success: true,
        data: result,
        message: t(req, "Áp dụng điểm thành công"),
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: t(req, status === 500 ? "Lỗi server nội bộ" : error.message),
      });
    }
  },
};

export default loyaltyCustomerController;
