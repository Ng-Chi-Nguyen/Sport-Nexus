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
    searchProducts: async (req, res) => {
        try {
            const q = req.query.q || '';
            const limit = parseInt(req.query.limit) || 12;
            const page = parseInt(req.query.page) || 1;

            if (!q.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập từ khóa tìm kiếm.',
                });
            }

            const result = await productService.searchProducts({ q: q.trim(), limit, page });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
}

export default productController;
