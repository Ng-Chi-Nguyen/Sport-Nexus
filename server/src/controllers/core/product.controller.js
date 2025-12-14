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
    }
}

export default productController;