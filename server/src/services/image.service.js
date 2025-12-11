import sharp from 'sharp';
import path from 'path';
import { supabase } from '../configs/supabase.config.js';

const GENERAL_BUCKET = 'general-uploads';

const uploadImage = {
    uploadAvatar: async (fileBuffer, userId) => {
        // 1. TỐI ƯU HÌNH ẢNH bằng SHARP
        const optimizedBuffer = await sharp(fileBuffer)
            .resize(200, 200, { fit: 'cover' }) // Đảm bảo kích thước chuẩn
            .webp({ quality: 80 })             // Nén và chuyển sang WEBP
            .toBuffer();                       // Trả về Buffer đã tối ưu

        // 2. Tạo đường dẫn và tên file duy nhất
        const fileExtension = 'webp';
        // Ví dụ: user_avatars/101_1678887766.webp
        const filePath = `user_avatars/${userId}_${Date.now()}.${fileExtension}`;

        // 3. THỰC HIỆN UPLOAD lên Supabase Storage
        const { error } = await supabase.storage
            .from(GENERAL_BUCKET)
            .upload(filePath, optimizedBuffer, {
                contentType: `image/${fileExtension}`,
                upsert: true, // Cho phép ghi đè nếu tồn tại (tùy chọn)
            });

        if (error) {
            throw new Error('Lỗi upload lên Supabase: ' + error.message);
        }

        // 4. Lấy URL công khai
        const { data: publicUrlData } = supabase.storage
            .from(GENERAL_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl; // Trả về URL đã được CDN hóa
    },

    uploadLogoSupplier: async (fileBuffer, namePrefix) => {
        // 1. TỐI ƯU HÌNH ẢNH bằng SHARP
        const optimizedBuffer = await sharp(fileBuffer)
            .resize(200, 200, { fit: 'cover' }) // Đảm bảo kích thước chuẩn
            .webp({ quality: 80 })             // Nén và chuyển sang WEBP
            .toBuffer();                       // Trả về Buffer đã tối ưu

        // 2. Tạo đường dẫn và tên file duy nhất
        const fileExtension = 'webp';
        // Ví dụ: logo_supplier/101_1678887766.webp
        const filePath = `logo_suppliers/${namePrefix}_${Date.now()}.${fileExtension}`;

        // 3. THỰC HIỆN UPLOAD lên Supabase Storage
        const { error } = await supabase.storage
            .from(GENERAL_BUCKET)
            .upload(filePath, optimizedBuffer, {
                contentType: `image/${fileExtension}`,
                upsert: true, // Cho phép ghi đè nếu tồn tại (tùy chọn)
            });
        if (error) {
            throw new Error('Lỗi upload lên Supabase: ' + error.message);
        }

        // 4. Lấy URL công khai
        const { data: publicUrlData } = supabase.storage
            .from(GENERAL_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl; // Trả về URL đã được CDN hóa
    },

    uploadLogoBrand: async (fileBuffer, namePrefix) => {
        // 1. TỐI ƯU HÌNH ẢNH bằng SHARP
        const optimizedBuffer = await sharp(fileBuffer)
            .resize(200, 200, { fit: 'cover' }) // Đảm bảo kích thước chuẩn
            .webp({ quality: 80 })             // Nén và chuyển sang WEBP
            .toBuffer();                       // Trả về Buffer đã tối ưu

        // 2. Tạo đường dẫn và tên file duy nhất
        const fileExtension = 'webp';
        // Ví dụ: logo_supplier/101_1678887766.webp
        const filePath = `logo_brands/${namePrefix}_${Date.now()}.${fileExtension}`;

        // 3. THỰC HIỆN UPLOAD lên Supabase Storage
        const { error } = await supabase.storage
            .from(GENERAL_BUCKET)
            .upload(filePath, optimizedBuffer, {
                contentType: `image/${fileExtension}`,
                upsert: true, // Cho phép ghi đè nếu tồn tại (tùy chọn)
            });
        if (error) {
            throw new Error('Lỗi upload lên Supabase: ' + error.message);
        }

        // 4. Lấy URL công khai
        const { data: publicUrlData } = supabase.storage
            .from(GENERAL_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl; // Trả về URL đã được CDN hóa
    },

    deleteFile: async (fileUrl, bucketName) => {
        if (!fileUrl) return;

        // 1. Phân tích đường dẫn file từ URL
        // URL có dạng: https://.../storage/v1/object/public/bucket-name/path/to/file.webp

        // Tìm vị trí của tên bucket trong URL
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