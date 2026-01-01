import productImageService from "../../services/core/productImage.service.js";
import { uploadImage } from "../../services/image/image.service.js";
import { checkExistKey } from "../../utils/checkExistKey.utils.js";

const productImageController = {
    createProductImage: async (req, res) => {
        let files = req.files;
        let dataProductImg = req.body;
        let product_id = parseInt(dataProductImg.product_id)
        try {
            await checkExistKey('id', product_id, "Products")
            let uploadPromises = [];
            if (files && files.length > 0) {

                for (const file of files) {
                    const promise = uploadImage.uploadProductImage(
                        file.buffer,
                        "product_images",
                        product_id
                    );
                    uploadPromises.push(promise);
                }
                const uploadedUrls = await Promise.all(uploadPromises);
                const newProductImgs = await productImageService.createProductImage(uploadedUrls, product_id);

                return res.status(201).json({
                    success: true,
                    message: `Đã upload và lưu thành công ${newProductImgs.length} hình ảnh.`,
                    data: newProductImgs
                });
            }
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy file hình ảnh nào để upload."
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductImageById: async (req, res) => {
        let productImgId = parseInt(req.params.id)
        try {
            let productImg = await productImageService.getProductImageById(productImgId);
            if (!productImg || productImg.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(500).json({
                success: true,
                data: productImg
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getProductImageByProductId: async (req, res) => {
        let productId = parseInt(req.params.id)
        try {
            let productImg = await productImageService.getProductImageByProductId(productId)
            if (!productImg || productImg.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm này trong giỏ hàng."
                });
            }
            return res.status(500).json({
                success: true,
                data: productImg
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    updateProductImage: async (req, res) => {
        let productId = parseInt(req.params.id);
        let files = req.files;

        const currentImagesJsonId = req.body.current_image_ids;
        // Chuyển đổi chuỗi thành đối tượng/mảng JSON
        const currentImages = JSON.parse(currentImagesJsonId);

        // console.log("productId: ", productId)
        // console.log("files: ", files)
        // console.log("currentImages: ", currentImages)

        try {
            const uploadPromises = files.map(file => {
                // console.log("Processing file for product ID:", productId);
                return uploadImage.uploadProductImage(
                    file.buffer,
                    `product_images_${Date.now()}`,
                    productId
                );
            });
            const newUrls = await Promise.all(uploadPromises);
            // console.log(newUrls)
            // 2. Gọi Service để xử lý XÓA, CẬP NHẬT METADATA cũ, và THÊM URL mới
            let updatedProduct = await productImageService.updateProductImage(
                productId,
                currentImages,
                newUrls
            );

            return res.status(200).json({
                success: true,
                message: `Cập nhật thư viện ảnh cho Sản phẩm ID ${productId} thành công.`,
                data: updatedProduct
            });

        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy hình ảnh phụ sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


    deleteProductImageById: async (req, res) => {
        let productId = parseInt(req.params.id)
        try {
            await productImageService.deleteProductImageById(productId)
            return res.status(200).json({
                success: true,
                message: "Xóa hình ảnh mô tả thành công"
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy hình ảnh phụ sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    deleteProductImageByProductId: async (req, res) => {
        let productId = parseInt(req.params.id)
        try {
            await productImageService.deleteProductImageByProductId(productId)
            return res.status(200).json({
                success: true,
                message: "Xóa hình ảnh mô tả thành công"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },
}

export default productImageController;