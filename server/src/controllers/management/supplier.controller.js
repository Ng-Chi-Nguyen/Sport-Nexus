import { uploadImage } from "../../services/image/image.service.js";
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

            if (!supplier || supplier.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

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
        let page = parseInt(req.query.page || 1);
        // console.log(page)
        try {
            let list_suppliers = await supplierService.getAllSuppliers(page)

            if (!list_suppliers || list_suppliers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thường hiệu."
                });
            }

            return res.status(200).json({
                success: true,
                data: list_suppliers
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    getSuppliersDropdown: async (req, res) => {
        try {
            let list_suppliers = await supplierService.getSuppliersDropdown();

            if (!list_suppliers || list_suppliers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhà cung cấp."
                });
            }

            return res.status(200).json({
                success: true,
                data: list_suppliers
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            })
        }
    },

    updateSuplier: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        let dataUpdate = req.body;
        let file = req.file;
        // console.log(file)
        try {

            const currentSupplier = await supplierService.getSupplierById(supplierId);
            if (!currentSupplier) {
                return res.status(404).json({
                    message: "Không tìm thấy nhà cung cấp để cập nhật."
                });
            }

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

            if (error.code === 'P2025') {
                return res.status(404).json({ message: "Không tìm thấy nhà cung cấp giá để cập nhật." });
            }

            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }
    },

    deleteSupplier: async (req, res) => {
        let supplierId = parseInt(req.params.id);
        // console.log(supplierId)
        try {

            const currentSupplier = await supplierService.getSupplierById(supplierId);
            if (!currentSupplier) {
                return res.status(404).json({
                    message: "Không tìm thấy nhà cung cấp để xóa."
                });
            }

            await supplierService.deleteSupplier(supplierId);

            return res.status(201).json({
                success: true,
                message: "Nhà cung cấp đã được xóa khỏi hệ thống",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình xóa nhà cung.",
                error: error.message,
            });
        }
    }
}

export default supplierController;