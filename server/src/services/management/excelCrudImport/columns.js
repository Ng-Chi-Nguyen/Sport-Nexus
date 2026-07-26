// @ts-nocheck

export const brandColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Tên thương hiệu', key: 'name', width: 30 },
  { header: 'Xuất xứ', key: 'origin', width: 20 },
  { header: 'Logo', key: 'logo', width: 40 },
];

export const supplierColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Người liên hệ', key: 'contact_person', width: 24 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Số điện thoại', key: 'phone', width: 18 },
  { header: 'Tên nhà cung cấp', key: 'name', width: 30 },
  { header: 'Thông tin địa chỉ', key: 'location_data', width: 40 },
  { header: 'Logo', key: 'logo_url', width: 40 },
];

export const userColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Họ tên', key: 'full_name', width: 28 },
  { header: 'Email', key: 'email', width: 28 },
  { header: 'Mật khẩu', key: 'password', width: 24 },
  { header: 'Số điện thoại', key: 'phone_number', width: 18 },
  { header: 'ID vai trò', key: 'role_id', width: 14 },
  { header: 'Trạng thái', key: 'status', width: 14 },
  { header: 'Đã xác minh', key: 'is_verified', width: 14 },
  { header: 'Avatar', key: 'avatar', width: 40 },
];

export const attributeKeyColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Tên thuộc tính', key: 'name', width: 28 },
  { header: 'Đơn vị', key: 'unit', width: 18 },
];

export const productAttributeKeyColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'ID sản phẩm', key: 'product_id', width: 14 },
  { header: 'ID thuộc tính', key: 'attribute_key_id', width: 14 },
];

export const productColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Tên sản phẩm', key: 'name', width: 30 },
  { header: 'Giá gốc', key: 'base_price', width: 14 },
  { header: 'Mô tả', key: 'description', width: 38 },
  { header: 'Trạng thái', key: 'is_active', width: 14 },
  { header: 'Ảnh thumbnail', key: 'thumbnail', width: 40 },
  { header: 'ID danh mục', key: 'category_id', width: 14 },
  { header: 'ID nhà cung cấp', key: 'supplier_id', width: 14 },
  { header: 'ID thương hiệu', key: 'brand_id', width: 14 },
  { header: 'Slug', key: 'slug', width: 28 },
];

export const productVariantColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'ID sản phẩm', key: 'product_id', width: 14 },
  { header: 'Tồn kho', key: 'stock', width: 12 },
  { header: 'Giá bán', key: 'price', width: 14 },
  { header: 'Thuộc tính JSON', key: 'attributes_json', width: 50 },
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
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Mã tham chiếu', key: 'ref_code', width: 20 },
  { header: 'Tổng tiền', key: 'total_amount', width: 14, numFmt: '#,##0₫' },
  { header: 'Giảm giá', key: 'discount_amount', width: 14, numFmt: '#,##0₫' },
  { header: 'Thành tiền cuối', key: 'final_amount', width: 14, numFmt: '#,##0₫' },
  { header: 'Mã coupon', key: 'coupon_code', width: 18 },
  { header: 'Trạng thái', key: 'status', width: 18, validation: { type: 'list', formulae: [`"${STATUS_LABELS.join(',')}"`], allowBlank: true } },
  { header: 'Phương thức thanh toán', key: 'payment_method', width: 22, validation: { type: 'list', formulae: [`"${PAYMENT_METHOD_LABELS.join(',')}"`], allowBlank: true } },
  { header: 'Trạng thái thanh toán', key: 'payment_status', width: 20, validation: { type: 'list', formulae: [`"${PAYMENT_STATUS_LABELS.join(',')}"`], allowBlank: true } },
  { header: 'Địa chỉ giao hàng', key: 'shipping_address', width: 40 },
  { header: 'Email khách hàng', key: 'user_email', width: 28 },
];

export const orderItemColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Mã tham chiếu đơn', key: 'order_ref_code', width: 20 },
  { header: 'Tên sản phẩm', key: 'product_name', width: 30 },
  { header: 'Thuộc tính biến thể', key: 'variant_attributes', width: 38 },
  { header: 'Số lượng', key: 'quantity', width: 12 },
  { header: 'Giá mua', key: 'price_at_purchase', width: 14, numFmt: '#,##0₫' },
];

export const purchaseOrderColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Mã tham chiếu', key: 'ref_code', width: 20 },
  { header: 'ID nhà cung cấp', key: 'supplier_id', width: 14 },
  { header: 'Ngày giao dự kiến', key: 'expected_delivery_date', width: 18 },
  { header: 'Tổng chi phí', key: 'total_cost', width: 14, numFmt: '#,##0₫' },
  { header: 'Trạng thái', key: 'status', width: 18 },
];

export const purchaseOrderItemColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Mã tham chiếu phiếu', key: 'purchase_order_ref_code', width: 22 },
  { header: 'ID biến thể', key: 'product_variant_id', width: 14 },
  { header: 'Số lượng', key: 'quantity', width: 12 },
  { header: 'Đơn giá nhập', key: 'unit_cost_price', width: 14, numFmt: '#,##0₫' },
];

export const categoryColumns = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Tên danh mục', key: 'name', width: 30 },
  { header: 'Slug', key: 'slug', width: 28 },
  { header: 'ID danh mục cha', key: 'parent_id', width: 16 },
  { header: 'Mô tả', key: 'description', width: 40 },
  { header: 'Hình ảnh', key: 'image', width: 40 },
];
