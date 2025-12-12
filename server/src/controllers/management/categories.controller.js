import { uploadImage } from "../../services/image.service.js";
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
            let category = await categoryService.getCategoryById(categoryId)

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
}

export default categoryController;