// @ts-nocheck

export const brandColumns = [
  { header: 'Tên thương hiệu', key: 'name', width: 30 },
  { header: 'Xuất xứ', key: 'origin', width: 25 },
];

export const supplierColumns = [
  { header: 'Người liên hệ', key: 'contact_person', width: 24 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Số điện thoại', key: 'phone', width: 18 },
  { header: 'Tên nhà cung cấp', key: 'name', width: 30 },
  { header: 'Thông tin địa chỉ', key: 'location_data', width: 40 },
];

export const userColumns = [
  { header: 'Họ tên', key: 'full_name', width: 28 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Mật khẩu', key: 'password', width: 24 },
  { header: 'Số điện thoại', key: 'phone_number', width: 18 },
  { header: 'Vai trò', key: 'role_name', width: 20 },
  { header: 'Trạng thái', key: 'status', width: 16 },
  { header: 'Đã xác minh', key: 'is_verified', width: 14 },
];

export const attributeKeyColumns = [
  { header: 'Tên thuộc tính', key: 'name', width: 28 },
  { header: 'Đơn vị', key: 'unit', width: 18 },
];

export const productAttributeKeyColumns = [
  { header: 'ID sản phẩm', key: 'product_id', width: 14 },
  { header: 'ID thuộc tính', key: 'attribute_key_id', width: 14 },
];

export const PRODUCT_STATUS_LABELS = ['Hoạt động', 'Ngừng'];

export const productColumns = [
  { header: 'Sản phẩm', key: 'name', width: 30 },
  { header: 'Giá gốc', key: 'base_price', width: 14, numFmt: '#,##0' },
  { header: 'Mô tả', key: 'description', width: 38 },
  { header: 'Trạng thái', key: 'is_active', width: 14 },
  { header: 'Danh mục', key: 'category_name', width: 24 },
  { header: 'Nhà cung cấp', key: 'supplier_name', width: 24 },
  { header: 'Thương hiệu', key: 'brand_name', width: 24 },
];

export const productVariantColumns = [
  { header: 'Sản phẩm', key: 'product_name', width: 30 },
  { header: 'Tồn kho', key: 'stock', width: 12 },
  { header: 'Giá bán', key: 'price', width: 14, numFmt: '#,##0' },
  { header: 'Thuộc tính', key: 'attributes_text', width: 50 },
];

export const DISCOUNT_TYPE_LABELS = ['Tiền mặt', 'Phần trăm'];
export const DISCOUNT_TYPE_MAP = { 'Tiền mặt': 'CASH', 'Phần trăm': 'PERCENTAGE' };
export const DISCOUNT_TYPE_REVERSE_MAP = { 'CASH': 'Tiền mặt', 'PERCENTAGE': 'Phần trăm' };
export const BOOLEAN_LABELS = ['Có', 'Không'];

export const couponColumns = [
  { header: 'Mã code', key: 'code', width: 16 },
  { header: 'Loại giảm giá', key: 'discount_type', width: 18 },
  { header: 'Giá trị giảm', key: 'discount_value', width: 14, numFmt: '#,##0₫' },
  { header: 'Giảm tối đa', key: 'max_discount', width: 14, numFmt: '#,##0₫' },
  { header: 'Đơn tối thiểu', key: 'min_order_value', width: 14, numFmt: '#,##0₫' },
  { header: 'Ngày bắt đầu', key: 'start_date', width: 18 },
  { header: 'Ngày kết thúc', key: 'end_date', width: 18 },
  { header: 'Giới hạn dùng', key: 'usage_limit', width: 14 },
  { header: 'Kích hoạt', key: 'is_active', width: 14 },
];

export const STATUS_LABELS = ['Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy', 'Đã hoàn tiền'];
export const STATUS_MAP = { 'Đang xử lý': 'Processing', 'Đang giao': 'Shipping', 'Đã giao': 'Delivered', 'Đã hủy': 'Cancelled', 'Đã hoàn tiền': 'Refunded' };
export const STATUS_REVERSE_MAP = { Processing: 'Đang xử lý', Shipping: 'Đang giao', Delivered: 'Đã giao', Cancelled: 'Đã hủy', Refunded: 'Đã hoàn tiền' };

export const PAYMENT_METHOD_LABELS = ['COD', 'CHUYỂN KHOẢN', 'MOMO', 'VNPAY', 'THẺ TÍN DỤNG'];
export const PAYMENT_METHOD_MAP = { 'COD': 'COD', 'CHUYỂN KHOẢN': 'BANK_TRANSFER', 'MOMO': 'MOMO', 'VNPAY': 'VNPAY', 'THẺ TÍN DỤNG': 'CREDIT_CARD' };
export const PAYMENT_METHOD_REVERSE_MAP = { 'COD': 'COD', 'BANK_TRANSFER': 'CHUYỂN KHOẢN', 'MOMO': 'MOMO', 'VNPAY': 'VNPAY', 'CREDIT_CARD': 'THẺ TÍN DỤNG' };

export const PAYMENT_STATUS_LABELS = ['Chờ thanh toán', 'Đã thanh toán', 'Thất bại', 'Đã hoàn tiền'];
export const PAYMENT_STATUS_MAP = { 'Chờ thanh toán': 'Pending', 'Đã thanh toán': 'Paid', 'Thất bại': 'Failed', 'Đã hoàn tiền': 'Refunded' };
export const PAYMENT_STATUS_REVERSE_MAP = { 'Pending': 'Chờ thanh toán', 'Paid': 'Đã thanh toán', 'Failed': 'Thất bại', 'Refunded': 'Đã hoàn tiền' };

export const orderColumns = [
  { header: 'Mã tham chiếu', key: 'ref_code', width: 20 },
  { header: 'Mã coupon', key: 'coupon_code', width: 18 },
  { header: 'Trạng thái', key: 'status', width: 18 },
  { header: 'Phương thức thanh toán', key: 'payment_method', width: 22 },
  { header: 'Trạng thái thanh toán', key: 'payment_status', width: 20 },
  { header: 'Địa chỉ giao hàng', key: 'shipping_address', width: 40 },
  { header: 'Email khách hàng', key: 'user_email', width: 28 },
];

export const orderItemColumns = [
  { header: 'Mã tham chiếu đơn', key: 'order_ref_code', width: 20 },
  { header: 'Tên sản phẩm', key: 'product_name', width: 30 },
  { header: 'Thuộc tính biến thể', key: 'variant_attributes', width: 38 },
  { header: 'Số lượng', key: 'quantity', width: 12 },
  { header: 'Giá mua', key: 'price_at_purchase', width: 14, numFmt: '#,##0₫' },
];

export const PO_STATUS_LABELS = ['Đang chờ', 'Đã nhận', 'Nhận một phần', 'Đã hủy'];
export const PO_STATUS_MAP = { 'Đang chờ': 'PENDING', 'Đã nhận': 'RECEIVED', 'Nhận một phần': 'PARTIALLY_RECEIVED', 'Đã hủy': 'CANCELLED' };
export const PO_STATUS_REVERSE_MAP = { PENDING: 'Đang chờ', RECEIVED: 'Đã nhận', PARTIALLY_RECEIVED: 'Nhận một phần', CANCELLED: 'Đã hủy' };

export const purchaseOrderColumns = [
  { header: 'Mã tham chiếu', key: 'ref_code', width: 20 },
  { header: 'Tên nhà cung cấp', key: 'supplier_name', width: 24 },
  { header: 'Ngày giao dự kiến', key: 'expected_delivery_date', width: 18 },
  { header: 'Tổng chi phí', key: 'total_cost', width: 14, numFmt: '#,##0₫' },
  { header: 'Trạng thái', key: 'status', width: 18 },
];

export const purchaseOrderItemColumns = [
  { header: 'Mã tham chiếu phiếu', key: 'purchase_order_ref_code', width: 22 },
  { header: 'Biến thể', key: 'product_variant', width: 50 },
  { header: 'Số lượng', key: 'quantity', width: 12 },
  { header: 'Đơn giá nhập', key: 'unit_cost_price', width: 14, numFmt: '#,##0₫' },
];

export const STOCK_TYPE_LABELS = ['Nhập kho', 'Xuất kho', 'Điều chỉnh'];
export const STOCK_TYPE_MAP = { 'Nhập kho': 'IN', 'Xuất kho': 'OUT', 'Điều chỉnh': 'ADJUSTMENT' };
export const STOCK_TYPE_REVERSE_MAP = { IN: 'Nhập kho', OUT: 'Xuất kho', ADJUSTMENT: 'Điều chỉnh' };

export const stockMovementColumns = [
  { header: 'Sản phẩm', key: 'product_variant', width: 40 },
  { header: 'Loại', key: 'type', width: 16 },
  { header: 'Số lượng', key: 'quantity_change', width: 12 },
  { header: 'Tham chiếu', key: 'reference_code', width: 20 },
  { header: 'Lý do', key: 'reason', width: 30 },
];

export const categoryColumns = [
  { header: 'Tên danh mục', key: 'name', width: 30 },
  { header: 'Slug', key: 'slug', width: 28 },
  { header: 'ID danh mục cha', key: 'parent_id', width: 16 },
  { header: 'Mô tả', key: 'description', width: 40 },
  { header: 'Hình ảnh', key: 'image', width: 40 },
];
