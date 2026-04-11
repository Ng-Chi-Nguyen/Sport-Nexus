# docs/

Thư mục `docs/` dùng để lưu tài liệu tham khảo về mô hình dữ liệu và nghiệp vụ. Đây **không** phải tài liệu triển khai production hoàn chỉnh.

## Source of truth

- **Runtime/DB source of truth:** `server/prisma/schema.prisma`
- Tài liệu trong `docs/` chỉ dùng để onboarding, trao đổi nghiệp vụ và đối chiếu nhanh.

## Danh mục tài liệu (trạng thái hiện tại)

Hiện tại worktree này chưa có các file tài liệu DB gốc trong `docs/`. Bảng dưới mô tả vai trò dự kiến của từng loại file theo kế hoạch tài liệu:

| File | Vai trò | Trạng thái trong worktree hiện tại |
|---|---|---|
| `docs.docx` | Ghi chú prose về domain, thực thể và luồng nghiệp vụ | Không tìm thấy |
| `*.mwb` | File MySQL Workbench cho ERD/model | Không tìm thấy |
| `*.png` | Ảnh sơ đồ quan hệ/chụp mô hình để xem nhanh | Không tìm thấy |
| `*.bak` | Bản sao lưu/phiên bản trước của tài liệu mô hình | Không tìm thấy |

## Tóm tắt domain database (theo Prisma schema hiện tại)

Tóm tắt dưới đây dựa trên `server/prisma/schema.prisma` (dòng 10-385):

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

1. **Thiếu tài liệu prose/diagram trong `docs/`**
   - Bằng chứng: `docs/` chỉ có file README này trong worktree hiện tại.
   - Hệ quả: không thể coi các mô tả prose/diagram là nguồn xác thực runtime ở branch này.

2. **Nguồn dữ liệu runtime nằm ở Prisma schema, không nằm ở docs prose**
   - Bằng chứng: `README.md` (dòng 66-68) đã ghi rõ `server/prisma/schema.prisma` là nguồn sự thật, `docs/` chỉ là tài liệu tham khảo.
   - Hệ quả: khi có mâu thuẫn giữa ghi chú tài liệu và model thật, ưu tiên schema.

3. **Không khẳng định quan hệ chỉ có trong prose**
   - Bằng chứng: hiện không có file `docs.docx`/`*.mwb`/`*.png`/`*.bak` để đối chiếu.
   - Hệ quả: chỉ sử dụng các quan hệ thể hiện trực tiếp trong `schema.prisma` cho phân tích kỹ thuật.

## Cách dùng `docs/` khi onboarding hoặc phân tích DB

1. Đọc `server/prisma/schema.prisma` trước để nắm model và quan hệ thực thi.
2. Dùng tài liệu trong `docs/` (nếu có ở các branch khác) để hiểu ngữ cảnh nghiệp vụ và thuật ngữ.
3. Khi có khác biệt giữa prose và schema, ghi nhận mismatch và chốt theo schema.
4. Nếu cần cập nhật tài liệu DB, ưu tiên cập nhật theo thay đổi schema mới nhất để tránh drift.
