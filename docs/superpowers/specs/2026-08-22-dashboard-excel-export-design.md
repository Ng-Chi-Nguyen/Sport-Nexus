# Thiết kế: Xuất Excel trang Dashboard (theo tab hiện tại)

- Ngày: 2026-08-22
- Phạm vi: Trang quản trị `/management/dashboard`, xuất file `.xlsx` cho tab đang mở, áp dụng đúng filter hiện tại.
- Hướng đã chốt: Backend sinh file bằng ExcelJS (đã có sẵn trên server), frontend tải blob về.

## 1. Mục tiêu

Người dùng quản trị ở trang Dashboard bấm nút "Xuất Excel" để tải file `.xlsx` chứa dữ liệu của tab đang xem, đúng khoảng thời gian và filter đang chọn. Mỗi tab có nội dung sheet riêng; không có nút "xuất tất cả".

## 2. Thiết kế Backend

### 2.1 Route

Thêm vào `server/src/routes/management/dashboard.route.js`:

```
GET /management/dashboard/export?tab=<tab>&<các filter của tab>
```

- Route mới này bắt buộc đi qua `verifyToken` và `isAdmin` vì trả về dữ liệu quản trị chi tiết (khác với các route overview hiện tại đang bị comment bảo mật — debt có sẵn, không mở rộng trong task này).
- `tab` là một trong: `business | customers | products | inventory | orders | promotions | suppliers | reviews | system`. Giá trị khác → 400.
- Các query còn lại được forward nguyên trạng sang service overview tương ứng (`from`, `to`, `group_by`, `revenue_from/to`, `trend_from/to`, `payment_from/to`).

### 2.2 Controller

Thêm `exportOverview` vào `server/src/controllers/management/dashboard.controller.js`:

- Gọi `dashboardExportService.exportOverview(req.query)`.
- Thành công: set headers và trả buffer:

```js
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
res.status(200).send(buffer);
```

- Tên file: `bao-cao-<tab>-<from>_<to>.xlsx`; nếu tab không dùng khoảng thời gian thì `bao-cao-<tab>.xlsx`. Không dấu tiếng Việt trong tên file.
- Lỗi: 500 JSON `{ success: false, message }`; tab sai → 400 tương tự (controller trả JSON lỗi, axiosClient phía client đã có sẵn logic parse blob lỗi thành JSON — xem `client/src/lib/axiosClient.js` dòng 37–44).

### 2.3 Service xuất file (file mới)

File mới: `server/src/services/management/dashboardExport.service.js`

- Export `createDashboardExportService({ db, dashboardService })` để dễ test, instance mặc định gọi `businessDashboardService` từ `dashboard.service.js`.
- API chính: `async exportOverview(query)`:
  1. Đọc `query.tab`, tra bảng `TAB_EXPORTERS` (map tab → builder).
  2. Gọi method overview tương ứng của `businessDashboardService` với query gốc (tái sử dụng 100% logic truy vấn, không viết lại SQL/Prisma).
  3. Builder chuyển kết quả thành mảng sheets `{ name, columns, rows }`.
  4. Dùng chung helper `buildWorkbookBuffer(sheets)` từ `server/src/services/management/excelCrudImport/workbook.js` (có sẵn style header nền xanh `FF1E40AF`, freeze dòng 1, auto-fit cột hỗ trợ Unicode, numFmt).
  5. Trả `{ buffer, fileName }`.
- Cột số tiền dùng `numFmt: '#,##0'`; phần trăm giữ nguyên giá trị số đã làm tròn sẵn từ service.

### 2.4 Nội dung sheet theo tab

Quy ước đặt tên sheet: không dấu, mỗi sheet ≤ 31 ký tự. Sheet đầu tiên luôn là `TongQuan` (summary dạng 2 cột Chỉ số | Giá trị).

| Tab | Sheets |
|---|---|
| business | TongQuan; DonHangTheoTrangThai; XuHuongDoanhThu; DoanhThuTheoThanhToan |
| customers | TongQuan; XuHuongNguoiDungMoi; TopKhachHang |
| products | TongQuan; XuHuongSanPhamMoi; TopBanChay; TopDoanhThu; BanChay; DoanhThuThap; NhieuBinhLuan; ItBinhLuan; DiemCao; DiemThap; PhanBo (3 nhóm category/brand/supplier kèm cột Loại) |
| inventory | TongQuan; GiaoDichGanNhat; ThongKeTheoLoai; XuHuongGiaoDich |
| orders | TongQuan; DonHangTheoTrangThai; PhuongThucThanhToan; TrangThaiThanhToan; DonHangGanNhat; ThongKeCoupon; XuHuongDonHangMoi; SanPhamBanChay; TiLeGiaoThanhCong |
| promotions | TongQuan; DanhSachMaGiamGia |
| suppliers | TongQuan; DanhSachNhaCungCap (gộp productNames thành chuỗi cách nhau bởi "; ") |
| reviews | TongQuan; PhanBoDiem; BinhLuanGanNhat |
| system | TongQuan; HanhDongHeThong; LogGanNhat |

Chi tiết cột từng sheet map trực tiếp từ key trả về của service overview hiện có (ví dụ `orders.recentOrders`: id, total, finalAmount, status, paymentMethod, paymentStatus, userEmail, createdAt). Header hiển thị tiếng Việt có dấu (VD: "Tổng đơn", "Doanh thu").

## 3. Thiết kế Frontend

### 3.1 API

`client/src/api/management/dashboardApi.jsx` thêm:

```js
exportOverview: (params = {}) => {
  // build searchParams giống các hàm get...Overview hiện có + tab
  return axiosClient.get(`/management/dashboard/export?${query}`, { responseType: 'blob' });
},
```

### 3.2 Nút xuất trong FilterBar

- Sửa `client/src/pages/Admin/Dashboard/components/FilterBar.jsx`: thêm nút "Xuất Excel" (icon `FileSpreadsheet` từ lucide-react) cạnh nút Refresh bên phải.
- Nút đọc `activeTab` từ `useSearchParams` (mặc định `business`), gửi toàn bộ searchParams hiện có lên endpoint export.
- Trạng thái loading (icon `Loader2` quay), disable khi đang tải.
- Thành công: toast "success" qua `ShowToast` + tải file về; lỗi: toast "error" với `err?.message`.

### 3.3 Helper downloadBlob dùng chung

- Tạo `client/src/utils/download.utils.js` xuất `downloadBlob(blob, fileName)` (copy từ pattern `ExcelCrudActions.jsx`).
- Bắt buộc: `ExcelCrudActions.jsx` bỏ hàm local, import helper này (thay đổi 2 dòng, an toàn).
- Ngoài phạm vi: không đụng vào logic download inline ở `stockmovements/index.jsx`.

### 3.4 i18n

Thêm key vào `client/src/locales/vi/dashboard.json` và `en/dashboard.json`:

- `export_excel` (Xuất Excel / Export Excel)
- `exporting` (Đang xuất / Exporting)
- `export_success` (Đã xuất file Excel thành công / Excel exported successfully)
- `export_error` (Xuất file Excel thất bại / Failed to export Excel)

## 4. Xử lý lỗi & trường hợp biên

- Tab không hợp lệ → 400 + message rõ ràng.
- Dữ liệu rỗng → vẫn xuất file, sheet có header nhưng không có dòng (helper `buildWorkbookBuffer` hỗ trợ sẵn).
- Lỗi server → 500 JSON; client parse blob lỗi (sẵn trong axiosClient) và hiển thị toast.
- Timeout request lớn: giới hạn tự nhiên do dữ liệu dashboard đã tổng hợp (top 20, recent 20–50), không có export toàn bộ bảng lớn.

## 5. Bảo mật

- Route export mới: `verifyToken` + `isAdmin`.
- Không log token hay biến môi trường nhạy cảm.

## 6. Kiểm chứng (verification)

Backend chưa có test suite thật (`npm test --prefix server` là placeholder):

1. `node --check` các file mới/sửa trên server.
2. Script kiểm thử thủ công tạm (chạy bằng node, không commit): gọi thẳng `exportOverview({ tab: 'orders', ... })` ghi ra file `.xlsx` tạm trong `%TEMP%/opencode`, xác nhận workbook đọc lại được (dùng ExcelJS load) — thực hiện với ít nhất tab `business`, `orders`, `products`.
3. Frontend: `npm run build --prefix client` và `npm run lint --prefix client`.
4. Nếu cả hai phía cùng sửa API contract (route mới) → smoke test chạy server + gọi endpoint bằng curl kèm token admin (nếu môi trường cho phép), nếu không thì ghi rõ gap trong báo cáo cuối.

## 7. Ngoài phạm vi (out of scope)

- Không sửa bảo mật các route overview cũ (debt riêng).
- Không xuất tất cả tab trong 1 file nhiều sheet.
- Không đổi schema Prisma, không đổi response shape của các overview API hiện có.
