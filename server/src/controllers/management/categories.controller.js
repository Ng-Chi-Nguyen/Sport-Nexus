import { uploadImage } from "../../services/image/image.service.js";
import categoryService from "../../services/management/categories.service.js";
import categoryImportService from "../../services/management/categoryImport/index.js";
import logService from "../../services/management/log.service.js";

const categoryController = {
    createCategory: async (req, res) => {
        let dataCategory = req.body;
        let file = req.file;
        // console.log(file)
        try {

            if (file) {
                let logo_url = await uploadImage.uploadImageCategory(file.buffer, "new_category");
                dataCategory.image = logo_url;
            }

            let newCategory = await categoryService.createCategory(dataCategory)

            return res.status(201).json({
                success: true,
                message: "Thêm loại hàng thành công",
                data: newCategory
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            })
        }
    },

    getCategoryById: async (req, res) => {

        let categoryId = parseInt(req.params.id)

        try {
            let category = await categoryService.getCategoryById(categoryId);

            if (!category || category.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(201).json({
                success: true,
                data: category
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            })
        }
    },

    getAllCategory: async (req, res) => {
        const page = parseInt(req.query.page || 1);
        const is_active = req.query.is_active !== undefined ? req.query.is_active : '';
        const search = req.query.search || '';
        const include_deleted = req.query.include_deleted === 'true';
        try {
            let result = await categoryService.getAllCategory({ page, is_active, search, include_deleted });

            if (!result || result.list_categories.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục."
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            })
        }
    },

    getCategoriesDropdown: async (req, res) => {
        try {
            let list_categories = await categoryService.getCategoriesDropdown();

            if (!list_categories || list_categories.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhà cung cấp."
                });
            }

            return res.status(200).json({
                success: true,
                data: list_categories
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },

    updateCategory: async (req, res) => {
        let categoryId = parseInt(req.params.id);
        let dataUpdate = req.body;
        let file = req.file;
        // console.log(dataUpdate)
        // console.log(file)
        try {
            let currentCategory = await categoryService.getCategoryById(categoryId)
            if (!currentCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy loại hàng trong hệ thống"
                })
            }

            if (file) {
                let image_url = await uploadImage.uploadImageCategory(file.buffer, categoryId);
                dataUpdate.image = image_url;
            }
            let updateData = await categoryService.updateCategory(categoryId, dataUpdate);
            return res.status(201).json({
                success: true,
                message: "Cập nhật loại hàng thành công",
                data: updateData
            })

        } catch (error) {

            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy danh mục để cập nhật." });
            }

            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    deleteCategory: async (req, res) => {
        let categoryId = parseInt(req.params.id);
        try {

            await categoryService.deleteCategory(categoryId);
            return res.status(201).json({
                success: true,
                message: "Xóa loại hàng thành công",
            })

        } catch (error) {

            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy danh mục để xóa." });
            }


            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    previewImport: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn file .xlsx để xem trước.'
                });
            }

            const result = await categoryImportService.previewImport(req.file.buffer);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi khi đọc file.'
            });
        }
    },

    importCategories: async (req, res) => {
        // Tăng timeout lên 3 phút phòng trường hợp parse/upload nhiều ảnh Supabase
        req.setTimeout(180000);

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn file .xlsx để import.'
                });
            }

            const parsedRows = await categoryImportService.parseFile(req.file.buffer);
            const result = await categoryImportService.importCategories(parsedRows);

            // Ghi Log Audit (Bọc an toàn)
            try {
                if (typeof logService?.create === 'function') {
                    await logService.create({
                        userId: req.user?.id,
                        actionType: 'IMPORT',
                        entityType: 'Categories',
                        entityId: null,
                        status: result.failed > 0 && result.success === 0 ? 'FAILED' : 'SUCCESS',
                        details: { total: result.total, success: result.success, failed: result.failed },
                        ipAddress: req.headers['x-forwarded-for'] || req.ip,
                    });
                }
            } catch (logErr) {
                console.error('Lỗi khi ghi System Log:', logErr.message);
            }

            return res.status(200).json({
                success: true,
                message: `Import hoàn tất: ${result.success} thành công, ${result.failed} lỗi.`,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Đã xảy ra lỗi trong quá trình xử lý Import.'
            });
        }
    },

    exportCategories: async (req, res) => {
        req.setTimeout(180000); // Tăng timeout nếu cần fetch ảnh từ Supabase về nhúng vào Excel
        try {
            const buffer = await categoryImportService.generateExport();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="danh-sach-danh-muc-${Date.now()}.xlsx"`);
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    downloadTemplate: async (req, res) => {
        req.setTimeout(180000);
        try {
            const buffer = await categoryImportService.generateTemplate();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            // Đã đổi 'inline' thành 'attachment' để kích hoạt popup Download trên Trình duyệt
            res.setHeader('Content-Disposition', 'attachment; filename="template-danh-muc.xlsx"');
            return res.send(buffer);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    downloadErrorFile: async (req, res) => {
        try {
            const { token } = req.params;
            const buffer = await categoryImportService.getErrorFile(token);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="danh-sach-loi-${token.substring(0, 8)}.xlsx"`);
            return res.send(buffer);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message || 'File báo lỗi không tồn tại hoặc đã hết hạn.'
            });
        }
    }
}

export default categoryController;
