import { uploadImage } from "../../services/image/image.service.js";
import categoryService from "../../services/management/categories.service.js";

const categoryController = {
    createCategory: async (req, res) => {
        let dataCategory = req.body;
        let file = req.file;

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
        try {
            let list_categories = await categoryService.getAllCategory();

            if (!list_categories || list_categories.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(201).json({
                success: true,
                data: list_categories
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            })
        }
    },

    updateCategory: async (req, res) => {
        let categoryId = parseInt(req.params.id);
        let dataUpdate = req.body;
        let file = req.file;
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
    }
}

export default categoryController;