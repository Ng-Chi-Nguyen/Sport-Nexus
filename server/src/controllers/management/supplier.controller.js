import supplierService from "../../services/management/supplier.service.js";

const supplierController = {
    createSupplier: async (req, res) => {
        // console.log("supplierController")

        let supplierData = req.body;
        // console.log(supplierData)

        try {

            let newSupplier = await supplierService.createSuplier(supplierData);

            return res.status(201).json({
                success: true,
                message: "Thêm nhà cùng cấp thành công",
                data: newSupplier
            })
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server nội bộ trong quá trình tạo tài khoản.",
                error: error.message,
            });
        }



    }


}

export default supplierController;