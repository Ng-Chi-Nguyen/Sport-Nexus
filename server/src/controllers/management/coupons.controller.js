import couponService from "../../services/management/coupon.service.js";

const couponController = {
    createCoupon: async (req, res) => {
        let couponData = req.body;
        try {

            let newCoupon = await couponService.createCoupon(couponData)

            return res.status(201).json({
                success: true,
                message: "Tạo mã giảm giá thành công",
                data: newCoupon
            })
        } catch (error) {

            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    message: `Mã code '${couponData.code}' đã được sữ dụng`,
                })
            }

            return res.status(500).json({
                success: false,
                message: error.message,
                code: error.code
            })
        }
    },

    getCouponById: async (req, res) => {
        let couponId = parseInt(req.params.id);
        try {
            let coupon = await couponService.getCouponById(couponId);

            if (!coupon || coupon.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(200).json({
                success: true,
                data: coupon
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getAllCoupon: async (req, res) => {
        try {
            let list_coupons = await couponService.getAllCoupon();

            if (!list_coupons || list_coupons.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(200).json({
                success: true,
                data: list_coupons
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    updateCoupon: async (req, res) => {
        let dataUpdate = req.body;
        let couponId = parseInt(req.params.id);
        try {
            let updateData = await couponService.updateCoupon(couponId, dataUpdate)
            return res.status(200).json({
                success: true,
                data: updateData,
                message: "Đã cập nhật mã giảm giá"
            })
        } catch (error) {

            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy mã giảm giá để cập nhật." });
            }

            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    },

    deleteCoupon: async (req, res) => {
        let couponId = parseInt(req.params.id);
        try {
            await couponService.deleteCoupon(couponId)
            return res.status(200).json({
                success: true,
                message: "Đã xóa mã giảm giá"
            })
        } catch (error) {

            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy mã giảm giá để xóa." });
            }

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export default couponController;