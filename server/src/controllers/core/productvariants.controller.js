import productVariantService from "../../services/core/productvariants.service.js";

const productVariantController = {
    createProductVariant: async (req, res) => {
        let dataProductVariant = req.body;
        // console.log(dataProductVariant)
        try {
            let newProductVariant = await productVariantService.createProductVariant(dataProductVariant);
            return res.status(201).json({
                success: true,
                message: "Thêm biến thể sản phẩm thành công",
                data: newProductVariant
            })
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm trong hệ thống",
                })
            }
            return res.status(500).json({
                success: false,
                message: error.message,
                code: error.code
            })
        }
    },

    getProductVariantById: async (req, res) => {
        let variantId = parseInt(req.params.id);
        try {
            let variant = await productVariantService.getProductVariantById(variantId);
            if (!variant || variant.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm."
                });
            }
            return res.status(200).json({
                success: true,
                data: variant
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductVariantByProductId: async (req, res) => {
        let productId = parseInt(req.params.id)
        try {
            let variants = await productVariantService.getProductVariantByProductid(productId);
            if (!variants || variants.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: variants
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getAllProductVariants: async (req, res) => {
        const page = parseInt(req.query.page || 1)
        try {
            let variants = await productVariantService.getAllProductVariants(page);
            if (!variants || variants.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm."
                });
            }
            return res.status(200).json({
                success: true,
                data: variants
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    updateProductVariant: async (req, res) => {
        let variantId = parseInt(req.params.id);
        let dataUpdate = req.body;
        try {
            let updateVariant = await productVariantService.updateProductVariant(variantId, dataUpdate);
            return res.status(200).json({
                success: true,
                message: "Cập nhật biến thể thành công",
                data: updateVariant
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy mã sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    deleteProductVariant: async (req, res) => {
        let variantId = parseInt(req.params.id);
        try {
            await productVariantService.deleteProductVariant(variantId);
            return res.status(200).json({
                success: true,
                message: "Xóa biến thể thành công",
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy mã sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export default productVariantController;