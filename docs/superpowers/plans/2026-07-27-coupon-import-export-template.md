# Coupon Import / Export / Template Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm import/export/template Excel cho module Coupons, tận dụng hệ thống `ExcelCrudImport` có sẵn.

**Architecture:** Single-sheet module config (giống brands, users) — 1 sheet "Mã giảm giá", dùng `buildSingleSheetModule`. Route import/export gắn qua `attachExcelCrudImportRoutes`.

**Tech Stack:** Node.js/Express + Prisma + ExcelJS (đã có), React + Vite (đã có)

---

### Task 1: Thêm couponColumns vào columns.js

**Files:**
- Modify: `server/src/services/management/excelCrudImport/columns.js`

- [ ] **Thêm couponColumns** — chèn trước dòng `export const orderColumns` (khoảng dòng 65)

Nội dung cần thêm:

```javascript
export const DISCOUNT_TYPE_LABELS = ['CASH', 'PERCENTAGE'];
export const BOOLEAN_LABELS = ['true', 'false'];

export const couponColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Mã code', key: 'code', width: 16 },
  { header: 'Loại giảm giá', key: 'discount_type', width: 18, validation: { type: 'list', formulae: [`"${DISCOUNT_TYPE_LABELS.join(',')}"`], allowBlank: true } },
  { header: 'Giá trị giảm', key: 'discount_value', width: 14, numFmt: '#,##0₫' },
  { header: 'Giảm tối đa', key: 'max_discount', width: 14, numFmt: '#,##0₫' },
  { header: 'Đơn tối thiểu', key: 'min_order_value', width: 14, numFmt: '#,##0₫' },
  { header: 'Ngày bắt đầu', key: 'start_date', width: 18 },
  { header: 'Ngày kết thúc', key: 'end_date', width: 18 },
  { header: 'Giới hạn dùng', key: 'usage_limit', width: 14 },
  { header: 'Đã dùng', key: 'usage_count', width: 12 },
  { header: 'Kích hoạt', key: 'is_active', width: 14, validation: { type: 'list', formulae: [`"${BOOLEAN_LABELS.join(',')}"`], allowBlank: true } },
];
```

### Task 2: Tạo module config coupons

**Files:**
- Create: `server/src/services/management/excelCrudImport/modules/coupons.js`

- [ ] **Tạo file mới** `coupons.js`:

```javascript
// @ts-nocheck
import { trimText, toText, toInt, toBoolean, rowHasOwnData } from "../helpers.js";
import { buildSingleSheetModule } from "../builders.js";
import { couponColumns } from "../columns.js";
import { ACTIVE } from "../../../../utils/prisma.js";

export const coupons = buildSingleSheetModule({
  sheetName: "Mã giảm giá",
  fileName: "ma-giam-gia.xlsx",
  columns: couponColumns,
  exportAll: async (db) => {
    const rows = await db.Coupons.findMany({
      where: { deleted_at: ACTIVE },
      orderBy: { id: "asc" },
    });

    return rows.map((item) => ({
      id: item.id,
      code: item.code || "",
      discount_type: item.discount_type || "",
      discount_value: Number(item.discount_value ?? 0),
      max_discount: Number(item.max_discount ?? 0),
      min_order_value: Number(item.min_order_value ?? 0),
      start_date: item.start_date ? item.start_date.toISOString().split('T')[0] : '',
      end_date: item.end_date ? item.end_date.toISOString().split('T')[0] : '',
      usage_limit: item.usage_limit ?? 0,
      usage_count: item.usage_count ?? 0,
      is_active: item.is_active ? 'true' : 'false',
    }));
  },
  parseRow: ({ values }) => {
    if (!rowHasOwnData(values)) {
      return { values, rawValues: values, errors: [] };
    }

    const id = toInt(values[0]);
    const code = toText(values[1]);
    const discount_type = toText(values[2]);
    const discount_value = toInt(values[3]);
    const max_discount = toInt(values[4]);
    const min_order_value = toInt(values[5]);
    const start_date = toText(values[6]);
    const end_date = toText(values[7]);
    const usage_limit = toInt(values[8]);
    const usage_count = toInt(values[9]);
    const is_active = toText(values[10]);

    const errors = [];
    if (!code) errors.push({ field: 'code', message: 'Mã code không được để trống' });
    if (!discount_type) errors.push({ field: 'discount_type', message: 'Loại giảm giá không được để trống' });
    if (discount_value === null) errors.push({ field: 'discount_value', message: 'Giá trị giảm không hợp lệ' });
    if (!start_date) errors.push({ field: 'start_date', message: 'Ngày bắt đầu không được để trống' });
    if (!end_date) errors.push({ field: 'end_date', message: 'Ngày kết thúc không được để trống' });

    return {
      values,
      rawValues: values,
      id,
      data: {
        code: code || undefined,
        discount_type: discount_type || undefined,
        discount_value: discount_value ?? undefined,
        max_discount: max_discount ?? undefined,
        min_order_value: min_order_value ?? undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        usage_limit: usage_limit ?? undefined,
        usage_count: usage_count ?? undefined,
        is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      },
      errors,
    };
  },
  importRow: async (db, row) => {
    const data = Object.fromEntries(Object.entries(row.data).filter(([, value]) => value !== undefined));
    if (row.id) {
      const record = await db.Coupons.update({ where: { id: row.id }, data });
      return { action: "update", record };
    }
    const record = await db.Coupons.create({ data: { ...data, usage_count: data.usage_count ?? 0 } });
    return { action: "create", record };
  },
});
```

### Task 3: Đăng ký module coupons trong index.js

**Files:**
- Modify: `server/src/services/management/excelCrudImport/modules/index.js`

- [ ] **Import và đăng ký module**

`oldString`:
```javascript
import { purchaseOrder } from "./purchaseOrder.js";
```

`newString`:
```javascript
import { coupons } from "./coupons.js";
import { purchaseOrder } from "./purchaseOrder.js";
```

`oldString`:
```javascript
  purchaseOrder,
```

`newString`:
```javascript
  coupons,
  purchaseOrder,
```

### Task 4: Gắn route Excel import/export vào coupon.route.js

**Files:**
- Modify: `server/src/routes/management/coupon.route.js`

- [ ] **Thêm imports** — thêm các dòng sau:

```javascript
import { attachExcelCrudImportRoutes } from "../helpers/excelCrudImport.route.js";
import { uploadExcelFile } from "../../middlewares/fileUpload.middleware.js";
```

- [ ] **Gắn route** — thêm sau `const couponRoute = express.Router()` và trước khi export:

```javascript
attachExcelCrudImportRoutes(couponRoute, { moduleKey: "coupons", importPermission: "them-ma-giam-gia" });
```

### Task 5: Thêm ExcelCrudActions vào trang danh sách coupon (Frontend)

**Files:**
- Modify: `client/src/pages/Admin/coupons/index.jsx`

- [ ] **Import ExcelCrudActions** — thêm ở đầu file:

```javascript
import ExcelCrudActions from "@/components/admin/ExcelCrudActions";
```

- [ ] **Thêm component** — chèn vào giữa `useNavigate` redirect (khoảng sau dòng 155 `</BtnAdd>`) và trước comment `{/* KHU VỰC BỘ LỌC */}`:

```jsx
        <ExcelCrudActions
          basePath="/management/coupon"
          title="Import / Export mã giảm giá"
          templateFileName="template-ma-giam-gia.xlsx"
          exportFileName="ma-giam-gia.xlsx"
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            revalidator.revalidate();
          }}
        />
```
