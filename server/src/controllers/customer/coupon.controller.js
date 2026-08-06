import couponCustomerService from "../../services/customer/coupon.service.js";

import { t } from "../../locales/messages.js";
const couponCustomerController = {
  checkCoupon: async (req, res) => {
    try {
      const { amount, code } = req.body;
      const result = await couponCustomerService.checkCoupon({
        userId: req.user.id,
        amount,
        code,
      });

      if (result.message) {
        const { message, ...extra } = result;
        return res.status(400).json({
          success: false,
          message: t(req, message),
          ...extra,
        });
      }

      return res.json({
        success: true,
        data: result,
        message: t(req, "Thêm mã giảm giá thành công"),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: t(req, "Lỗi server nội bộ"),
        error: error.message,
      });
    }
  },

  getGiftedCoupons: async (req, res) => {
    try {
      const coupons = await couponCustomerService.getGiftedCoupons(req.user.id);
      return res.status(200).json({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: t(req, "Lỗi server nội bộ"),
        error: error.message,
      });
    }
  },
};

export default couponCustomerController;