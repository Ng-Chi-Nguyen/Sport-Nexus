# docs/

Thư mục `docs/` dùng để lưu tài liệu tham khảo về mô hình dữ liệu và nghiệp vụ. Đây **không** phải tài liệu triển khai production hoàn chỉnh.

## Source of truth

- **Runtime/DB source of truth:** `../server/prisma/schema.prisma`
- Tài liệu trong `docs/` chỉ dùng để onboarding, trao đổi nghiệp vụ và đối chiếu nhanh.

## Danh mục tài liệu hiện có

| File | Vai trò thực tế |
|---|---|
| `docs.docx` | Ghi chú prose về auth flow, thực thể domain, luồng order/inventory, Prisma/Joi/HTTP và một phần cấu trúc frontend |
| `moele_diagram.mwb` | File MySQL Workbench chứa model/ERD database để đối chiếu cấu trúc quan hệ |
| `moele_diagram.mwb.bak` | Bản backup của model Workbench |
| `DiagramDB.png` | Ảnh sơ đồ database để xem nhanh |
| `dig2.png` | Ảnh sơ đồ/phần mở rộng của model để tham khảo nhanh |

## Tóm tắt domain database (theo Prisma schema hiện tại)

Tóm tắt dưới đây dựa trên `../server/prisma/schema.prisma`:

- **Identity & phân quyền**: `Users`, `Roles`, `Permissions`, `SystemLogs`.
- **Thông tin khách hàng**: `UserAddresses` gắn với `Users`.
- **Catalog sản phẩm**: `Categories`, `Brands`, `Suppliers`, `Products`, `ProductImages`, `ProductVariants`, `AttributeKeys`, `VariableAttributes`.
- **Bán hàng**: `Carts`, `CartItems`, `Orders`, `OrderItems`, `Coupons`, các enum `OrderStatus`, `PaymentMethod`, `PaymentStatus`.
- **Hậu cần tồn kho/mua hàng**: `StockMovements`, `PurchaseOrders`, `PurchaseOrderItems`, enum `TypeStock`, `StatusPurchaseOrders`.
- **Chất lượng sau bán**: `Reviews` liên kết `Users` + `Orders` + `Products`.

## Flow nghiệp vụ chính (đọc theo schema)

1. **Catalog → biến thể**: tạo `Products` và các `ProductVariants` + `VariableAttributes` để đại diện thuộc tính bán hàng.
2. **Mua hàng**: người dùng thêm biến thể vào `Carts`/`CartItems`, tạo `Orders` + `OrderItems`, tùy chọn `Coupons`.
3. **Thanh toán & trạng thái đơn**: theo `payment_method`, `payment_status`, `status` trong `Orders`.
4. **Tồn kho**: biến động tồn theo `StockMovements`; nhập hàng theo `PurchaseOrders`/`PurchaseOrderItems`.
5. **Hậu kiểm**: `Reviews` và `SystemLogs` phục vụ vận hành/chẩn đoán.

## Giới hạn và mismatch cần lưu ý

Các điểm dưới đây có bằng chứng trực tiếp từ repository hiện tại:

1. **Nguồn dữ liệu runtime nằm ở Prisma schema, không nằm ở docs prose**
   - Bằng chứng: `../README.md` đã ghi rõ schema Prisma phía backend là nguồn sự thật, `docs/` chỉ là tài liệu tham khảo.
   - Hệ quả: khi có mâu thuẫn giữa ghi chú tài liệu và model thật, ưu tiên schema.

2. **Docs có thể partial hoặc lệch so với schema hiện tại**
   - Bằng chứng: repo có tài liệu prose/diagram trong `docs/`, nhưng runtime model thật vẫn nằm ở `../server/prisma/schema.prisma`.
   - Hệ quả: dùng `docs/` để hiểu ngữ cảnh nghiệp vụ, nhưng đối chiếu kỹ thuật phải chốt theo schema.

3. **Repo chưa cung cấp bootstrap DB hoàn chỉnh**
   - Bằng chứng: `../server/package.json` không có script migration/seed, và `../server/prisma/` hiện được dùng như nơi đặt schema source of truth.
   - Hệ quả: tài liệu trong `docs/` giúp hiểu domain, nhưng không thay thế được quy trình provision database local.

## Cách dùng `docs/` khi onboarding hoặc phân tích DB

1. Đọc `../server/prisma/schema.prisma` trước để nắm model và quan hệ thực thi.
2. Dùng tài liệu trong `docs/` (nếu có ở các branch khác) để hiểu ngữ cảnh nghiệp vụ và thuật ngữ.
3. Khi có khác biệt giữa prose và schema, ghi nhận mismatch và chốt theo schema.
4. Nếu cần cập nhật tài liệu DB, ưu tiên cập nhật theo thay đổi schema mới nhất để tránh drift.
