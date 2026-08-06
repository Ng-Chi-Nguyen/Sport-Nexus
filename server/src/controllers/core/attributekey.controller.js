import attributeKeyService from "../../services/core/attributekey.service.js";

import { t } from "../../locales/messages.js";
const attributeKeyController = {
    createAttributeKey: async (req, res) => {
        let atttrData = req.body;
        // console.log(atttrData)
        try {
            let newAttributeKey = await attributeKeyService.createAttributeKey(atttrData);
            return res.status(200).json({
                success: true,
                message: t(req, "Thêm thuộc tính sản phẩm thành công"),
                data: newAttributeKey
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message)
            })
        }
    },

    getAttributeKeyById: async (req, res) => {
        let atttrId = parseInt(req.params.id);
        try {
            let attributeKey = await attributeKeyService.getAttributeKeyById(atttrId)

            if (!attributeKey || attributeKey.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy sản phẩm này trong giỏ hàng.")
                });
            }
            return res.status(200).json({
                success: true,
                data: attributeKey
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message)
            })
        }
    },

    getAllAttributeKey: async (req, res) => {
        const page = parseInt(req.query.page || 1);
        const search = req.query.search || '';
        const unit = req.query.unit !== undefined ? req.query.unit : '';
        try {
            let result = await attributeKeyService.getAllAttributeKey({ page, search, unit });

            if (!result || result.attribute.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy thuộc tính.")
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message)
            })
        }
    },

    getAllAttributesDropdown: async (req, res) => {
        try {
            let list_attributesKeys = await attributeKeyService.getAllAttributesDropdown();

            if (!list_attributesKeys || list_attributesKeys.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy thường hiệu.")
                });
            }

            return res.status(200).json({
                success: true,
                data: list_attributesKeys
            })
        } catch (error) {
            return res.status(500).json({
                message: t(req, "Lỗi server nội bộ trong quá trình tạo tài khoản."),
                error: error.message,
            })
        }
    },

    getDistinctUnits: async (req, res) => {
        try {
            let units = await attributeKeyService.getDistinctUnits();
            return res.status(200).json({
                success: true,
                data: units
            })
        } catch (error) {
            return res.status(500).json({
                message: t(req, "Lỗi server nội bộ."),
                error: error.message,
            })
        }
    },

    updateAttributeKeyBy: async (req, res) => {
        let atttrId = parseInt(req.params.id);
        let dataUpdate = req.body;
        try {
            let attributeKey = await attributeKeyService.updateAttributeKey(atttrId, dataUpdate);
            return res.status(200).json({
                success: true,
                data: attributeKey,
                message: t(req, "Cập nhật thuộc tính thành công")
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: t(req, "Không tìm thấy thuộc tính.") });
            return res.status(500).json({
                success: false,
                message: t(req, error.message)
            })
        }
    },

    deleteAttributeKey: async (req, res) => {
        let atttrId = parseInt(req.params.id);
        try {
            await attributeKeyService.deleteAttributeKey(atttrId)
            return res.status(200).json({
                success: true,
                message: t(req, "Xóa thuộc tính sản phẩm thành công")
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: t(req, "Không tìm thấy thuộc tính.") });
            return res.status(500).json({
                success: false,
                message: t(req, error.message)
            })
        }
    },
}

export default attributeKeyController;