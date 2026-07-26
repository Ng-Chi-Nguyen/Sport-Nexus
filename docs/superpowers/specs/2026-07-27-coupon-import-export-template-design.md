# Coupon Import / Export / Template Design

## Overview
Thêm tính năng import (Excel), export (Excel), và tải template cho module Coupons (mã giảm giá / khuyến mãi), tận dụng lại hệ thống `ExcelCrudImport` có sẵn.

## Architecture
- **Backend**: module config single-sheet trong `excelCrudImport`, route helper `attachExcelCrudImportRoutes`
- **Frontend**: component `ExcelCrudActions` + `ExcelCrudImportModal` có sẵn

## Files thay đổi

### Backend
1. **`server/src/services/management/excelCrudImport/columns.js`** — thêm `couponColumns`
2. **`server/src/services/management/excelCrudImport/modules/coupons.js`** — file mới
3. **`server/src/services/management/excelCrudImport/modules/index.js`** — đăng ký module
4. **`server/src/routes/management/coupon.route.js`** — gắn route

### Frontend
5. **`client/src/pages/Admin/coupons/index.jsx`** — thêm `ExcelCrudActions`

## Excel Structure
- **Sheet**: "Mã giảm giá"
- **Columns**: ID, Mã code, Loại giảm giá, Giá trị giảm, Giảm tối đa, Đơn tối thiểu, Ngày bắt đầu, Ngày kết thúc, Giới hạn dùng, Đã dùng, Kích hoạt
- **Dropdown validation**: Loại giảm giá (CASH/PERCENTAGE), Kích hoạt (true/false)

## Permissions
- Import: `them-ma-giam-gia` (giống permission tạo mới)
- Export/Template: chỉ cần `verifyToken`

## Data Flow
- **Import**: parse Excel → validate → tạo mới (nếu không có ID) hoặc cập nhật (nếu có ID)
- **Export**: query toàn bộ Coupons (chưa xoá mềm) → xuất Excel
- **Template**: sinh file Excel với header và dropdown validation, không có dữ liệu
