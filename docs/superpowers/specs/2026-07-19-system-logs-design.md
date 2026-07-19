# SystemLogs Feature Design

## Mục tiêu
Xây dựng hệ thống audit log cho các thao tác quan trọng (CRUD, stock adjustment) trong admin panel, hiển thị dạng activity feed trực quan.

## Kiến trúc

```
Controller → Service (ghi log) → DB
     ↑
Middleware (tự động log CRUD)
```

## Backend

### Model (đã có)
- `SystemLogs`: id, timestamp, user_id, action_type, entity_type, entity_id, status, ip_address, details (JSON)

### `details` JSON format

Array changes — hỗ trợ cập nhật nhiều field cùng lúc:

```json
[
  { "field": "status", "from": "Processing", "to": "Delivered" },
  { "field": "shipping_fee", "from": 30000, "to": 0 }
]
```

Với CREATE: `[{ "field": "name", "to": "Giày Nike Air" }]` — không có `from`.
Với DELETE: `[{ "field": null, "from": { toàn bộ bản ghi } }]` — lưu snapshot.

### API Endpoints

| Method | Path | Chức năng |
|--------|------|-----------|
| GET | `/api/v1/management/log/` | Danh sách logs (phân trang + filter) |
| GET | `/api/v1/management/log/:id` | Chi tiết 1 log |

Query params filter: `page`, `user_id`, `action_type`, `entity_type`, `status`, `from`, `to`, `ip_address`, `search` (tìm trong details).

### LogService

```js
logService.create({
  userId,          // req.user.id
  actionType,      // 'CREATE' | 'UPDATE' | 'DELETE' | 'STOCK_ADJUSTMENT'
  entityType,      // 'Orders' | 'Products' | 'Users' | ...
  entityId,        // ID của bản ghi
  status,          // 'SUCCESS' | 'FAILED'
  details,         // array changes
  ipAddress        // req.ip
})
```

### Log Middleware

Wrap controller để tự động log:

- **Thành công:** gọi `logService.create` với status SUCCESS sau khi controller trả về
- **Thất bại:** catch exception, log với status FAILED + error message trong details

## Frontend

### Route
- `/admin/logs` — lazy-loaded, protected (role admin)

### UI: Activity Feed

Mỗi log entry hiển thị:

```
[thời gian]  Ai đó  đã  hành động  entity
           └─ chi tiết (bullet list nếu nhiều thay đổi)
```

- Color: SUCCESS xanh, FAILED đỏ
- Action icons: ➕ CREATE, ✏️ UPDATE, 🗑 DELETE, 📦 STOCK
- Entity name/#id (vd: `#1024`, `"Giày Nike Air"`) → link đến trang chi tiết (`/admin/orders/1024`)
- **Nếu action_type = DELETE:** entity hiển thị text thuần (không link), click vào show snapshot dữ liệu cũ từ details
- Click entry → expand details JSON dạng pretty-print
- Filter sidebar: date range, action_type, entity_type, status

## Chiến lược dữ liệu

- Index composite: `(action_type, entity_type)`, `(user_id, timestamp)`
- Retention: tự động xoá logs > 3 tháng (FAILED giữ 6 tháng)
- Partition theo tháng
