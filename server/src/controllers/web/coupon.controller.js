import couponWebService from "../../services/web/coupon.service.js";

const couponController = {
    getActiveCoupons: async (req, res) => {
        try {
            const coupons = await couponWebService.getActiveCoupons();
            return res.status(200).json({
                success: true,
                data: { coupons },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    getCouponsByCodes: async (req, res) => {
        try {
            const codes = String(req.query.codes || "")
                .split(",")
                .map((code) => code.trim())
                .filter(Boolean);
            const coupons = await couponWebService.getCouponsByCodes(codes);
            return res.status(200).json({
                success: true,
                data: { coupons },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};

export default couponController;
