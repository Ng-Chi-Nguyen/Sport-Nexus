export const ROLE_DEFAULT_PERMISSIONS = {
  admin: [],
  sales_staff: [
    "them-don-hang", "sua-don-hang", "xem-don-hang",
    "them-ma-giam-gia", "sua-ma-giam-gia", "xem-ma-giam-gia",
    "them-danh-gia", "sua-danh-gia", "xem-danh-gia",
    "xem-san-pham", "xem-bien-the-san-pham", "xem-danh-muc", "xem-thuong-hieu",
  ],
  warehouse_manager: [
    "them-san-pham", "sua-san-pham", "xem-san-pham",
    "them-bien-the-san-pham", "sua-bien-the-san-pham", "xem-bien-the-san-pham",
    "them-danh-muc", "sua-danh-muc", "xem-danh-muc",
    "them-thuong-hieu", "sua-thuong-hieu", "xem-thuong-hieu",
    "them-thuoc-tinh", "sua-thuoc-tinh", "xem-thuoc-tinh",
    "them-hinh-anh-san-pham", "sua-hinh-anh-san-pham", "xem-hinh-anh-san-pham",
    "them-nhap-kho-hang", "sua-kho-hang", "xem-kho-hang",
  ],
  purchasing_staff: [
    "them-nha-cung-cap", "sua-nha-cung-cap", "xem-nha-cung-cap",
    "them-phieu-nhap", "sua-phieu-nhap", "xem-phieu-nhap",
    "xem-san-pham", "xem-bien-the-san-pham", "xem-kho-hang",
  ],
  customer: [],
};
