import businessDashboardService from '../../services/management/dashboard.service.js';

export const createDashboardController = ({ dashboardService = businessDashboardService } = {}) => ({
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
        message: 'L\u1ea5y th\u1ed1ng k\u00ea t\u1ed5ng quan kinh doanh th\u00e0nh c\u00f4ng.',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'L\u1ed7i khi l\u1ea5y th\u1ed1ng k\u00ea t\u1ed5ng quan kinh doanh.',
        error: error.message,
      });
    }
  },
});

const dashboardController = createDashboardController();

export default dashboardController;
