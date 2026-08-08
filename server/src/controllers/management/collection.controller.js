import { uploadImage } from "../../services/image/image.service.js";
import collectionService from "../../services/management/collection.service.js";
import { t } from "../../locales/messages.js";

const collectionController = {
    createCollection: async (req, res) => {
        const dataCollection = req.body;
        const file = req.file;
        try {
            if (file) {
                const bannerUrl = await uploadImage.uploadImageCollection(file.buffer, "new_collection");
                dataCollection.banner = bannerUrl;
            }

            const newCollection = await collectionService.createCollection(dataCollection);

            return res.status(201).json({
                success: true,
                message: t(req, "Thêm bộ sưu tập thành công"),
                data: newCollection,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    getCollectionById: async (req, res) => {
        const collectionId = parseInt(req.params.id);
        try {
            const collection = await collectionService.getCollectionById(collectionId);
            if (!collection) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy bộ sưu tập."),
                });
            }
            return res.status(200).json({
                success: true,
                data: collection,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    getAllCollection: async (req, res) => {
        const page = parseInt(req.query.page || 1);
        const is_active = req.query.is_active !== undefined ? req.query.is_active : '';
        const search = req.query.search || '';
        const include_deleted = req.query.include_deleted === 'true';
        try {
            const result = await collectionService.getAllCollection({ page, is_active, search, include_deleted });
            if (!result || result.list_collections.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy bộ sưu tập."),
                });
            }
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    updateCollection: async (req, res) => {
        const collectionId = parseInt(req.params.id);
        const dataUpdate = req.body;
        const file = req.file;
        try {
            const currentCollection = await collectionService.getCollectionById(collectionId);
            if (!currentCollection) {
                return res.status(404).json({
                    success: false,
                    message: t(req, "Không tìm thấy bộ sưu tập trong hệ thống"),
                });
            }

            if (file) {
                const bannerUrl = await uploadImage.uploadImageCollection(file.buffer, collectionId);
                dataUpdate.banner = bannerUrl;
            }

            const updateData = await collectionService.updateCollection(collectionId, dataUpdate);
            return res.status(201).json({
                success: true,
                message: t(req, "Cập nhật bộ sưu tập thành công"),
                data: updateData,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: t(req, "Không tìm thấy bộ sưu tập để cập nhật.") });
            }
            return res.status(500).json({
                success: false,
                message: t(req, error.message),
            });
        }
    },

    deleteCollection: async (req, res) => {
        const collectionId = parseInt(req.params.id);
        try {
            await collectionService.deleteCollection(collectionId);
            return res.status(201).json({
                success: true,
                message: t(req, "Xóa bộ sưu tập thành công"),
            });
        } catch (error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: t(req, "Không tìm thấy bộ sưu tập để xóa.") });
            }
            return res.status(500).json({
                success: false,
                message: t(req, error.message),
            });
        }
    },
};

export default collectionController;
