import businessDashboardService from './dashboard.service.js';
import { buildWorkbookBuffer } from './excelCrudImport/workbook.js';

const MONEY_FMT = '#,##0';

const summarySheet = (rows) => ({
  name: 'TongQuan',
  columns: [
    { header: 'Chỉ số', key: 'label', width: 32 },
    { header: 'Giá trị', key: 'value', width: 24 },
  ],
  rows,
});

const listSheet = (name, columns, rows) => ({ name, columns, rows });

const textOf = (value) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : value;
};

const buildFileName = (tab, data = {}) => {
  const meta = data.meta || {};
  return meta.from && meta.to
    ? `bao-cao-${tab}-${meta.from}_${meta.to}.xlsx`
    : `bao-cao-${tab}.xlsx`;
};

const TAB_EXPORTERS = {
  business: async (query, svc) => {
    const d = await svc.getBusinessOverview(query);
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng doanh thu', value: s.totalRevenue },
          { label: 'Tổng chi phí', value: s.totalCost },
          { label: 'Lợi nhuận', value: s.totalProfit },
          { label: 'Biên lợi nhuận (%)', value: s.profitMargin },
          { label: 'Tổng đơn hàng', value: s.totalOrders },
          { label: 'Giá trị đơn trung bình', value: s.averageOrderValue },
          { label: 'Tỷ lệ giao thành công (%)', value: s.successRate },
          { label: 'Tỷ lệ hủy (%)', value: s.cancelRate },
          { label: 'Tỷ lệ hoàn tiền (%)', value: s.refundRate },
        ]),
        listSheet('DonHangTheoTrangThai',
          [{ header: 'Trạng thái', key: 'status' }, { header: 'Số đơn', key: 'count' }],
          Object.entries(d.ordersByStatus).map(([status, count]) => ({ status, count }))),
        listSheet('XuHuongDoanhThu',
          [{ header: 'Kỳ', key: 'period' }, { header: 'Doanh thu', key: 'revenue', numFmt: MONEY_FMT }],
          d.revenueTrend),
        listSheet('DoanhThuTheoThanhToan',
          [{ header: 'Phương thức', key: 'method' }, { header: 'Doanh thu', key: 'revenue', numFmt: MONEY_FMT }],
          Object.entries(d.revenueByPaymentMethod).map(([method, revenue]) => ({ method, revenue }))),
      ],
    };
  },

  customers: async (query, svc) => {
    const d = await svc.getCustomerOverview(query);
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng người dùng', value: s.totalUsers },
          { label: 'Đã xác thực', value: s.verifiedUsers },
          { label: 'Chưa xác thực', value: s.unverifiedUsers },
          { label: 'Đang hoạt động', value: s.activeUsers },
          { label: 'Bị khóa', value: s.blockedUsers },
          { label: 'Có phát sinh đơn', value: s.usersWithOrders },
          { label: 'Mua lặp lại', value: s.repeatBuyers },
          { label: 'Mua một lần', value: s.oneTimeBuyers },
          { label: 'Tỷ lệ mua lặp lại (%)', value: s.repeatPurchaseRate },
        ]),
        listSheet('XuHuongNguoiDungMoi',
          [{ header: 'Kỳ', key: 'period' }, { header: 'Người dùng mới', key: 'count' }],
          d.newUserTrend),
        listSheet('TopKhachHang',
          [
            { header: 'ID', key: 'userId' },
            { header: 'Họ tên', key: 'fullName', width: 26 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Số đơn', key: 'orderCount' },
            { header: 'Chi tiêu', key: 'totalSpent', numFmt: MONEY_FMT },
          ],
          d.topCustomers),
      ],
    };
  },

  products: async (query, svc) => {
    const d = await svc.getProductOverview(query);
    const s = d.summary;
    const productCols = [
      { header: 'ID', key: 'productId' },
      { header: 'Sản phẩm', key: 'name', width: 30 },
      { header: 'Số lượng bán', key: 'totalSold' },
      { header: 'Doanh thu', key: 'revenue', numFmt: MONEY_FMT },
    ];
    const ratingCols = [
      { header: 'ID', key: 'productId' },
      { header: 'Sản phẩm', key: 'name', width: 30 },
      { header: 'Số đánh giá', key: 'reviewCount' },
      { header: 'Điểm TB', key: 'avgRating' },
    ];
    const dist = d.distribution || {};
    const phanBoRows = [
      ...dist.categories.map((x) => ({ group: 'Danh mục', name: x.name, count: x.count, soldCount: x.soldCount })),
      ...dist.brands.map((x) => ({ group: 'Thương hiệu', name: x.name, count: x.count, soldCount: x.soldCount })),
      ...dist.suppliers.map((x) => ({ group: 'Nhà cung cấp', name: x.name, count: x.count, soldCount: x.soldCount })),
    ];
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng sản phẩm', value: s.totalProducts },
          { label: 'Đang hoạt động', value: s.activeProducts },
          { label: 'Ngừng hoạt động', value: s.inactiveProducts },
          { label: 'Chưa có ảnh', value: s.noImageProducts },
          { label: 'Chưa có biến thể', value: s.noVariantProducts },
          { label: 'Tổng số lượng bán', value: s.totalSold },
        ]),
        listSheet('XuHuongSanPhamMoi',
          [{ header: 'Kỳ', key: 'period' }, { header: 'Sản phẩm mới', key: 'count' }],
          d.newProductTrend),
        listSheet('TopBanChay', productCols, d.topSelling),
        listSheet('TopDoanhThu', productCols, d.topRevenue),
        listSheet('BanChayIt', productCols, d.worstSelling),
        listSheet('DoanhThuThap', productCols, d.lowestRevenue),
        listSheet('NhieuBinhLuan', ratingCols, d.mostReviewed),
        listSheet('ItBinhLuan', ratingCols, d.leastReviewed),
        listSheet('DiemCao', ratingCols, d.highestRated),
        listSheet('DiemThap', ratingCols, d.lowestRated),
        listSheet('PhanBo',
          [
            { header: 'Loại', key: 'group' },
            { header: 'Tên', key: 'name', width: 30 },
            { header: 'Số SP', key: 'count' },
            { header: 'Số lượng bán', key: 'soldCount' },
          ],
          phanBoRows),
      ],
    };
  },

  inventory: async (query, svc) => {
    const d = await svc.getInventoryOverview(query);
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng tồn kho', value: s.totalStock },
          { label: 'Số biến thể', value: s.totalVariants },
          { label: 'Giá trị tồn kho', value: s.stockValue },
        ]),
        listSheet('GiaoDichGanNhat',
          [
            { header: 'ID', key: 'id' },
            { header: 'Variant ID', key: 'variant_id' },
            { header: 'Loại', key: 'type' },
            { header: 'SL thay đổi', key: 'quantity_change' },
            { header: 'Lý do', key: 'reason', width: 32 },
            { header: 'Ngày tạo', key: 'created_at' },
          ],
          d.recentMovements.map((m) => ({ ...m, reason: textOf(m.reason) }))),
        listSheet('ThongKeTheoLoai',
          [{ header: 'Loại', key: 'type' }, { header: 'Số giao dịch', key: 'count' }],
          Object.entries(d.movementCountByType).map(([type, count]) => ({ type, count }))),
        listSheet('XuHuongGiaoDich',
          [
            { header: 'Kỳ', key: 'period' },
            { header: 'Nhập', key: 'nhap' },
            { header: 'Xuất', key: 'xuat' },
            { header: 'Điều chỉnh', key: 'dieu_chinh' },
          ],
          d.movementTrend.map((r) => ({ period: r.period, nhap: r.IN, xuat: r.OUT, dieu_chinh: r.ADJUSTMENT }))),
      ],
    };
  },

  orders: async (query, svc) => {
    const d = await svc.getOrderOverview(query);
    const c = d.couponStats;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng đơn hàng', value: d.summary.totalOrders },
          { label: 'Đang xử lý', value: d.summary.processing },
          { label: 'Đang giao', value: d.summary.shipping },
          { label: 'Đã giao', value: d.summary.delivered },
          { label: 'Đã hủy', value: d.summary.cancelled },
          { label: 'Đã hoàn tiền', value: d.summary.refunded },
        ]),
        listSheet('DonHangTheoTrangThai',
          [{ header: 'Trạng thái', key: 'status' }, { header: 'Số đơn', key: 'count' }],
          d.ordersByStatus),
        listSheet('PhuongThucThanhToan',
          [{ header: 'Phương thức', key: 'method' }, { header: 'Số đơn', key: 'count' }],
          d.paymentMethods),
        listSheet('TrangThaiThanhToan',
          [{ header: 'Trạng thái', key: 'status' }, { header: 'Số đơn', key: 'count' }],
          d.paymentStatuses),
        listSheet('DonHangGanNhat',
          [
            { header: 'ID', key: 'id' },
            { header: 'Email khách', key: 'userEmail', width: 28 },
            { header: 'Tổng tiền', key: 'total', numFmt: MONEY_FMT },
            { header: 'Thành tiền', key: 'finalAmount', numFmt: MONEY_FMT },
            { header: 'Trạng thái', key: 'status' },
            { header: 'Thanh toán', key: 'paymentMethod' },
            { header: 'TT thanh toán', key: 'paymentStatus' },
            { header: 'Ngày tạo', key: 'createdAt' },
          ],
          d.recentOrders),
        listSheet('ThongKeCoupon',
          [
            { header: 'Chỉ số', key: 'label', width: 32 },
            { header: 'Giá trị', key: 'value', width: 24 },
          ],
          [
            { label: 'Tổng đơn', value: c.totalOrders },
            { label: 'Có mã giảm giá', value: c.withCoupon },
            { label: 'Không mã', value: c.withoutCoupon },
            { label: 'Tỷ lệ dùng (%)', value: c.couponRate },
            { label: 'Tổng giảm giá', value: c.totalDiscount },
          ]),
        listSheet('XuHuongDonHangMoi',
          [{ header: 'Kỳ', key: 'period' }, { header: 'Đơn mới', key: 'count' }],
          d.newOrdersTrend),
        listSheet('SanPhamBanChay',
          [
            { header: 'ID', key: 'productId' },
            { header: 'Sản phẩm', key: 'productName', width: 30 },
            { header: 'Số lượng', key: 'totalQuantity' },
            { header: 'Doanh thu', key: 'totalRevenue', numFmt: MONEY_FMT },
          ],
          d.orderProductsSummary),
        listSheet('TiLeGiaoThanhCong',
          [
            { header: 'Kỳ', key: 'period' },
            { header: 'Tổng đơn', key: 'total' },
            { header: 'Đã giao', key: 'delivered' },
            { header: 'Tỷ lệ (%)', key: 'successRate' },
          ],
          d.deliverySuccessTrend),
      ],
    };
  },

  promotions: async (_query, svc) => {
    const d = await svc.getCouponOverview();
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng mã giảm giá', value: s.totalCoupons },
          { label: 'Đang hoạt động', value: s.activeCoupons },
          { label: 'Vô hiệu', value: s.inactiveCoupons },
          { label: 'Tổng lượt dùng', value: s.totalUsage },
        ]),
        listSheet('DanhSachMaGiamGia',
          [
            { header: 'ID', key: 'id' },
            { header: 'Mã', key: 'code' },
            { header: 'Giá trị giảm', key: 'discount_value', numFmt: MONEY_FMT },
            { header: 'Loại giảm', key: 'discount_type' },
            { header: 'Giảm tối đa', key: 'max_discount', numFmt: MONEY_FMT },
            { header: 'Đơn tối thiểu', key: 'min_order_value', numFmt: MONEY_FMT },
            { header: 'Giới hạn', key: 'usage_limit' },
            { header: 'Đã dùng', key: 'usage_count' },
            { header: 'Còn lại', key: 'remaining' },
            { header: 'Tỷ lệ dùng (%)', key: 'usageRate' },
            { header: 'Trạng thái', key: 'is_active' },
            { header: 'Bắt đầu', key: 'start_date' },
            { header: 'Kết thúc', key: 'end_date' },
          ],
          d.coupons.map((c) => ({ ...c, is_active: c.is_active ? 'Hoạt động' : 'Vô hiệu' }))),
      ],
    };
  },

  suppliers: async (_query, svc) => {
    const d = await svc.getSupplierOverview();
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng nhà cung cấp', value: s.totalSuppliers },
          { label: 'Tổng đơn nhập', value: s.totalPurchaseOrders },
          { label: 'Tổng chi phí nhập', value: s.totalPurchaseCost },
        ]),
        listSheet('DanhSachNhaCungCap',
          [
            { header: 'ID', key: 'id' },
            { header: 'Tên', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Điện thoại', key: 'phone' },
            { header: 'Người liên hệ', key: 'contact_person', width: 22 },
            { header: 'Vị trí', key: 'location_data', width: 30 },
            { header: 'Số SP', key: 'productCount' },
            { header: 'Sản phẩm', key: 'productNames', width: 40 },
            { header: 'Số đơn nhập', key: 'orderCount' },
            { header: 'Tổng chi phí nhập', key: 'totalOrderCost', numFmt: MONEY_FMT },
          ],
          d.suppliers.map((x) => ({
            id: x.id,
            name: x.name,
            email: x.email,
            phone: x.phone,
            contact_person: x.contact_person,
            location_data: textOf(x.location_data),
            productCount: x.productCount,
            productNames: (x.productNames || []).join('; '),
            orderCount: x.orderCount,
            totalOrderCost: x.totalOrderCost,
          }))),
      ],
    };
  },

  reviews: async (_query, svc) => {
    const d = await svc.getReviewOverview();
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng đánh giá', value: s.totalReviews },
          { label: 'Điểm trung bình', value: s.avgRating },
          { label: 'Đang hiện', value: s.visibleReviews },
          { label: 'Đang ẩn', value: s.hiddenReviews },
        ]),
        listSheet('PhanBoDiem',
          [{ header: 'Số sao', key: 'rating' }, { header: 'Số lượt', key: 'count' }],
          d.ratingDistribution),
        listSheet('BinhLuanGanNhat',
          [
            { header: 'ID', key: 'id' },
            { header: 'Số sao', key: 'rating' },
            { header: 'Nội dung', key: 'comment', width: 50 },
            { header: 'Ẩn?', key: 'is_hidden' },
            { header: 'User ID', key: 'user_id' },
            { header: 'Sản phẩm', key: 'productName', width: 30 },
            { header: 'Ngày tạo', key: 'created_at' },
          ],
          d.recentReviews.map((r) => ({ ...r, comment: textOf(r.comment), is_hidden: r.is_hidden ? 'Có' : 'Không' }))),
      ],
    };
  },

  system: async (_query, svc) => {
    const d = await svc.getSystemOverview();
    const s = d.summary;
    return {
      data: d,
      sheets: [
        summarySheet([
          { label: 'Tổng log (50 gần nhất)', value: s.totalLogs },
          { label: 'Số user liên quan', value: s.uniqueUsers },
        ]),
        listSheet('HanhDongHeThong',
          [{ header: 'Hành động', key: 'type' }, { header: 'Số lần', key: 'count' }],
          d.actionTypes),
        listSheet('LogGanNhat',
          [
            { header: 'ID', key: 'id' },
            { header: 'User ID', key: 'user_id' },
            { header: 'Người dùng', key: 'userName', width: 22 },
            { header: 'Email', key: 'userEmail', width: 28 },
            { header: 'Hành động', key: 'action_type' },
            { header: 'Đối tượng', key: 'entity_type' },
            { header: 'Đối tượng ID', key: 'entity_id' },
            { header: 'Chi tiết', key: 'details', width: 50 },
            { header: 'Thời gian', key: 'created_at' },
          ],
          d.recentLogs.map((l) => ({ ...l, details: textOf(l.details) }))),
      ],
    };
  },
};

export const createDashboardExportService = ({ dashboardService = businessDashboardService } = {}) => ({
  async exportOverview(query = {}) {
    const tab = String(query.tab || '').toLowerCase();
    const exporter = TAB_EXPORTERS[tab];
    if (!exporter) {
      const err = new Error('Tab không hợp lệ.');
      err.statusCode = 400;
      throw err;
    }
    const { data, sheets } = await exporter(query, dashboardService);
    const buffer = await buildWorkbookBuffer(sheets);
    return { buffer, fileName: buildFileName(tab, data) };
  },
});

const dashboardExportService = createDashboardExportService();

export default dashboardExportService;
