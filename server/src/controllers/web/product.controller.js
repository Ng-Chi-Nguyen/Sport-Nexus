import productService from "../../services/core/product.service.js";

const productController = {
    getProductBySlug: async (req, res) => {
        let slug = req.params.slug;
        // console.log(slug)
        try {
            let product = await productService.getProductBySlug(slug);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm."
                });
            }
            return res.status(200).json({
                success: true,
                data: product,
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },
}

export default productController;
