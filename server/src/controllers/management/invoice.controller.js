import invoiceService from "../../services/management/invoice.service.js";

const invoiceController = {
    createInvoice: async (req, res) => {
        try {
            const invoice = await invoiceService.createInvoice({
                order_id: req.body.order_id,
                note: req.body.note
            });
            return res.status(201).json({
                success: true,
                message: "Hóa đơn đã được tạo",
                data: invoice
            });
        } catch (error) {
            const status = error.status || 500;
            const message = status === 500 ? "Lỗi server nội bộ." : error.message;
            return res.status(status).json({
                success: false,
                message,
                ...(status === 500 ? { error: error.message } : {})
            });
        }
    },

    getAllInvoices: async (req, res) => {
        const { page, status, search, date_from, date_to } = req.query;
        try {
            const result = await invoiceService.getAllInvoices({
                page: parseInt(page || 1),
                status: status || '',
                search: search || '',
                date_from: date_from || '',
                date_to: date_to || '',
            });
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    },

    getInvoiceById: async (req, res) => {
        const invoiceId = parseInt(req.params.id);
        try {
            const invoice = await invoiceService.getInvoiceById(invoiceId);
            if (!invoice) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn." });
            }
            return res.status(200).json({ success: true, data: invoice });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi server nội bộ.",
                error: error.message
            });
        }
    }
}

export default invoiceController;
