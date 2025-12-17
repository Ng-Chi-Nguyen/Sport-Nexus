import attributeKeyService from "../../services/core/attributekey.service.js";

const attributeKeyController = {
    createAttributeKey: async (req, res) => {
        let atttrData = req.body;
        // console.log(atttrData)
        try {
            let newAttributeKey = await attributeKeyService.createAttributeKey(atttrData);
            return res.status(200).json({
                success: true,
                message: "Thêm thuộc tính sản phẩm thành công",
                data: newAttributeKey
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getAttributeKeyById: async (req, res) => {
        let atttrId = parseInt(req.params.id);
        try {
            let attributeKey = await attributeKeyService.getAttributeKeyById(atttrId)
            return res.status(200).json({
                success: true,
                data: attributeKey
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getAllAttributeKey: async (req, res) => {
        try {
            let attributeKey = await attributeKeyService.getAllAttributeKey();
            return res.status(200).json({
                success: true,
                data: attributeKey
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
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
                data: attributeKey
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy mã sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    deleteAttributeKey: async (req, res) => {
        let atttrId = parseInt(req.params.id);
        try {
            await attributeKeyService.deleteAttributeKey(atttrId)
            return res.status(200).json({
                success: true,
                message: "Xóa thuộc tính sản phẩm thành công"
            })
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy mã sản phẩm." });
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },
}

export default attributeKeyController;