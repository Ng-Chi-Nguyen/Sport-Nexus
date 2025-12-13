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
    }
}

export default couponController;