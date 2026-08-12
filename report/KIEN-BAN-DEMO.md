# KỊCH BẢN DEMO HỆ THỐNG SPORTNEXUS

> Kịch bản thao tác trực tiếp phục vụ bảo vệ / thuyết trình.
> Thời lượng đề xuất: **15–20 phút**. Chạy trên môi trường local.

---

## 0. Chuẩn bị trước khi demo

| Việc                        | Lệnh / Thao tác                                      | Ghi chú                                           |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Khởi tạo CSDL & dữ liệu mẫu | `cd server && npx prisma db push` rồi `npm run seed` | Seed tạo sẵn 2 nhân viên + khách + sản phẩm + đơn |
| Chạy backend                | `npm run dev --prefix server`                        | Cổng API (mặc định)                               |
| Chạy frontend               | `npm run dev --prefix client`                        | Mở trình duyệt theo URL Vite                      |

### Tài khoản demo (từ `server/prisma/seed.js`)

| Vai trò            | Email                                     | Mật khẩu      |
| ------------------ | ----------------------------------------- | ------------- |
| Admin              | `admin@gmail.com`                         | `MatKhau@123` |
| Nhân viên bán hàng | `staff@gmail.com`                         | `MatKhau@123` |
| Khách hàng         | `customer1@gmail.com` (và `customer2..N`) | `MatKhau@123` |

---

## PHẦN A — LUỒNG KHÁCH HÀNG MUA HÀNG (5 phút)

### A1. Duyệt & tìm sản phẩm

1. Mở trang chủ (`/`): xem banner, bộ sưu tập (`/bo-suu-tap`).
2. Vào danh sách sản phẩm (`/san-pham`), demo **lọc** theo danh mục/thương hiệu/giá, **sắp xếp** giá tăng dần.
3. Tìm kiếm từ khóa tại `/tim-kiem`.

### A2. Xem chi tiết & chọn biến thể

1. Mở chi tiết sản phẩm (`/san-pham/:slug`).
2. **Chọn biến thể màu + size** — quan sát giá và tồn kho thay đổi theo biến thể; các lựa chọn hết hàng bị khóa.
3. Thêm vào giỏ hàng.

### A3. Giỏ hàng

1. Vào `/gio-hang`, kiểm tra sản phẩm vừa thêm.
2. (Khách vãng lai) giỏ lưu ở `localStorage`; đăng nhập sau khi thêm → chứng minh **đồng bộ giỏ local ↔ server** (cần đăng nhập trước khi thanh toán).

### A4. Checkout & đặt hàng

1. Vào `/thanh-toan`, điền thông tin giao hàng (tên, SĐT, tỉnh/quận/phường).
2. Quan sát **phí vận chuyển thay đổi theo tỉnh và trọng lượng**.
3. Chọn **COD** (hoặc chuyển khoản) → đặt hàng.
4. Quan sát: đơn được tạo, **email xác nhận đơn** được gửi (kiểm tra hộp thư), hóa đơn tự sinh.

> **Điểm nhấn kỹ thuật:** tạo đơn chạy trong **transaction** — cùng lúc tạo order + orderitems + invoice + giảm tồn kho + tạo vận đơn GHN mô phỏng.

### A5. Theo dõi vận đơn (không cần đăng nhập)

1. Lấy **mã vận đơn** (SN + 10 số) từ email hoặc trang đơn hàng.
2. Vào `/tra-cuu-don`, nhập mã → xem **timeline trạng thái GHN** (Đã tiếp nhận → Đã lấy hàng → Đang vận chuyển → Đang giao → Giao thành công) tự cập nhật theo thời gian.

---

## PHẦN B — LUỒNG QUẢN TRỊ XỬ LÝ ĐƠN (5 phút)

> Đăng xuất tài khoản khách, đăng nhập **`staff@gmail.com`** (hoặc admin).

### B1. Dashboard

1. Vào `/management/dashboard`: xem thống kê doanh thu, số đơn, khách hàng mới, sản phẩm bán chạy.

### B2. Xử lý đơn hàng

1. Vào `/management/orders`, lọc đơn theo trạng thái **Processing**.
2. Mở đơn vừa tạo ở phần A → xem chi tiết sản phẩm, tổng tiền, phí ship, thanh toán.
3. **Cập nhật trạng thái**: Processing → Shipping (đánh dấu xuất kho) → **Delivered** (giao thành công).
   - Quan sát: khi chuyển **Delivered**, hóa đơn chuyển `Completed`, thanh toán **COD** tự chuyển `Paid`, **email thông báo trạng thái** được gửi cho khách.

### B3. Quản lý tồn kho

1. Vào `/management/stocks`: kiểm tra tồn kho biến thể đã bán ở phần A (đã bị trừ).
2. Demo **nhập kho** `/management/stocks/create` (tăng tồn kho, ghi `stockmovements` type IN).

### B4. (Tùy chọn) Quản lý sản phẩm / coupon / phân quyền

- Tạo/sửa sản phẩm, tạo coupon, gán quyền cho user — chứng minh module quản trị & RBAC.

---

## PHẦN C — LUỒNG NHẬP HÀNG TỪ NHÀ CUNG CẤP (3 phút)

### C1. Tạo phiếu nhập

1. Vào `/management/purchase/create`: chọn nhà cung cấp, chọn biến thể, nhập số lượng + giá vốn (`unit_cost_price`), lưu → phiếu nhập ở trạng thái **PENDING**.

### C2. Nhập kho

1. Vào `/management/purchase`, mở phiếu vừa tạo.
2. Thực hiện nhập kho → tồn kho tăng, phiếu chuyển **RECEIVED**, `stockmovements` ghi type **IN**.

> **Điểm nhấn:** quy trình bán hàng và nhập hàng cùng chạy qua **bảng `stockmovements`** (sổ kho), đảm bảo truy vết mọi biến động tồn kho.

---

## PHẦN D — TÍNH NĂNG MỚI: CHƯƠNG TRÌNH THÀNH VIÊN & TÍCH ĐIỂM (3 phút)

### D1. Quản trị cấu hình (admin)

1. `/management/loyalty/tiers`: xem/sửa **hạng thành viên** (Silver, Gold...) với ngưỡng chi tiêu, % ưu đãi.
2. `/management/loyalty/rewards`: xem/sửa **quà đổi bằng điểm**.
3. `/management/loyalty/settings`: xem **cấu hình key–value**.
4. `/management/loyalty/users`: xem điểm và hạng của từng khách hàng.

### D2. Trải nghiệm khách hàng

1. Đăng nhập tài khoản khách → vào `/tai-khoan/thanh-vien` xem **điểm hiện có, hạng, lịch sử giao dịch điểm**.
2. (Nếu có sẵn dữ liệu) demo đổi điểm lấy quà/coupon.

---

## BẢNG GHI CHÚ KỸ THUẬT (hỏi đáp hội đồng)

| Câu hỏi thường gặp                         | Gợi ý trả lời                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Vì sao phí ship thay đổi theo tỉnh?        | `ghnSimulator.service.js` tính phí theo vùng + cân nặng + phí COD/bảo hiểm                                                  |
| Vận đơn có thật không?                     | Mô phỏng GHN: sinh mã `SN…`, timeline tiến theo thời gian (`syncShipmentState`) — không nối API thật                        |
| Đặt hàng rồi hết hàng giữa chừng thì sao?  | Transaction đảm bảo nguyên tử — lỗi thì rollback toàn bộ                                                                    |
| Vì sao có cả `payment_status` và `status`? | Trạng thái đơn và trạng thái thanh toán biến đổi độc lập (vd Delivered nhưng COD chưa thu)                                  |
| Điểm thưởng tính thế nào?                  | `users.total_spent` tích lũy → đối chiếu ngưỡng `membership_tiers.min_spent` → nâng hạng; điểm ghi vào `point_transactions` |
| Cơ chế phân quyền?                         | RBAC: `users → roles → permissions`, thêm quyền trực tiếp; middleware `verifyToken` + `checkPermission`                     |

---

## LƯU Ý KHI DEMO

1. **Chạy seed trước** để có dữ liệu; nếu demo COD cần kiểm tra email thật hoạt động (cấu hình SMTP trong `.env`).
2. Trạng thái vận đơn tiến theo **thời gian thực** (giờ trôi qua) — nếu muốn thấy "Giao thành công" ngay, chọn vùng gần (`same`) hoặc chờ vài giờ.
3. Luôn **đăng xuất/đăng nhập đúng vai trò** (khách / staff / admin) để minh họa phân quyền.
4. Nếu hệ thống đã chạy, có thể skip phần C để giữ trong khung thời gian.
