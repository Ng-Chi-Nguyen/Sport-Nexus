import productImageService from "../../services/core/productImage.service.js";
import { uploadImage } from "../../services/image.service.js";
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
    }
}

export default productImageController;