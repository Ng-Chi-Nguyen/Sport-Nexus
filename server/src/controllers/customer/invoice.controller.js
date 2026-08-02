import invoiceService from "../../services/customer/invoice.service.js";

const invoiceController = {
    getMyInvoices: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const status = req.query.status || '';
        const email = req.user.email;

        try {
            const result = await invoiceService.getMyInvoices({ email, page, status });
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi lấy danh sách hóa đơn'
            });
        }
    },

    getMyInvoiceDetail: async (req, res) => {
        const invoiceId = parseInt(req.params.id);
        const email = req.user.email;

        try {
            const invoice = await invoiceService.getMyInvoiceDetail(invoiceId, email);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hóa đơn'
                });
            }
            return res.status(200).json({
                success: true,
                data: invoice
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Lỗi lấy chi tiết hóa đơn'
            });
        }
    }
}

export default invoiceController;
