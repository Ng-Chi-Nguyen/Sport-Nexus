import { uploadImage } from "../../services/image.service.js";
import supplierService from "../../services/management/supplier.service.js";

const supplierController = {
    createSupplier: async (req, res) => {
        // console.log("supplierController")

        let supplierData = req.body;
        let file = req.file;
        // console.log(supplierData)

        try {

            if (file) {
                let logo_url = await uploadImage.uploadLogoSupplier(file.buffer, "new_supplier");

                supplierData.logo_url = logo_url;
            }

            let newSupplier = await supplierService.createSuplier(supplierData);

            return res.status(201).json({
                success: true,
                message: "Thêm nhà cùng cấp thành công",
                data: newSupplier
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    getSupplierById: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        // console.log(supplierId)
        try {
            let supplier = await supplierService.getSupplierById(supplierId)

            return res.status(200).json({
                success: true,
                data: supplier
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    getAllSupplier: async (req, res) => {
        try {
            let supplier = await supplierService.getAllSuppliers()

            return res.status(200).json({
                success: true,
                data: supplier
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    updateSuplier: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        let dataUpdate = req.body;
        let file = req.file;

        try {

            if (file) {

                let logo_url = await uploadImage.uploadLogoSupplier(file.buffer, supplierId);

                dataUpdate.logo_url = logo_url;
            }

            let updateData = await supplierService.updateSuplier(supplierId, dataUpdate);

            return res.status(200).json({
                success: true,
                message: "Cập nhật nhà cung cấp thành công",
                data: updateData
            })

        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    deleteSupplier: async (req, res) => {
        let supplierId = parseInt(req.params.id);

        try {
            await supplierService.deleteSupplier(supplierId);

            return res.status(201).json({
                success: true,
                message: "Nhà cung cấp đã được xóa khỏi hệ thống",
            });
        } catch (error) {

            if (error.code === "P2025") {
                return res.status(409).json({
                    success: false,
                    message: "Không tìm thấy người dùng trong hệ thống.",
                });
            }

            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    }
}

export default supplierController;