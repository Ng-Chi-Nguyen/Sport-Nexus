import productService from "../../services/core/product.service.js";
import { uploadImage } from "../../services/image/image.service.js";

const productController = {
    createProduct: async (req, res) => {
        let productData = req.body;
        let file = req.file;
        // console.log(productData)
        // console.log(file)
        try {

            // if (file) {
            //     let thumbnail_url = await uploadImage.uploadThumbnail(file.buffer, "new_brand")
            //     productData.thumbnail = thumbnail_url;
            // }

            if (file) {
                // Lưu trữ buffer của file vào productData để gửi sang service
                productData.fileBuffer = file.buffer;
                // Xóa trường thumbnail khỏi productData để không lưu vào DB ngay
                productData.thumbnail = null;
            }

            productData.category_id = parseInt(productData.category_id);
            productData.supplier_id = parseInt(productData.supplier_id);
            productData.brand_id = parseInt(productData.brand_id);
            productData.base_price = parseFloat(productData.base_price);

            let newProduct = await productService.createProduct(productData)

            return res.status(201).json({
                success: true,
                message: "Thêm sản phẩm thành công",
                data: newProduct
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductById: async (req, res) => {
        let productId = parseInt(req.params.id);
        try {
            let product = await productService.getProductById(productId);
            if (!product || product.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
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

    getProductBySupplierId: async (req, res) => {
        let suppliertId = parseInt(req.params.id);
        try {
            let product = await productService.getProductBySupplierId(suppliertId);
            if (!product || product.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: product
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductByBrandId: async (req, res) => {
        let brandId = parseInt(req.params.id);
        try {
            // console.log(brandId)
            let product = await productService.getProductByBrandId(brandId);
            if (!product || product.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            // console.log(product)
            return res.status(200).json({
                success: true,
                data: product
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductByCategoryId: async (req, res) => {
        let categoryId = parseInt(req.params.id);
        try {
            let product = await productService.getProductByCategoryId(categoryId);
            if (!product || product.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: product
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getAllProduct: async (req, res) => {
        const page = parseInt(req.query.page || 1)
        try {
            let list_products = await productService.getAllProduct(page);
            if (!list_products || list_products.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(200).json({
                success: true,
                data: list_products
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    updateProduct: async (req, res) => {
        let dataUpdate = req.body;
        let productId = parseInt(req.params.id);
        let file = req.file;

        try {
            if (file) {
                let thumbnail_url = await uploadImage.uploadThumbnail(file.buffer, productId)
                dataUpdate.thumbnail = thumbnail_url;
            }
            let updateProduct = await productService.updateProduct(productId, dataUpdate);

            return res.status(200).json({
                success: true,
                message: "Cập nhật sản phẩm thành công",
                data: updateProduct
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

    deleteProduct: async (req, res) => {
        try {
            let productId = parseInt(req.params.id);
            await productService.deleteProduct(productId);

            return res.status(200).json({
                success: true,
                message: "Xóa sản phẩm thành công",
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

export default productController;