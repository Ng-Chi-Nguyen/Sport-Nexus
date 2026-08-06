// Dữ liệu vùng cước giả lập (mô phỏng GHN).
// Cửa hàng đặt tại Hà Nội. Tỉnh người nhận được xếp vào 1 trong các vùng:
//   same    -> cùng tỉnh (Hà Nội)
//   north   -> các tỉnh khu vực Bắc Bộ (trừ Hà Nội)
//   central -> các tỉnh miền Trung + Tây Nguyên
//   south   -> các tỉnh phía Nam
export const SHOP_PROVINCE = "Hà Nội";

// Cước cơ bản theo vùng (đơn vị: VNĐ)
export const REGION_BASE_FEE = {
  same: 20000,
  north: 25000,
  central: 30000,
  south: 40000,
};

// Số ngày giao dự kiến theo vùng: { FAST: N, ECONOMY: N }
export const REGION_ESTIMATE_DAYS = {
  same: { FAST: 1, ECONOMY: 2 },
  north: { FAST: 1, ECONOMY: 2 },
  central: { FAST: 2, ECONOMY: 3 },
  south: { FAST: 3, ECONOMY: 4 },
};

// Các nấc cước theo khối lượng (max = gram, fee = VNĐ, chưa gồm cước vùng).
// Ngoài nấc cuối (10kg) cộng thêm phụ phí từng kg.
export const WEIGHT_TIERS = [
  { max: 500, fee: 0 },
  { max: 1000, fee: 7000 },
  { max: 2000, fee: 16000 },
  { max: 5000, fee: 30000 },
  { max: 10000, fee: 55000 },
];

export const EXTRA_KG_FEE = 5000; // phụ phí mỗi kg vượt 10kg

// Tỷ lệ phí dịch vụ
export const ECONOMY_DISCOUNT = 0.85; // ECONOMY giảm 15% cước vận chuyển
export const COD_FEE_RATE = 0.02; // 2% số tiền thu hộ
export const COD_FEE_MIN = 5000; // tối thiểu 5.000đ
export const INSURANCE_FEE_RATE = 0.005; // 0.5% giá trị hàng

// Chuẩn hoá chuỗi: lowercase, bỏ dấu, bỏ tiền tố loại đơn vị hành chính
export const normalizeProvince = (name = "") =>
  String(name)
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(thanh pho|tp|tinh|quan|huyen|xa)\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

// Danh sách tỉnh theo vùng (chuẩn hoá theo normalizeProvince)
const REGION_KEYWORDS = {
  north: [
    "ha giang", "cao bang", "lao cai", "bac kan", "lang son", "tuyen quang",
    "thai nguyen", "phu tho", "yen bai", "son la", "lai chau", "dien bien",
    "hoa binh", "bac giang", "quang ninh", "hai phong", "hung yen",
    "thai binh", "ha nam", "nam dinh", "ninh binh", "vinh phuc",
    "bac ninh", "hai duong",
  ],
  central: [
    "thanh hoa", "nghe an", "ha tinh", "quang binh", "quang tri",
    "thua thien hue", "da nang", "quang nam", "quang ngai", "binh dinh",
    "phu yen", "khanh hoa", "ninh thuan", "binh thuan", "kon tum",
    "gia lai", "dak lak", "dak nong", "lam dong",
  ],
  south: [
    "ho chi minh", "ba ria vung tau", "binh duong", "binh phuoc", "dong nai",
    "tay ninh", "long an", "tien giang", "ben tre", "tra vinh", "vinh long",
    "dong thap", "an giang", "kien giang", "ca mau", "bac lieu",
    "soc trang", "hau giang", "can tho",
  ],
};

// Tìm vùng của 1 tỉnh theo tên. Mặc định "south" nếu không khớp (vùng xa nhất).
export const resolveZone = (provinceName = "") => {
  const key = normalizeProvince(provinceName);
  if (!key) return "south";

  if (key === normalizeProvince(SHOP_PROVINCE)) return "same";

  for (const [zone, list] of Object.entries(REGION_KEYWORDS)) {
    const matched = list.some(
      (k) => key.includes(k) || (k.length > 3 && k.includes(key)),
    );
    if (matched) return zone;
  }

  return "south";
};