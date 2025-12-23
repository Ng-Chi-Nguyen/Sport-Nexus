import authService from "../../services/auth/auth.service.js";

const authController = {
    login: async (req, res) => {
        let dataLogin = req.body;
        try {
            let user = await authService.login(dataLogin);
            return res.status(200).json({
                success: true,
                data: user
            })
        } catch (error) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    },

    logout: async (req, res) => {
        try {
            let userId = parseInt(req.user.id);

            await authService.logout(userId);

            return res.status(200).json({
                success: true,
                message: "Hẹn gặp lại bạn!"
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default authController;