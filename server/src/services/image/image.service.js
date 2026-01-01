import { supabase } from '../../configs/supabase.config.js';
import { uploadFileToSupabase } from '../../utils/imageUpload.utils.js';

const GENERAL_BUCKET = process.env.SUPABASE_GENERAL_BUCKET_NAME;

const uploadImage = {

    uploadAvatar: async (fileBuffer, userId) => {
        return uploadFileToSupabase(fileBuffer, 'user_avatars', userId);
    },

    uploadLogoSupplier: async (fileBuffer, namePrefix) => {
        return uploadFileToSupabase(fileBuffer, 'logo_suppliers', namePrefix);
    },

    uploadLogoBrand: async (fileBuffer, namePrefix) => {
        return uploadFileToSupabase(fileBuffer, 'logo_brands', namePrefix);
    },

    uploadImageCategory: async (fileBuffer, namePrefix) => {
        return uploadFileToSupabase(fileBuffer, 'image_categories', namePrefix);
    },

    uploadThumbnail: async (fileBuffer, namePrefix) => {
        return uploadFileToSupabase(fileBuffer, 'thumbnail_products', namePrefix);
    },

    uploadProductImage: async (fileBuffer, namePrefix, productId) => {
        return uploadFileToSupabase(fileBuffer, `products_images/product_${productId}`, namePrefix);
    },

    uploadMediaImage: async (fileBuffer, namePrefix, productId) => {
        return uploadFileToSupabase(fileBuffer, `media_images/product_${productId}`, namePrefix);
    },

    deleteFile: async (fileUrl, bucketName) => {
        if (!fileUrl) return;
        const bucketIndex = fileUrl.indexOf(`/public/${bucketName}/`);

        if (bucketIndex === -1) {
            console.warn(`[Supabase Delete] Không tìm thấy Bucket '${bucketName}' trong URL: ${fileUrl}`);
            return;
        }

        // Lấy đường dẫn file (path) từ sau tên bucket
        const filePath = fileUrl.substring(bucketIndex + `/public/${bucketName}/`.length);

        // 2. Gọi API xóa
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error && error.message !== 'The resource was not found') {
            // Bỏ qua lỗi "file not found", nhưng ghi lại các lỗi khác
            console.error("Lỗi xóa file Supabase:", error);
            throw new Error("Không thể xóa file cũ khỏi Storage.");
        }
    }
}

export { uploadImage };