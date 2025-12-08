// server/src/services/image.service.js


import sharp from 'sharp';
import path from 'path';
import { supabase } from '../configs/supabase.config.js';

const BUCKET_NAME = 'avatars';

const uploadAvatar = async (fileBuffer, userId) => {

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
        .from(BUCKET_NAME)
        .upload(filePath, optimizedBuffer, {
            contentType: `image/${fileExtension}`,
            upsert: true, // Cho phép ghi đè nếu tồn tại (tùy chọn)
        });

    if (error) {
        throw new Error('Lỗi upload lên Supabase: ' + error.message);
    }

    // 4. Lấy URL công khai
    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl; // Trả về URL đã được CDN hóa
};

export { uploadAvatar };