# Dashboard Excel Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm nút "Xuất Excel" ở trang `/management/dashboard`, xuất file `.xlsx` của tab đang mở theo filter hiện tại, backend sinh file bằng ExcelJS.

**Architecture:** Endpoint mới `GET /management/dashboard/export?tab=...` gọi lại các method overview có sẵn trong `dashboard.service.js`, map kết quả thành sheets và dựng buffer bằng helper `buildWorkbookBuffer` đã tồn tại. Frontend thêm nút trong `FilterBar.jsx` tải blob về.

**Tech Stack:** Express 5, ExcelJS (đã có), Prisma; React 19 + Vite, axios, react-i18next.

**Spec:** `docs/superpowers/specs/2026-08-22-dashboard-excel-export-design.md`

**Quy ước repo:** Server ESM (`"type": "module"`); không commit `.env`; backend chưa có test suite thật → xác minh bằng `node --check` + smoke script; frontend xác minh bằng `npm run build --prefix client` + `npm run lint --prefix client`. KHÔNG đổi `server/prisma/schema.prisma`.

---

### Task 1: Backend — service xuất Excel

**Files:**
- Create: `server/src/services/management/dashboardExport.service.js`

- [ ] **Step 1: Tạo file service với toàn bộ builder**

```js
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
        summarySheet([
          { label: '[Coupon] Tổng đơn', value: c.totalOrders },
          { label: '[Coupon] Có mã giảm giá', value: c.withCoupon },
          { label: '[Coupon] Không mã', value: c.withoutCoupon },
          { label: '[Coupon] Tỷ lệ dùng (%)', value: c.couponRate },
          { label: '[Coupon] Tổng giảm giá', value: c.totalDiscount },
        ].map((r) => ({ ...r, label: r.label }))),
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
```

- [ ] **Step 2: Kiểm tra cú pháp**

Run: `node --check server/src/services/management/dashboardExport.service.js`
Expected: không có output nào (exit 0).

- [ ] **Step 3: Commit**

```bash
git add server/src/services/management/dashboardExport.service.js
git commit -m "feat(dashboard): add excel export service for overview tabs"
```

---

### Task 2: Backend — controller + route

**Files:**
- Modify: `server/src/controllers/management/dashboard.controller.js`
- Modify: `server/src/routes/management/dashboard.route.js`

- [ ] **Step 1: Thêm import service vào controller**

Trong `dashboard.controller.js`, sau dòng `import businessDashboardService from '../../services/management/dashboard.service.js';` thêm:

```js
import dashboardExportService from '../../services/management/dashboardExport.service.js';
```

- [ ] **Step 2: Thêm method exportOverview vào controller**

Thêm vào trong object trả về của `createDashboardController` (trước dòng đóng `});` cuối file, sau method `getBusinessOverview`):

```js
  exportOverview: async (req, res) => {
    try {
      const { buffer, fileName } = await dashboardExportService.exportOverview(req.query);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: t(req, error.message || 'Lỗi khi xuất thống kê.'),
      });
    }
  },
```

- [ ] **Step 3: Thêm route có bảo mật**

Trong `dashboard.route.js`, đổi dòng import middleware thành (bổ sung `isAdmin` — `verifyToken` đã có sẵn):

```js
import { verifyToken, isAdmin } from '../../middlewares/verifyToken.middlware.js';
```

Thêm vào chuỗi route (sau dòng `.get('/inventory-overview', ...)`, trước các dòng comment):

```js
    .get('/export', verifyToken, isAdmin, dashboardController.exportOverview)
```

- [ ] **Step 4: Kiểm tra cú pháp cả 2 file**

Run: `node --check server/src/controllers/management/dashboard.controller.js; node --check server/src/routes/management/dashboard.route.js`
Expected: không có output nào (exit 0).

- [ ] **Step 5: Commit**

```bash
git add server/src/controllers/management/dashboard.controller.js server/src/routes/management/dashboard.route.js
git commit -m "feat(dashboard): add protected excel export endpoint"
```

---

### Task 3: Backend — smoke test bằng script tạm

**Files:**
- Create (tạm, KHÔNG commit): `%TEMP%/opencode/dashboard-export-smoke.mjs`

- [ ] **Step 1: Viết smoke script**

Script nằm ngoài workspace, import service qua đường dẫn tuyệt đối dạng `file:///`, chạy từ thư mục `server/` để `exceljs`, `@prisma/client`, `.env` resolve đúng:

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import ExcelJS from 'exceljs';

const outDir = process.env.SMOKE_OUT_DIR;
mkdirSync(outDir, { recursive: true });

const { default: svc } = await import('file:///D:/Programming/SportNexus/server/src/services/management/dashboardExport.service.js');

for (const tab of ['business', 'orders', 'products', 'promotions']) {
  const { buffer, fileName } = await svc.exportOverview({ tab, from: '2026-01-01', to: '2026-12-31', group_by: 'day' });
  const filePath = join(outDir, fileName);
  writeFileSync(filePath, Buffer.from(buffer));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  console.log(`OK ${tab}: ${fileName} -> sheets: ${wb.worksheets.map((w) => w.name).join(', ')}`);
}
console.log('ALL PASS');
```

Lưu ý: nếu máy chạy Node < 20.6 (không có `--env-file`), thay bằng tạo `process.env.DATABASE_URL` thủ công hoặc chèn `import 'dotenv/config';` đầu file (dotenv có sẵn trong server/node_modules, nhưng khi script nằm ngoài workspace thì bare specifier sẽ resolve từ server/node_modules vì Node đi lên cây thư mục... KHÔNG — temp dir không nằm dưới server). Nếu `--env-file` lỗi, fallback: copy script vào `server/scripts/dashboard-export-smoke.mjs` (KHÔNG commit) và chạy bình thường với dotenv tự load.

- [ ] **Step 2: Chạy script**

Run (PowerShell, workdir `D:\Programming\SportNexus\server`):
```powershell
$env:SMOKE_OUT_DIR = "$env:TEMP\opencode\smoke-out"; node --env-file=.env "$env:TEMP\opencode\dashboard-export-smoke.mjs"
```
Expected: 4 dòng `OK <tab>: bao-cao-<tab>-....xlsx -> sheets: TongQuan, ...` rồi `ALL PASS`.

Nếu lỗi kết nối DB (`DATABASE_URL` không truy cập được từ máy hiện tại): ghi nhận là verification gap, vẫn phải đảm bảo `node --check` pass và chuyển tiếp; báo cáo cuối phải nêu rõ gap này.

- [ ] **Step 3: Xóa script tạm (nếu đã copy vào server/scripts)**

```bash
Remove-Item -LiteralPath "server\scripts\dashboard-export-smoke.mjs" -ErrorAction SilentlyContinue
```

(Không commit gì ở task này.)

---

### Task 4: Frontend — helper downloadBlob dùng chung

**Files:**
- Create: `client/src/utils/download.utils.js`
- Modify: `client/src/components/admin/ExcelCrudActions.jsx:8-15`

- [ ] **Step 1: Tạo util**

```js
const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default downloadBlob;
```

- [ ] **Step 2: Refactor ExcelCrudActions dùng util**

Trong `ExcelCrudActions.jsx`: xóa hàm local `downloadBlob` (dòng 8–15) và thêm import:

```js
import downloadBlob from "@/utils/download.utils";
```

(Thứ tự import giữ nguyên style hiện tại: sau `ShowToast`.)

- [ ] **Step 3: Commit**

```bash
git add client/src/utils/download.utils.js client/src/components/admin/ExcelCrudActions.jsx
git commit -m "refactor(client): extract shared downloadBlob util"
```

---

### Task 5: Frontend — API method

**Files:**
- Modify: `client/src/api/management/dashboardApi.jsx`

- [ ] **Step 1: Thêm method exportOverview**

Thêm vào object `dashboardApi` (sau `getBusinessOverview`, trước dấu `};`):

```js
  exportOverview: (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.tab) searchParams.set("tab", params.tab);
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.group_by) searchParams.set("group_by", params.group_by);
    if (params.revenue_from) searchParams.set("revenue_from", params.revenue_from);
    if (params.revenue_to) searchParams.set("revenue_to", params.revenue_to);
    if (params.trend_from) searchParams.set("trend_from", params.trend_from);
    if (params.trend_to) searchParams.set("trend_to", params.trend_to);
    if (params.payment_from) searchParams.set("payment_from", params.payment_from);
    if (params.payment_to) searchParams.set("payment_to", params.payment_to);

    const query = searchParams.toString();
    return axiosClient.get(
      query ? `/management/dashboard/export?${query}` : "/management/dashboard/export",
      { responseType: "blob" }
    );
  },
```

- [ ] **Step 2: Commit**

```bash
git add client/src/api/management/dashboardApi.jsx
git commit -m "feat(client): add dashboard export api call"
```

---

### Task 6: Frontend — nút Xuất Excel trong FilterBar

**Files:**
- Modify: `client/src/pages/Admin/Dashboard/components/FilterBar.jsx`

- [ ] **Step 1: Bổ sung imports**

```js
import { RefreshCw, FileSpreadsheet, Loader2 } from "lucide-react";
import ShowToast from "@/components/ui/toast";
import dashboardApi from "@/api/management/dashboardApi";
import downloadBlob from "@/utils/download.utils";
```

(Gộp `FileSpreadsheet`, `Loader2` vào import lucide-react sẵn có.)

- [ ] **Step 2: Thêm state + handler**

Bên trong component `FilterBar`, sau dòng `const [activePreset, setActivePreset] = useState("30d");`:

```js
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      params.tab = searchParams.get("tab") || "business";
      const res = await dashboardApi.exportOverview(params);
      downloadBlob(res, `bao-cao-${params.tab}.xlsx`);
      ShowToast("success", t("export_success"));
    } catch (err) {
      ShowToast("error", err?.message || t("export_error"));
    } finally {
      setExporting(false);
    }
  };
```

- [ ] **Step 3: Thêm nút vào JSX**

Chèn ngay TRƯỚC nút Làm mới (Refresh, block `{/* Nút Làm mới (Refresh) */}`):

```jsx
        {/* Nút Xuất Excel */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer
                     border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                     dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title={t("export_excel")}
        >
          {exporting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={12} />
          )}
          {exporting ? t("exporting") : t("export_excel")}
        </button>
```

- [ ] **Step 4: Commit (sau khi i18n keys ở Task 7 đã có để tránh build thiếu key)**

Commit cùng Task 7:

```bash
git add client/src/pages/Admin/Dashboard/components/FilterBar.jsx
git commit -m "feat(dashboard): add excel export button to filter bar"
```

---

### Task 7: i18n keys

**Files:**
- Modify: `client/src/locales/vi/dashboard.json` (mục `"dashboard"`, sau dòng `"refresh_title"`)
- Modify: `client/src/locales/en/dashboard.json` (mục tương ứng)

- [ ] **Step 1: Thêm keys tiếng Việt**

Sau `"refresh_title": "Làm mới dữ liệu",` thêm:

```json
    "export_excel": "Xuất Excel",
    "exporting": "Đang xuất...",
    "export_success": "Đã xuất file Excel thành công",
    "export_error": "Xuất file Excel thất bại",
```

- [ ] **Step 2: Thêm keys tiếng Anh**

Trong `client/src/locales/en/dashboard.json`, tìm `"refresh_title"` trong mục `"dashboard"` và thêm ngay sau:

```json
    "export_excel": "Export Excel",
    "exporting": "Exporting...",
    "export_success": "Excel file exported successfully",
    "export_error": "Failed to export Excel file",
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Admin/Dashboard/components/FilterBar.jsx client/src/locales/vi/dashboard.json client/src/locales/en/dashboard.json
git commit -m "feat(dashboard): add export button with i18n labels"
```

(Nếu Task 6 chưa commit FilterBar thì gộp chung commit này.)

---

### Task 8: Xác minh tổng thể

- [ ] **Step 1: Build frontend**

Run: `npm run build --prefix client`
Expected: build thành công, không lỗi.

- [ ] **Step 2: Lint frontend**

Run: `npm run lint --prefix client`
Expected: 0 error (warning cũ có thể còn, không được phát sinh warning/error mới ở các file đã sửa).

- [ ] **Step 3: Kiểm tra lại syntax backend**

Run: `node --check server/src/controllers/management/dashboard.controller.js; node --check server/src/routes/management/dashboard.route.js; node --check server/src/services/management/dashboardExport.service.js`
Expected: exit 0, không output.

- [ ] **Step 4: Báo cáo**

Báo cáo cuối phải nêu rõ:
- Đã đổi gì (files), route mới + bảo mật `verifyToken, isAdmin`.
- Schema Prisma: KHÔNG đổi gì.
- Kết quả smoke test Task 3 (hoặc gap nếu DB không truy cập được).
- Kết quả build/lint.
- Gap còn lại: backend chưa có automated test suite; smoke test endpoint HTTP thật cần server chạy + token admin.

---

## Self-review checklist (đã chạy)

1. **Spec coverage:** Route/controller/service export (Task 1–2), bảo mật verifyToken+isAdmin (Task 2 Step 3), frontend API (Task 5), nút FilterBar + toast + loading (Task 6), downloadBlob dùng chung (Task 4), i18n vi/en (Task 7), xác minh (Task 3, 8) — đủ so với spec.
2. **Placeholder scan:** Không còn TBD/TODO; mọi step code đều có code hoàn chỉnh.
3. **Type consistency:** `exportOverview(query)` trả `{ buffer, fileName }` — khớp controller Task 2; `dashboardApi.exportOverview(params)` khớp handler Task 6; sheet shape `{name, columns, rows}` khớp `buildWorkbookBuffer` hiện có; key dữ liệu lấy đúng shape trả về của từng overview method đã đọc trong `dashboard.service.js`.
