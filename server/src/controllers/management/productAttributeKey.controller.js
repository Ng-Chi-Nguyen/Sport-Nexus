import productAttributeKeyService from "../../services/management/productAttributeKey.service.js";

const productAttributeKeyController = {
    create: async (req, res) => {
        try {
            const result = await productAttributeKeyService.create(req.body);
            return res.status(201).json({ success: true, data: result, message: "Thêm thuộc tính cho sản phẩm thành công" });
        } catch (error) {
            if (error.code === 'P2002')
                return res.status(409).json({ success: false, message: "Thuộc tính này đã được gán cho sản phẩm." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const product_id = req.query.product_id || '';
            const result = await productAttributeKeyService.getAll({ page, product_id });

            if (!result || result.data.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi nào." });
            }

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await productAttributeKeyService.getById(id);
            if (!result)
                return res.status(404).json({ success: false, message: "Không tìm thấy bản ghi." });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    getByProduct: async (req, res) => {
        try {
            const productId = parseInt(req.params.productId);
            const result = await productAttributeKeyService.getByProduct(productId);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const result = await productAttributeKeyService.update(id, req.body);
            return res.status(200).json({ success: true, data: result, message: "Cập nhật thành công" });
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy bản ghi." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await productAttributeKeyService.delete(id);
            return res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (error) {
            if (error.code === 'P2025')
                return res.status(404).json({ message: "Không tìm thấy bản ghi." });
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};

export default productAttributeKeyController;
