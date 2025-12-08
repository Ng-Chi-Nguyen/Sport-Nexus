// server/src/middlewares/fileUpload.middleware.js
import multer from 'multer';

// Sử dụng memoryStorage để giữ file trong RAM (Buffer)
// Đây là bước quan trọng nhất để sharp có thể đọc file
const storage = multer.memoryStorage();

// Tạo Multer Middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file, ví dụ 5MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra loại file (chỉ cho phép image)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            // Trả về lỗi nếu file không hợp lệ
            cb(new Error('File không phải là định dạng hình ảnh hợp lệ.'), false);
        }
    }
});

// Hàm Middleware bạn sẽ sử dụng trong Route
// 'avatar' là tên field Client gửi file lên (ví dụ: formData.append('avatar', file))
const uploadImage = upload.single('avatar');

export { uploadImage };