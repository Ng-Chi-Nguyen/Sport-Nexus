import prisma from "../../db/prisma.js";
import { deleteImage } from "../../utils/deleteImage.utils.js";
import { uploadImage } from "../image.service.js";

const productImageService = {
    createProductImage: async (uploadedUrls, product_id) => {
        // let { product_id } = dataProductImg;
        const dbPromises = [];
        uploadedUrls.forEach((url) => {
            const promise = prisma.productImages.create({
                data: {
                    product: { connect: { id: product_id } },
                    url: url,
                }
            });

            dbPromises.push(promise);
        });

        // Chờ tất cả các bản ghi DB được tạo thành công
        const createdImages = await Promise.all(dbPromises);

        return createdImages;
    },

    getProductImageById: async (productImgId) => {
        let productimg = await prisma.productImages.findUnique({
            where: { id: productImgId }
        })
        return productimg;
    },

    getProductImageByProductId: async (productId) => {
        let productimg = await prisma.productImages.findMany({
            where: { product_id: productId }
        })
        return productimg;
    },

    updateProductImage: async (productId, currentImages, newUrls) => {
        // 1. LẤY TRẠNG THÁI HIỆN TẠI VÀ XÁC ĐỊNH ẢNH CẦN GIỮ LẠI
        const existingImages = await prisma.ProductImages.findMany({
            where: { product_id: productId },
            select: { id: true, url: true }
        });

        const newImageIdsToKeep = currentImages.map(img => img.id);
        const imagesToDelete = existingImages.filter(img => !newImageIdsToKeep.includes(img.id));

        const dbPromises = [];

        // console.log("newImageIdsToKeep: ", newImageIdsToKeep)
        // console.log("imagesToDelete: ", imagesToDelete)
        const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;
        // --- A. XỬ LÝ XÓA ---
        if (imagesToDelete.length > 0) {
            // Xóa file vật lý (Storage Delete)
            imagesToDelete.forEach(img => {
                // Thêm promise xóa file vào dbPromises (Nếu cần đảm bảo hoàn thành)
                dbPromises.push(uploadImage.deleteFile(img.url, GENERAL_BUCKET));
                // console.log(img)
            });

            // Xóa DB
            dbPromises.push(prisma.ProductImages.deleteMany({
                where: { id: { in: imagesToDelete.map(img => img.id) } }
            }));
        }

        // --- B. XỬ LÝ CẬP NHẬT METADATA CỦA ẢNH CŨ ---
        currentImages.forEach(img => {
            dbPromises.push(prisma.ProductImages.update({
                where: { id: img.id },
                data: {
                    is_primary: img.is_primary || false
                }
            }));
        });

        // --- C. XỬ LÝ THÊM MỚI (URL đã được tạo) ---
        newUrls.forEach(url => {
            dbPromises.push(prisma.ProductImages.create({
                data: {
                    product_id: productId,
                    url: url,
                    // Giả sử ảnh mới thêm không phải là primary, và vị trí sẽ được sắp xếp sau
                    is_primary: false,
                }
            }));
        });

        // Chạy tất cả các hành động CUD đồng thời
        await Promise.all(dbPromises);

        // Trả về thư viện ảnh mới sau khi cập nhật
        return prisma.productImages.findMany({ where: { product_id: productId } });
    },

    deleteProductImageById: async (productImageId) => {

        const imageToDelete = await prisma.ProductImages.findUnique({
            where: { id: productImageId }
        });
        if (!imageToDelete) throw new Error("Không tìm thấy hình ảnh.");

        if (imageToDelete.is_primary) {
            throw new Error("Không thể xóa ảnh chính. Vui lòng chọn ảnh chính khác.");
        }

        await deleteImage(productImageId, "ProductImages", "url")
        await prisma.ProductImages.delete({
            where: {
                id: productImageId
            }
        })
    },

    deleteProductImageByProductId: async (productId) => {
        const imagesToDelete = await prisma.ProductImages.findMany({
            where: { product_id: productId, is_primary: false },
            select: { id: true, url: true }
        });

        if (imagesToDelete.length === 0) {
            return;
        }
        const deletePromises = [];
        const BUCKET_NAME = process.env.SUPABASE_GENERAL_BUCKET_NAME;

        imagesToDelete.forEach(img => {
            deletePromises.push(uploadImage.deleteFile(img.url, BUCKET_NAME));
        });

        deletePromises.push(prisma.ProductImages.deleteMany({
            where: { product_id: productId, is_primary: false }
        }));

        await Promise.all(deletePromises);
    },
}


export default productImageService;