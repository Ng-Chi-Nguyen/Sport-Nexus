import userService from "../../services/management/user.service.js";


export const createUserController = async (req, res) => {
    // console.log(req.body)
    let userData = req.body
    // console.log(userData)
    try {

        let newUser = await userService.createUser(userData);

        return res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công! Vui lòng kiểm tra email để xác minh.',
            data: newUser
        })
        
    } catch (error) {

        if (error.code === 'P2002') {
             return res.status(409).json({ 
                 success: false, 
                 message: 'Địa chỉ email này đã được đăng ký.' 
            });
        }

        return res.status(500).json({ 
            message: 'Lỗi server nội bộ trong quá trình tạo tài khoản.',
            error: error.message
        });
    }
}