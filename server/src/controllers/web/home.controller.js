import homeService from "../../services/web/home.service.js";

import { t } from "../../locales/messages.js";
const homeController = {
    getHomePageData: async (req, res) => {
        try {
            let homeData = await homeService.getHomePageData();
            return res.status(200).json({
                success: true,
                data: homeData
            });
        } catch (error) {
            return res.status(500).json({
                message: t(req, "Lỗi server nội bộ."),
                error: error.message,
            });
        }
    }
}

export default homeController;