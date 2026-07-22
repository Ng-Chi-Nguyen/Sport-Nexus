import authService from "../../services/auth/auth.service.js";

const authController = {
    login: async (req, res) => {
        let dataLogin = req.body;
        try {
            let user = await authService.login(dataLogin);
            return res.status(200).json({
                success: true,
                message: "Sport Nexus xin chào",
                data: user
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    logout: async (req, res) => {
        let userId = parseInt(req.params.id);
        try {

            await authService.logout(userId);

            return res.status(200).json({
                success: true,
                message: "Hẹn gặp lại bạn!"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    verifyAccount: async (req, res) => {
        let { token } = req.params;
        // console.log(token)
        if (!token) {
            return res.status(500).json({
                success: false,
                message: "Không tìm thấy token"
            })
        }
        try {
            let result = await authService.verifyAccount(token);

            res.clearCookie('token'); // Nếu bạn có dùng cookie

            if (!result) {
                // console.log("Xác thực thất bại");
                // console.log(result)
                return res.status(302).redirect("http://localhost:5173");
            }

            // console.log("Xác thực thành công, đang chuyển hướng...");
            // Sử dụng status 302 (Found) để ép trình duyệt chuyển hướng
            return res.status(302).redirect("http://localhost:5173");
        } catch (error) {
            console.error("Lỗi hệ thống trong verifyAccount:", error.message);
            return res.redirect("http://localhost:5173");
        }
    },

    forgotPassword: async (req, res) => {
        try {
            await authService.forgotPassword(req.body.email);
            return res.status(200).json({
                success: true,
                message: "Link đặt lại mật khẩu đã được gửi vào email của bạn!",
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            await authService.resetPassword(token, req.body);
            return res.status(200).json({
                success: true,
                message: "Đặt lại mật khẩu thành công!",
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const userId = req.user.id;
            const result = await authService.changePassword(userId, req.body);
            return res.status(200).json({
                success: true,
                message: "Đổi mật khẩu thành công!",
                data: result,
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    googleLogin: async (req, res) => {
        try {
            const { access_token } = req.body;
            if (!access_token) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu token đăng nhập Google"
                });
            }
            const result = await authService.googleLogin(access_token);
            return res.status(200).json({
                success: true,
                message: "Đăng nhập bằng Google thành công",
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    facebookLogin: async (req, res) => {
        try {
            const { access_token } = req.body;
            if (!access_token) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu token đăng nhập Facebook"
                });
            }
            const result = await authService.facebookLogin(access_token);
            return res.status(200).json({
                success: true,
                message: "Đăng nhập bằng Facebook thành công",
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            // console.log(refreshToken)
            // Gọi logic từ Service
            const result = await authService.refreshToken(refreshToken);

            // Trả về kết quả thành công
            return res.status(200).json(result);

        } catch (error) {
            // Xử lý các lỗi được ném ra từ Service
            const status = error.status || 500;
            const message = error.message || "Lỗi server nội bộ";

            return res.status(status).json({ message });
        }
    },
}

export default authController;