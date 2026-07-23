# Categories Import/Export Design

## Overview

Import và Export danh mục qua file .xlsx. Categories là entity pilot — nếu OK sẽ mở rộng sang các entity khác.

## Flow

```
📥 Download Template → ✏️ Điền data → 📤 Upload → 🔍 Preview → ✅ Import
```

Mỗi admin page Categories sẽ có 2 nút mới: **📥 Import** và **📤 Export**.

---

## File Template (.xlsx)

### Sheet 1: Categories

| Tên danh mục \* | Slug                | Hình ảnh       | Trạng thái | Mô tả |
| --------------- | ------------------- | -------------- | ---------- | ----- |
| _bắt buộc_      | _tự sinh nếu trống_ | _URL Supabase_ | _dropdown_ |       |

Style:

- Header tím gradient (#667eea) cho cột bắt buộc (Tên danh mục)
- Header xanh nhạt (#a8b5e8) cho cột tùy chọn
- Data validation dropdown cho "Trạng thái": `Hoạt động, Ngừng`
- Conditional formatting: ô Tên danh mục để trống → nền đỏ
- Dòng mẫu (italic, màu xám) hướng dẫn format

### Sheet 2: Hướng dẫn

Ô text hướng dẫn điền file, giải thích các cột.

---

## API

### Import

```
POST /api/v1/management/categories/import
Content-Type: multipart/form-data
Body: file (xlsx)
Auth: verifyToken + checkPermission("them-danh-muc")
```

Response (200):

```json
{
  "total": 15,
  "success": 14,
  "failed": 1,
  "errors": [
    { "row": 3, "field": "name", "message": "Tên danh mục không được để trống" }
  ],
  "imported": [{ "id": 1, "name": "Giày thể thao" }],
  "errorFileUrl": "/api/v1/management/categories/import/error-file/abc123.xlsx"
}
```

`errorFileUrl` trả về đường dẫn tạm thời đến file .xlsx chỉ gồm các dòng lỗi + cột "Lỗi" mô tả. File được lưu trên server (temp) và tự xóa sau 30 phút. Nhờ đó client không phải gửi lại mảng lỗi cho server.

### Export

```
GET /api/v1/management/categories/export
Auth: verifyToken + checkPermission("xem-danh-muc")
```

Response: file .xlsx (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### Download Template

```
GET /api/v1/management/categories/template
Auth: verifyToken
```

Response: file .xlsx rỗng (chỉ header + hướng dẫn + dòng mẫu)

### Download Error File

```
GET /api/v1/management/categories/import/error-file/:token
```

Response: file .xlsx tạm — lỗi dòng nào thì ghi dòng đó + cột mô tả lỗi.

Token là mã xác thực duy nhất, được trả về trong `errorFileUrl` ở response import. File temp tồn tại 30 phút rồi cleanup.

---

## Server

### Performance & Large File Handling

| Item                   | Giá trị        | Lý do                                 |
| ---------------------- | -------------- | ------------------------------------- |
| `maxFileSize` (multer) | 5MB            | Tránh file quá lớn làm treo server    |
| `maxRows` (service)    | 1,000 dòng     | Giới hạn số dòng trong 1 lần import   |
| Batch size             | 100 dòng/batch | Insert theo chunk để tránh timeout DB |

**Chiến lược Import: Partial Success**

- Dòng đúng → lưu. Dòng sai → bỏ qua + ghi lỗi. Không rollback toàn bộ.
- Insert theo batch (100 dòng/batch), dùng `prisma.$transaction` với từng chunk.
- Nếu 1 batch lỗi, chỉ rollback batch đó, các batch trước vẫn giữ.

### Service (`server/src/services/management/categoryImport.service.js`)

- `generateTemplate()` — tạo file xlsx template với ExcelJS (style, validation, dropdown)
- `parseFile(file)` — đọc file, parse từng dòng, validate, deduplicate
- `importCategories(parsedData)` — batch insert theo chunk, trả về kết quả + errorFileToken
- `generateExport()` — lấy từ DB, tạo file xlsx style template
- `generateErrorFile(token)` — đọc mảng lỗi từ temp storage, generate file xlsx

### Validation & Edge Cases

| Field       | Rule                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| name        | Required, max 191 chars. **Deduplicate trong file**: nếu 2 dòng cùng tên → báo lỗi ngay                                          |
| slug        | Optional. Tự sinh từ name bằng `slugify` (đã có trong server deps) — xử lý tiếng Việt có dấu. Nếu user nhập, check unique với DB |
| image       | Optional — URL string                                                                                                            |
| is_active   | Chuyển "Hoạt động" → true, "Ngừng" → false                                                                                       |
| description | Optional — text                                                                                                                  |

**Deduplication strategy:**

1. Dùng Set/Map trên memory để phát hiện tên/slug trùng ngay trong file Excel trước khi query DB
2. Với DB, dùng `findMany` query một lần để lấy tất cả slug đã tồn tại → so sánh trong memory

**File security:**

- Multer filter check cả extension `.xlsx` lẫn MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Dependencies

- Thêm `exceljs` package vào server
- Dùng `multer` đã có sẵn (upload.single('file'))

---

## Client

### New Page: Import Modal

File: `client/src/pages/Admin/categories/components/ImportModal.jsx`

Steps:

1. **Select file** — drag & drop zone hoặc click chọn
2. **Preview** — render bảng từ dữ liệu parse, highlight lỗi (nền vàng + text đỏ)
3. **Import** — nút "Import N dòng hợp lệ" + "Tải file lỗi"
4. **Result** — toast thông báo số dòng thành công/thất bại + nút "Tải file lỗi" dùng `errorFileUrl`

### New Button: Export

Trong `categories/index.jsx`, thêm nút "📤 Export" cạnh nút "Thêm mới".

Gọi API export → nhận blob → trigger download.

### Files Affected

| File                                                           | Change                                             |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `client/src/pages/Admin/categories/index.jsx`                  | Thêm nút Import + Export                           |
| `client/src/pages/Admin/categories/components/ImportModal.jsx` | **Tạo mới**                                        |
| `server/src/services/management/categoryImport.service.js`     | **Tạo mới**                                        |
| `server/src/controllers/management/categories.controller.js`   | Thêm import, export, template, error-file handlers |
| `server/src/routes/management/category.route.js`               | Thêm 4 route mới                                   |
| `server/package.json`                                          | Thêm `exceljs` dependency                          |

---

## Logging

Mỗi lần import ghi SystemLog:

- action_type: `IMPORT`
- entity_type: `Categories`
- entity_id: null (batch)
- details: `{ total: 15, success: 14, failed: 1 }`
- status: `SUCCESS` hoặc `FAILED`

---

## Non-Goals

- Không xử lý ảnh upload trong import (chỉ nhận URL có sẵn)
- Không import categories lồng nhau (nested) ở phase này
- Không hỗ trợ .csv ở phase 1

---

## Future

Sau Categories, mở rộng template pattern cho: Products, Brands, Suppliers, Users, Coupons, Orders.
