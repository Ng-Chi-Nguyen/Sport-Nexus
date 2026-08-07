// FAQ trả lời cố định cho khách hàng. Key đã được bỏ dấu, so khớp chứa keyword.
export const FAQS = [
    {
        keywords: [
            "giao hang",
            "van chuyen",
            "nhan hang",
            "bao lau",
            "mat bao lau",
            "van don",
        ],
        reply:
            "📦 **Chính sách giao hàng:**\n\n" +
            "1️⃣ **Phạm vi:** Giao hàng toàn quốc qua đơn vị vận chuyển (mô phỏng GHN).\n" +
            "2️⃣ **Thời gian:** Từ 2 - 5 ngày làm việc tùy khu vực.\n" +
            "3️⃣ **Theo dõi:** Bạn có thể kiểm tra trực tiếp mã vận đơn trong chi tiết đơn hàng cá nhân.",
    },
    {
        keywords: ["doi tra", "hoan tien", "hoan hang", "tra hang", "refund"],
        reply:
            "🔄 **Quy định đổi trả & hoàn tiền:**\n\n" +
            "1️⃣ **Thời hạn:** Trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm lỗi hoặc không đúng mô tả.\n" +
            "2️⃣ **Hoàn tiền:** Khi đơn hàng bị hủy hoặc hoàn trả thành công, tiền sẽ được hoàn về đúng phương thức thanh toán ban đầu của bạn.",
    },
    {
        keywords: [
            "thanh toan",
            "chuyen khoan",
            "cod",
            "momo",
            "vnpay",
            "the tin dung",
            "credit",
        ],
        reply:
            "💳 **Các hình thức thanh toán được hỗ trợ:**\n\n" +
            "• Thanh toán khi nhận hàng (COD)\n" +
            "• Chuyển khoản ngân hàng trực tiếp\n" +
            "• Ví điện tử MoMo\n" +
            "• Cổng thanh toán VNPay\n" +
            "• Thẻ tín dụng / Thẻ ghi nợ quốc tế (Credit/Debit)",
    },
    {
        keywords: [
            "bao hanh",
            "bao mat",
            "hang that",
            "chinh hang",
            "ho tro",
            "lien he",
        ],
        reply:
            "🛡️ **Cam kết & Hỗ trợ:**\n\n" +
            "1️⃣ **Chính hãng:** 100% sản phẩm đều chính hãng, áp dụng chính sách bảo hành chuẩn từ nhà sản xuất.\n" +
            "2️⃣ **Liên hệ:** Nếu cần trợ giúp gấp, vui lòng gửi email hoặc nhắn tin qua trang fanpage chính thức của shop.",
    },
];

// Hướng dẫn dùng chức năng cho admin. Key đã bỏ dấu.
export const ADMIN_GUIDES = [
    {
        keywords: ["them san pham", "tao san pham", "san pham moi"],
        reply:
            "📝 **Hướng dẫn thêm sản phẩm mới:**\n\n" +
            "1️⃣ **Bước 1:** Vào menu *Quản lý* > *Sản phẩm* > Nhấn nút **\"Thêm sản phẩm\"**.\n" +
            "2️⃣ **Bước 2:** Điền đầy đủ thông tin cơ bản (Tên, giá, danh mục, thương hiệu, nhà cung cấp) rồi lưu lại.\n" +
            "3️⃣ **Bước 3:** Vào mục *Sản phẩm chi tiết* để thiết lập các biến thể phân loại cụ thể theo màu sắc và kích thước.",
    },
    {
        keywords: ["tao coupon", "them ma giam", "khuyen mai", "ma giam gia"],
        reply:
            "🎟️ **Hướng dẫn tạo mã giảm giá (Coupon):**\n\n" +
            "1️⃣ **Bước 1:** Vào menu *Quản lý* > *Khuyến mãi* > Nhấn **\"Thêm mã giảm giá\"**.\n" +
            "2️⃣ **Bước 2:** Chọn loại hình giảm giá (Giảm theo tiền mặt hoặc phần trăm %).\n" +
            "3️⃣ **Bước 3:** Thiết lập giá trị giảm tối đa, điều kiện giá trị đơn hàng tối thiểu và khung thời gian hiệu lực.",
    },
    {
        keywords: [
            "nhap hang",
            "phieu nhap",
            "nha cung cap",
            "purchase",
            "ton kho",
        ],
        reply:
            "📦 **Hướng dẫn tạo phiếu nhập kho:**\n\n" +
            "1️⃣ **Bước 1:** Vào menu *Quản lý* > *Nhập hàng* > Nhấn **\"Thêm phiếu nhập\"**.\n" +
            "2️⃣ **Bước 2:** Chọn nhà cung cấp, thêm các biến thể sản phẩm kèm số lượng và đơn giá nhập thực tế rồi lưu.\n" +
            "3️⃣ **Bước 3:** Khi kiểm tra nhận đủ hàng thực tế, cập nhật trạng thái phiếu thành **RECEIVED** để hệ thống tự động cộng dồn tồn kho.",
    },
    {
        keywords: ["phan quyen", "them nguoi dung", "tao user", "role", "vai trò"],
        reply:
            "🔐 **Hướng dẫn phân quyền & quản lý user:**\n\n" +
            "1️⃣ **Quản lý quyền chung:** Truy cập menu *Quản lý* > *Phân quyền*.\n" +
            "2️⃣ **Gán vai trò cho khách hàng:** Truy cập menu *Quản lý* > *Khách hàng* > Chọn tài khoản user cần chỉnh sửa > Nhấn **\"Thêm vai trò & quyền\"** để thiết lập.",
    },
    {
        keywords: ["don hang", "xu ly don", "trang thai don"],
        reply:
            "📋 **Hướng dẫn xử lý đơn hàng:**\n\n" +
            "1️⃣ **Kiểm tra:** Vào menu *Quản lý* > *Đơn hàng* để theo dõi danh sách các đơn mới phát sinh.\n" +
            "2️⃣ **Cập nhật:** Xem chi tiết đơn để thay đổi trạng thái xử lý (Chuẩn bị hàng, Đang giao, Đã giao, Đã hủy) phù hợp với thực tế vận hành.",
    },
];