# Thiết kế: Import Excel hỗ trợ cập nhật theo ID (upsert)

- Ngày: 2026-08-22
- Phạm vi: `server/src/services/management/excelCrudImport/` (backend only)
- Trạng thái: Đã được phê duyệt ở mức thiết kế, chờ review spec

## 1. Bối cảnh

Hệ thống import Excel dùng chung (`excelCrudImport`) hiện chỉ tạo mới bản ghi ở đa số module. Framework (`builders.js`) đã hỗ trợ kết quả `action: 'update'` nhưng gần như không module nào dùng.

Hiện trạng cụ thể:

| Module | Trạng thái |
|---|---|
| `brands`, `users`, `attributeKey`, `coupons`, `productVariants` | Chỉ `create` trong `importRow` |
| `suppliers`, `category`, `productAttributeKey` | Có code update theo `row.id` nhưng **lệch cột**: `parseRow` đọc ID tại `values[0]` trong khi `columns.js` không định nghĩa cột ID → file export/template thiếu cột ID, import từ file export sẽ dịch toàn bộ cột |
| `products` | `if (row.id)` là dead code vì `parseRow` không bao giờ gán `row.id` |
| `stockMovements` | Create-only (giữ nguyên — bản ghi nhật ký kho không nên sửa) |
| `orders`, `purchaseOrder` (dual-sheet) | Đã có cơ chế upsert riêng qua `ref_code`/ID, không đổi |

Vấn đề người dùng muốn giải quyết: khi tải file export về, chỉnh sửa dữ liệu rồi import lại, hệ thống tạo bản ghi trùng thay vì cập nhật dòng tương ứng.

## 2. Mục tiêu

- Quy tắc thống nhất cho các module CRUD đơn sheet: **dòng có ID → update; không có ID → create**.
- File export/template có cột `ID` đầu tiên để round-trip: export → sửa → import → update đúng dòng.
- Sửa bug lệch cột ở 4 module đang có code update nửa vời.
- ID không tồn tại trong DB → báo lỗi đúng dòng đó, không làm hỏng các dòng khác.
- Tương thích ngược: file cũ không có cột ID vẫn import bình thường (toàn bộ create).

## 3. Phi mục tiêu

- Không đổi hành vi dual-sheet (`orders`, `purchaseOrder`).
- Không đổi `stockMovements`.
- Không chuyển sang parse theo tên cột (header-key mapping).
- Không thêm match theo khoá nghiệp vụ (email/code/tên).

## 4. Thiết kế

### 4.1 Luồng xử lý mới

```
Upload .xlsx
→ loadWorkbook
→ parseWorkbook (builders.js)
    ├─ Đọc header dòng 1: nếu ô đầu tiên = "ID" → bật cờ idColumn,
    │  strip values[0] thành row.id (qua toInt), phần còn lại truyền vào parseRow
    │  giữ nguyên vị trí index như cũ
    └─ parseRow chỉ đọc business columns (không đổi cách đọc index)
→ importRows (builders.js) → importRow từng dòng
→ upsertRecord(db, model, row, data)
    ├─ row.id có + bản ghi tồn tại     → update  → summary.updated
    ├─ row.id có + bản ghi không tồn tại → action 'error' → summary.errors
    └─ row.id trống                     → create  → summary.created
```

### 4.2 Helper dùng chung — `helpers.js`

Thêm:

```js
export const upsertRecord = async (db, model, { id }, data, { notFoundMessage } = {}) => {
  if (id) {
    const existing = await db[model].findUnique({ where: { id } });
    if (!existing) {
      return {
        action: 'error',
        errors: [{ field: 'id', message: notFoundMessage ?? `Không tìm thấy bản ghi có ID #${id}` }],
      };
    }
    const record = await db[model].update({ where: { id }, data });
    return { action: 'update', record };
  }
  const record = await db[model].create({ data });
  return { action: 'create', record };
};
```

Ghi chú:
- `model` là tên Prisma delegate dạng chuỗi (ví dụ `'Brands'`) — khớp với cách gọi sẵn có `db.Brands`.
- Bọc try/catch lỗi Prisma `P2002` (vi phạm unique) quanh create/update, trả `action: 'error'` kèm thông báo trường tương ứng thay vì làm sập cả lượt import.

### 4.3 Auto-detect cột ID — `builders.js`

Trong `buildSingleSheetModule.parseWorkbook`:

1. Đọc ô header A1 của worksheet.
2. Nếu giá trị (sau trim, lowercase) là `"id"` → cờ `hasIdColumn = true`; ngược lại `false`.
3. Với mỗi dòng dữ liệu: nếu `hasIdColumn` thì `rowId = toInt(values[0])` và `businessValues = values.slice(1)`; nếu không thì `rowId = null`, `businessValues = values`.
4. Gọi `parseRow({ rowNumber, row, values: businessValues, ... })` và gắn `{ id: rowId }` vào kết quả.

Đảm bảo `getSheetRows(worksheet, columns.length)` đọc đủ số cột sau khi `columns.js` thêm cột ID (tăng 1 so với trước).

### 4.4 Cột ID — `columns.js`

Thêm `{ header: 'ID', key: 'id', width: 10 }` vào **đầu** mảng cột của 9 module: `brandColumns`, `userColumns`, `attributeKeyColumns`, `couponColumns`, `productVariantColumns`, `supplierColumns`, `categoryColumns`, `productColumns`, `productAttributeKeyColumns`.

Không thêm cho `stockMovementColumns`.

Do `buildWorkbookBuffer` map row object theo column key, các `exportAll` đã trả về `id` (suppliers, category, users, productAttributeKey…) sẽ tự hiển thị; những module chưa trả `id` cần bổ sung `id: item.id` trong `exportAll`.

### 4.5 Thay đổi từng module — `modules/`

| Module | parseRow | importRow / exportAll |
|---|---|---|
| `brands` | Không đổi | `create` → `upsertRecord`; `exportAll` bổ sung `id` |
| `users` | Không đổi | `create` → `upsertRecord` (password trống khi update → giữ mật khẩu cũ — logic có sẵn); `exportAll` đã có `id` |
| `attributeKey` | Không đổi | `upsertRecord`; `exportAll` bổ sung `id` |
| `coupons` | Không đổi | `upsertRecord`; `exportAll` bổ sung `id` |
| `productVariants` | Không đổi | Upsert; khi **update**: xoá `VariableAttributes` cũ (`deleteMany({ where: { variable_id } })`) rồi tạo lại từ cột Thuộc tính (sync); `exportAll` bổ sung `id` |
| `suppliers` | Bỏ đọc ID thủ công tại `values[0]` (builder lo), các index còn lại giữ nguyên vị trí mới (dịch -1 so với code cũ) | `upsertRecord` (thêm check ID-not-found) |
| `category` | Như suppliers | `upsertRecord` |
| `productAttributeKey` | Bỏ đọc ID thủ công tại `values[0]` (đang có — cùng pattern lệch cột với suppliers/category), index dịch -1, giữ logic validate product_id/attribute_key_id | `upsertRecord` (thêm check ID-not-found) |
| `products` | Không đổi (đã đọc business-first) | Kích hoạt `row.id` (bỏ dead code), chuyển nhánh update/create sang `upsertRecord`; `exportAll` bổ sung `id` |

Lưu ý quan trọng về index: các module trước đây đọc `values[0]` làm ID (suppliers, category, productAttributeKey) sẽ được builder strip ID trước, nên `parseRow` của chúng đọc business fields bắt đầu từ `values[0]` — tức là so với code cũ phải dịch toàn bộ index xuống 1 đơn vị.

## 5. Error handling & tương thích

- **ID không tồn tại**: lỗi `"Không tìm thấy bản ghi có ID #x"` gắn đúng dòng, các dòng khác import tiếp.
- **Vi phạm unique (P2002)** khi create/update: bắt riêng từng dòng, trả lỗi field rõ ràng (ví dụ email/code/slug trùng).
- **File cũ không cột ID**: builder không strip, mọi dòng create — hành vi không đổi.
- **Preview** (`previewImport`): tiếp tục đếm `success`/`failed` theo `errors`; không đổi API contract.
- **Summary import**: đã có sẵn `created`/`updated`/`failed` — client modal hiển thị tổng `success` (không đổi frontend trong scope này).

## 6. Kiểm thử & xác minh

Backend chưa có test suite thật (`npm test --prefix server` là placeholder):

1. Script xác minh nhỏ chạy trực tiếp service bằng workbook giả lập (ExcelJS) phủ các case: create thuần, update theo ID, ID-not-found, P2002 unique, file cũ không cột ID, productVariants sync attributes.
2. Syntax/startup check toàn bộ module bị sửa.
3. Nếu thay đổi chạm API contract dùng chung (không chạm trong scope này) phải verify cả client — hiện tại không cần.

## 7. Rủi ro

- Người dùng đang có file template/export **cũ** (không cột ID) → vẫn chạy nhưng luôn create; cần truyền thông hoặc yêu cầu tải lại template.
- Parse vẫn theo vị trí cột: người dùng tự xáo trộn cột sẽ lệch dữ liệu (đã vậy từ trước, không làm tệ hơn).
