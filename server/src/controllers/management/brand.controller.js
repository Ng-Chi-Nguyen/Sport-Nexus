import { uploadImage } from "../../services/image.service.js";
import brandService from "../../services/management/brand.service.js";

const brandController = {
    createBrand: async (req, res) => {
        let brandData = req.body;
        let file = req.file;

        try {

            if (file) {
                let logo_url = await uploadImage.uploadLogoBrand(file.buffer, "new_brand");
                brandData.logo = logo_url;
            }

            let newBrand = await brandService.createBrand(brandData);

            return res.status(201).json({
                success: true,
                data: newBrand,
                message: "Thêm thương hiệu thành công"
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }


    },

    getBrandById: async (req, res) => {
        let brandId = parseInt(req.params.id);
        try {
            let brand = await brandService.getBrandById(brandId);
            return res.status(200).json({
                success: true,
                data: brand
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },

    getAllBrands: async (req, res) => {
        try {
            let list_brands = await brandService.getAllBrands();
            return res.status(200).json({
                success: true,
                data: list_brands
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },

    updateBrand: async (req, res) => {
        let dataUpdate = req.body;
        let brandId = parseInt(req.params.id);
        let file = req.file;

        try {

            const currentBrand = await brandService.getBrandById(brandId);
            if (!currentBrand) {
                return res.status(404).json({
                    message: "Không tìm thấy thương hiệu để cập nhật."
                });
            }

            if (file) {
                let logo_url = await uploadImage.uploadLogoBrand(file.buffer, brandId)
                dataUpdate.logo = logo_url;
            }

            let updateData = await brandService.updateBrand(brandId, dataUpdate);

            return res.status(200).json({
                success: true,
                data: updateData,
                message: "Cập nhật thương hiệu thành công"
            })

        } catch (error) {

            if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
                return res.status(404).json({ message: "Không tìm thấy thương hiệu để cập nhật." });
            }

            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },

    deleteBrand: async (req, res) => {
        let brandId = parseInt(req.params.id);
        try {

            const currentBrand = await brandService.getBrandById(brandId);
            if (!currentBrand) {
                return res.status(404).json({
                    message: "Không tìm thấy thương hiệu để xóa."
                });
            }

            await brandService.deleteBrand(brandId);

            return res.status(200).json({
                success: true,
                message: "Xóa thương hiệu thành công"
            })

        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    }
}

export default brandController;