import { uploadFileToSupabase } from '../utils/imageUpload.utils.js';

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
}

export { uploadImage };