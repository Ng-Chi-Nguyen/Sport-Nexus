import productService from "../../services/core/product.service.js";
import { uploadImage } from "../../services/image.service.js";

const productController = {
    createProduct: async (req, res) => {
        let productData = req.body;
        let file = req.file;
        // console.log(productData)
        // console.log(file)
        try {

            if (file) {
                let thumbnail_url = await uploadImage.uploadThumbnail(file.buffer, "new_brand")
                productData.thumbnail = thumbnail_url;
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
            console.log(product)
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
        try {
            let list_product = await productService.getAllProduct();
            return res.status(200).json({
                success: true,
                data: list_product
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

export default productController;