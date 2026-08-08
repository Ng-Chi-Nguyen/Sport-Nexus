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
const uploadImageAvatar = upload.single('avatar');
const uploadImageLogoSupplier = upload.single('logo_url');
const uploadImageLogoBrand = upload.single('logo');
const uploadImageCategory = upload.single('image');
const uploadImageCollection = upload.single('banner');
const uploadThubnailProduct = upload.single('thumbnail');
const uploadProductImage = upload.array('url', 10);
const uploadMediaImage = upload.array('media_urls', 5);

const uploadExcel = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        const allowedExt = '.xlsx';
        const ext = '.' + file.originalname.split('.').pop().toLowerCase();

        if (allowedMimes.includes(file.mimetype) && ext === allowedExt) {
            cb(null, true);
        } else {
            cb(new Error('File phải là định dạng .xlsx hợp lệ.'), false);
        }
    }
});

const uploadExcelFile = uploadExcel.single('file');

export {
    uploadImageAvatar,
    uploadImageLogoSupplier,
    uploadImageLogoBrand,
    uploadImageCategory,
    uploadImageCollection,
    uploadThubnailProduct,
    uploadProductImage,
    uploadMediaImage,
    uploadExcelFile
};