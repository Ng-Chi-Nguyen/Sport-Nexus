import collectionService from "../../services/web/collection.service.js";
import { t } from "../../locales/messages.js";

const collectionController = {
    getCollections: async (req, res) => {
        try {
            const collections = await collectionService.getCollections();
            return res.status(200).json({
                success: true,
                data: { collections },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: t(req, error.message),
            });
        }
    },

    getCollectionBySlug: async (req, res) => {
        const slug = req.params.slug;
        try {
            const collection = await collectionService.getCollectionBySlug(slug);
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
                message: t(req, error.message),
            });
        }
    },
};

export default collectionController;
