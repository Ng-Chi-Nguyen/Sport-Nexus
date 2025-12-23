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
    }
}

export default authController;