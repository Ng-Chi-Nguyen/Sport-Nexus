import businessDashboardService from '../../services/management/dashboard.service.js';

export const createDashboardController = ({ dashboardService = businessDashboardService } = {}) => ({
  getProductOverview: async (req, res) => {
    try {
      const data = await dashboardService.getProductOverview(req.query);
      return res.status(200).json({ success: true, message: 'Lấy thống kê sản phẩm thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê sản phẩm.', error: error.message });
    }
  },

  getCouponOverview: async (req, res) => {
    try {
      const data = await dashboardService.getCouponOverview();
      return res.status(200).json({ success: true, message: 'Lấy thống kê khuyến mãi thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê khuyến mãi.', error: error.message });
    }
  },

  getSupplierOverview: async (req, res) => {
    try {
      const data = await dashboardService.getSupplierOverview();
      return res.status(200).json({ success: true, message: 'Lấy thống kê nhà cung cấp thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê nhà cung cấp.', error: error.message });
    }
  },

  getReviewOverview: async (req, res) => {
    try {
      const data = await dashboardService.getReviewOverview();
      return res.status(200).json({ success: true, message: 'Lấy thống kê đánh giá thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê đánh giá.', error: error.message });
    }
  },

  getSystemOverview: async (req, res) => {
    try {
      const data = await dashboardService.getSystemOverview();
      return res.status(200).json({ success: true, message: 'Lấy thống kê hệ thống thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê hệ thống.', error: error.message });
    }
  },

  getOrderOverview: async (req, res) => {
    try {
      const data = await dashboardService.getOrderOverview(req.query);
      return res.status(200).json({ success: true, message: 'Lấy thống kê đơn hàng thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê đơn hàng.', error: error.message });
    }
  },

  getInventoryOverview: async (req, res) => {
    try {
      const data = await dashboardService.getInventoryOverview(req.query);
      return res.status(200).json({ success: true, message: 'Lấy thống kê kho thành công.', data });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê kho.', error: error.message });
    }
  },

  getCustomerOverview: async (req, res) => {
    try {
      const data = await dashboardService.getCustomerOverview(req.query);

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê khách hàng thành công.',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê khách hàng.',
        error: error.message,
      });
    }
  },

  getBusinessOverview: async (req, res) => {
    try {
      const data = await dashboardService.getBusinessOverview(req.query);

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê tổng quan kinh doanh thành công.',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê tổng quan kinh doanh.',
        error: error.message,
      });
    }
  },
});

const dashboardController = createDashboardController();

export default dashboardController;
