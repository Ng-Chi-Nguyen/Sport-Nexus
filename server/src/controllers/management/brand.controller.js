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
    }
}

export default brandController;