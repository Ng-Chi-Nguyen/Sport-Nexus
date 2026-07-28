import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import { allPermissions } from './data/permissions.js';

const prisma = new PrismaClient();

// ======================== HELPER DATA ========================
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Tô', 'Hà', 'Mai', 'Đinh', 'Trịnh', 'Cao', 'Lâm', 'Kiều', 'Tạ'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Hữu', 'Công', 'Minh', 'Quốc', 'Xuân', 'Đức', 'Ngọc', 'Mỹ', 'Hoàng', 'Gia', 'Bảo', 'Tuấn', 'Anh', 'Huy', 'Kim', 'Thanh', 'Hồng', 'Đình'];
const FIRST_NAMES_M = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Tuấn', 'Tú', 'Đạt', 'Hiếu', 'Phong', 'Long', 'Sơn', 'Lâm', 'Huy', 'Khang', 'Khoa', 'Nam', 'Thành', 'Trung', 'Đức', 'Hải', 'Minh', 'Quân', 'Dương', 'Khánh', 'Phước', 'Tài', 'Trí', 'Vinh', 'Phú', 'Tiến', 'Luân', 'Nhân', 'Tín', 'Lộc', 'Thịnh', 'Cảnh', 'Thắng', 'Hoàn', 'Bằng'];
const FIRST_NAMES_F = ['Mai', 'Lan', 'Hương', 'Thảo', 'Trang', 'Linh', 'Ngọc', 'Hà', 'Vân', 'Anh', 'Hạnh', 'Phương', 'Duyên', 'Nhung', 'Oanh', 'Yến', 'Nga', 'Thu', 'Hiền', 'Thúy', 'Tuyết', 'Quỳnh', 'Như', 'Mỹ', 'Hằng', 'Giang', 'Châu', 'Diễm', 'Thùy', 'Loan', 'Trinh', 'Liên', 'Đào', 'Ánh', 'Nhi', 'My', 'Tiên', 'Kiều', 'Hồng', 'Sương'];

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương', 'Khánh Hòa', 'Nghệ An', 'An Giang', 'Tiền Giang', 'Thừa Thiên Huế', 'Quảng Nam', 'Lâm Đồng', 'Bà Rịa - Vũng Tàu', 'Long An', 'Kiên Giang', 'Đắk Lắk', 'Bình Định', 'Quảng Ninh'];
const DISTRICTS = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Quận Thủ Đức', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Ba Đình', 'Thanh Xuân', 'Hoàng Mai', 'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Ninh Kiều', 'Hồng Bàng', 'Lê Chân', 'Nha Trang', 'Vinh', 'Biên Hòa', 'Buôn Ma Thuột', 'Huế', 'Đà Lạt', 'Vũng Tàu', 'Hội An', 'Hạ Long'];
const WARDS = ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Tân Định', 'Phường Nguyễn Thái Bình', 'Phường Dịch Vọng', 'Phường Trung Hòa', 'Phường Kim Liên', 'Phường Hải Châu I', 'Phường Hòa Thuận', 'Phường Mỹ An', 'Phường Ninh Kiều', 'Phường Cái Khế', 'Phường Vinh Tân', 'Phường Long Hoa', 'Phường 2', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 10'];
const STREETS = ['Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Trần Hưng Đạo', 'Lý Tự Trọng', 'Phạm Ngũ Lão', 'Nguyễn Đình Chiểu', 'Võ Thị Sáu', 'Cách Mạng Tháng 8', 'Lý Thường Kiệt', 'Nguyễn Trãi', 'Hoàng Diệu', 'Quang Trung', 'Lê Duẩn', 'Trường Chinh', 'Nguyễn Văn Cừ', 'Bạch Đằng', 'Hùng Vương', 'Phan Đình Phùng', 'Xô Viết Nghệ Tĩnh', 'Điện Biên Phủ', 'Nam Kỳ Khởi Nghĩa', 'Hoàng Hoa Thám', 'Tôn Đức Thắng', 'Trần Phú', 'Nguyễn Thị Minh Khai', 'Pasteur', 'Hàm Nghi', 'Nguyễn Văn Trỗi', 'Phạm Văn Đồng'];

const REVIEW_COMMENTS = {
  5: [
    'Sản phẩm tuyệt vời, chất lượng rất tốt! Giao hàng nhanh chóng, đóng gói cẩn thận.',
    'Rất hài lòng với sản phẩm. Đúng mô tả, chất lượng vượt ngoài mong đợi.',
    'Chất lượng vượt trội so với giá tiền. Sẽ mua thêm cho gia đình.',
    'Hàng chính hãng, chất lượng tốt. Giao hàng siêu nhanh, sẽ ủng hộ shop tiếp.',
    'Sản phẩm rất đẹp, chất liệu cao cấp. Rất đáng tiền, cảm ơn shop!',
    'Mua lần đầu nhưng rất ưng ý. Shop tư vấn nhiệt tình, giao hàng đúng hẹn.',
    'Đúng hàng chính hãng, giá tốt hơn ngoài cửa hàng. Sẽ mua lại.',
    'Chất lượng quá tốt, shop bán hàng uy tín. Đóng gói rất kỹ lưỡng.',
    'Sản phẩm rất xịn, đúng như quảng cáo. Cảm ơn shop nhiều!',
    'Tuyệt vời! Sẽ giới thiệu cho bạn bè và người thân.',
  ],
  4: [
    'Sản phẩm tốt, nhưng giao hàng hơi chậm so với dự kiến.',
    'Chất lượng ổn, giá cả hợp lý. Đáp ứng được nhu cầu sử dụng.',
    'Dùng tạm ổn, chất lượng khá tốt so với tầm giá.',
    'Hàng đẹp, đúng mẫu. Tiếc là màu sắc hơi khác so với hình chụp.',
    'Chất lượng ok, giao hàng nhanh. Sẽ còn ủng hộ shop.',
    'Sản phẩm dùng tốt, chất liệu bền. Shop nên cải thiện khâu đóng gói.',
    'Rất ổn cho nhu cầu tập luyện cơ bản. Giá hơi cao so với mặt bằng chung.',
    'Mẫu mã đẹp, chất lượng ổn. Giao đúng hàng, đủ số lượng.',
    'Hài lòng với sản phẩm. Shop nên bổ sung thêm nhiều màu sắc hơn.',
    'Chất lượng tốt, nhưng kích thước hơi nhỏ so với tiêu chuẩn.',
  ],
  3: [
    'Sản phẩm bình thường, không có gì đặc biệt. Tạm chấp nhận được.',
    'Chất lượng tạm được so với giá. Cơ bản đáp ứng nhu cầu.',
    'Giao hàng khá lâu, đóng gói sơ sài nhưng may hàng không bị hư.',
    'Sản phẩm trung bình, không quá tệ nhưng cũng không xuất sắc.',
    'Dùng được nhưng không như kỳ vọng. Chất liệu hơi mỏng.',
    'Chất lượng ở mức chấp nhận được. Shop nên kiểm tra kỹ trước khi giao.',
    'Giá hơi cao so với chất lượng thực tế. Cân nhắc trước khi mua.',
    'Sản phẩm ok nhưng không có gì nổi bật. Giao hàng đúng hạn.',
    'Màu sắc thực tế khác một chút so với hình online. Nhìn chung tạm ổn.',
    'Size không chuẩn lắm, nên mua lớn hơn 1 size. Chất lượng tạm ổn.',
  ],
  2: [
    'Chất lượng không như quảng cáo. Hơi thất vọng.',
    'Sản phẩm nhận được có vết xước nhỏ. Shop cần kiểm tra kỹ hơn.',
    'Không giống với mô tả lắm. Chất liệu không được như kỳ vọng.',
    'Giao thiếu phụ kiện, phải liên hệ lại shop để gửi bổ sung.',
    'Sản phẩm dùng được nhưng nhanh hỏng hơn tưởng tượng.',
    'Kích thước không đúng, nên mua lớn hơn. Đổi trả hơi mất công.',
    'Giá thành cao nhưng chất lượng không tương xứng. Không hài lòng lắm.',
    'Hàng giao đến bị móp hộp, bên trong cũng xây xát nhẹ.',
    'Chất lượng gia công chưa tốt, còn chỉ thừa và đường may lỗi.',
    'Màu sắc phai sau vài lần sử dụng. Không được như quảng cáo.',
  ],
  1: [
    'Sản phẩm kém chất lượng, không nên mua. Rất thất vọng!',
    'Rất thất vọng, nhận hàng bị lỗi nặng. Shop không kiểm tra hàng trước khi giao.',
    'Không như mô tả, chất lượng quá kém. Yêu cầu được trả hàng hoàn tiền.',
    'Sản phẩm dởm, không đáng đồng tiền. Lãng phí tiền bạc.',
    'Chất lượng tệ nhất từng mua. Shop bán hàng kém uy tín.',
    'Hàng giả, không phải chính hãng như quảng cáo. Rất bức xúc!',
    'Sản phẩm bị hỏng ngay sau 2 lần sử dụng. Mất niềm tin vào shop.',
    'Không giống hình chụp, màu sắc lệch hoàn toàn. Giao hàng chậm trễ.',
    'Chất lượng rất tệ, shop không hề kiểm tra hàng. Sẽ không mua lại.',
    'Phí phạm tiền. Sản phẩm không đạt chuẩn, gia công cẩu thả.',
  ],
};
const ADDRESS_TYPES = ['NHÀ', 'VĂN PHÒNG', 'KHO', 'CỬA HÀNG'];

// ======================== HELPER FUNCTIONS ========================
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(n, arr) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generatePhone(idx) {
  return `09${String(60000000 + idx).slice(0, 8)}`;
}

function slugName(name) {
  return slugify(name, { lower: true, strict: true }).replace(/-+/g, '');
}

function generateEmail(name, idx) {
  return `${slugName(name)}${idx}@gmail.com`;
}

async function concurrentMap(items, fn, concurrency = 30) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((item, j) => fn(item, i + j)));
    results.push(...batchResults);
  }
  return results;
}

// ======================== MAIN ========================
async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu...\n');

  // ======================== XÓA DỮ LIỆU CŨ ========================
  console.log('🗑️  Xóa dữ liệu cũ...');
  await prisma.systemLogs.deleteMany();
  await prisma.purchaseOrderItems.deleteMany();
  await prisma.purchaseOrders.deleteMany();
  await prisma.stockMovements.deleteMany();
  await prisma.cartItems.deleteMany();
  await prisma.carts.deleteMany();
  await prisma.reviews.deleteMany();
  await prisma.orderItems.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.variableAttributes.deleteMany();
  await prisma.productVariants.deleteMany();
  await prisma.productImages.deleteMany();
  await prisma.products.deleteMany();
  await prisma.userAddresses.deleteMany();
  await prisma.coupons.deleteMany();
  await prisma.users.deleteMany();
  await prisma.permissions.deleteMany();
  await prisma.attributeKeys.deleteMany();
  await prisma.brands.deleteMany();
  await prisma.suppliers.deleteMany();
  await prisma.categories.deleteMany();

  // ======================== 1. PERMISSIONS & ROLES ========================
  console.log('🛡️  Tạo permissions...');
  await prisma.permissions.createMany({ data: allPermissions });
  const allPerms = await prisma.permissions.findMany();

  const adminRole = await prisma.roles.findUnique({ where: { slug: 'admin' } });
  const staffRole = await prisma.roles.findUnique({ where: { slug: 'staff' } });
  const customerRole = await prisma.roles.findUnique({ where: { slug: 'customer' } });
  if (!adminRole || !staffRole || !customerRole) {
    throw new Error('Roles (admin, staff, customer) chưa được tạo. Vui lòng tạo roles trước.');
  }
  await prisma.roles.update({
    where: { id: adminRole.id },
    data: { permissions: { set: allPerms.map((p) => ({ id: p.id })) } },
  });
  await prisma.roles.update({
    where: { id: staffRole.id },
    data: { permissions: { set: allPerms.map((p) => ({ id: p.id })) } },
  });

  // ======================== 2. USERS (10000+) ========================
  console.log('👤 Tạo 10002 users...');
  const hashedPassword = await bcrypt.hash('MatKhau@123', 10);

  const userAdmin = await prisma.users.create({
    data: {
      full_name: 'Nguyễn Văn Admin', email: 'admin@gmail.com',
      phone_number: generatePhone(1), password: hashedPassword,
      is_verified: true, status: true, role_id: adminRole.id,
      created_at: new Date('2025-01-01'),
    },
  });
  const userStaff = await prisma.users.create({
    data: {
      full_name: 'Trần Thị Nhân Viên', email: 'staff@gmail.com',
      phone_number: generatePhone(2), password: hashedPassword,
      is_verified: true, status: true, role_id: staffRole.id,
      created_at: new Date('2025-01-01'),
    },
  });
  const userSuperAdmin = await prisma.users.create({
    data: {
      full_name: 'Nguyễn Chí Nguyên', email: 'ngchinguyen2506@gmail.com',
      phone_number: '0900000000', password: await bcrypt.hash('#Nguyen2506', 10),
      is_verified: true, status: true, role_id: adminRole.id,
      created_at: new Date('2025-01-01'),
    },
  });

  const CUSTOMER_COUNT = 10000;
  const CUSTOMER_BATCH = 500;
  const now = Date.now();

  for (let batchStart = 0; batchStart < CUSTOMER_COUNT; batchStart += CUSTOMER_BATCH) {
    const batch = [];
    const batchEnd = Math.min(batchStart + CUSTOMER_BATCH, CUSTOMER_COUNT);

    for (let i = batchStart; i < batchEnd; i++) {
      const idx = i + 4;
      const isMale = Math.random() > 0.5;
      const fullName = `${pick(LAST_NAMES)} ${pick(MIDDLE_NAMES)} ${isMale ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F)}`;
      const daysAgo = Math.floor(Math.random() * 540);
      const createdAt = new Date(now - daysAgo * 86400000 - Math.floor(Math.random() * 86400000));

      batch.push({
        full_name: fullName,
        email: `customer${idx}@gmail.com`,
        phone_number: generatePhone(idx + 100),
        password: hashedPassword,
        is_verified: Math.random() > 0.3,
        status: Math.random() > 0.15,
        role_id: customerRole.id,
        created_at: createdAt,
      });
    }

    await prisma.users.createMany({ data: batch });

    if ((batchStart / CUSTOMER_BATCH + 1) % 4 === 0) {
      console.log(`   ... ${batchStart + CUSTOMER_BATCH} users created`);
    }
  }

  const customers = await prisma.users.findMany({ where: { role_id: customerRole.id } });
  console.log(`   -> ${customers.length} customers created`);

  // ======================== 3. USER ADDRESSES ========================
  console.log('📍 Tạo user addresses...');
  const addressUsers = customers.slice(0, 6000);
  for (let i = 0; i < addressUsers.length; i += 500) {
    const batch = addressUsers.slice(i, i + 500).map((u) => {
      const province = pick(PROVINCES);
      const district = pick(DISTRICTS);
      const ward = pick(WARDS);
      const street = pick(STREETS);
      return {
        recipient_name: u.full_name,
        recipient_phone: u.phone_number || generatePhone(u.id),
        location_data: { province, district, ward },
        detail_address: `${Math.floor(Math.random() * 500) + 1} ${street}, ${ward}`,
        is_default: true,
        type: pick(ADDRESS_TYPES),
        user_id: u.id,
      };
    });
    await prisma.userAddresses.createMany({ data: batch });
  }
  console.log(`   -> ${addressUsers.length} addresses created`);

  // ======================== 4. CATEGORIES ========================
  console.log('📂 Tạo categories...');
  const catNames = ['Bóng đá', 'Cầu lông', 'Bơi lội', 'Gym & Fitness', 'Chạy bộ', 'Tennis', 'Thể thao đồng đội', 'Xe đạp', 'Leo núi', 'Võ thuật'];
  const categories = await Promise.all(
    catNames.map((name) =>
      prisma.categories.create({ data: { name, slug: slugify(name, { lower: true }) } }),
    ),
  );
  const [catBongDa, catCauLong, catBoiLoi, catGym, catChayBo, catTennis, catTTDongDoi, catXeDap, catLeoNui, catVoThuat] = categories;

  // ======================== 5. SUPPLIERS (10) ========================
  console.log('🏭 Tạo 10 suppliers...');
  const supplierInputs = [
    { name: 'Công ty TNHH Thể thao Việt', person: 'Nguyễn Văn Hùng', email: 'hung@thethaoviet.vn', phone: '02839281111', p: 'TP. Hồ Chí Minh', d: 'Quận 1' },
    { name: 'Công ty Cổ phần Sports World', person: 'Trần Minh Tuấn', email: 'tuan@sportsworld.vn', phone: '02438222222', p: 'Hà Nội', d: 'Cầu Giấy' },
    { name: 'Công ty TNHH Dụng cụ thể thao Á Châu', person: 'Lê Hoàng Nam', email: 'nam@asiasports.vn', phone: '02363883333', p: 'Đà Nẵng', d: 'Hải Châu' },
    { name: 'Công ty TNHh Sản xuất Thể thao Đại Việt', person: 'Phạm Quốc Tuấn', email: 'tuandv@dailythethao.vn', phone: '02437224444', p: 'Hà Nội', d: 'Hoàng Mai' },
    { name: 'Tập đoàn Thể thao Quốc tế - chi nhánh Việt Nam', person: 'Nguyễn Hoàng Long', email: 'longnh@idsports.vn', phone: '02838225555', p: 'TP. Hồ Chí Minh', d: 'Quận 7' },
    { name: 'Công ty Cổ phần Phân phối Thể thao Xanh', person: 'Trần Thị Mai Hương', email: 'huongttm@xanh.football', phone: '02363667777', p: 'Đà Nẵng', d: 'Thanh Khê' },
    { name: 'Doanh nghiệp Tư nhân Dụng cụ Thể thao Sài Gòn', person: 'Lê Văn Phước', email: 'phuoclv@saigonsports.vn', phone: '02837338888', p: 'TP. Hồ Chí Minh', d: 'Quận 3' },
    { name: 'Công ty TNHH Thương mại và Dịch vụ SportPro', person: 'Hoàng Minh Đức', email: 'duchm@sportpro.vn', phone: '02435559999', p: 'Hà Nội', d: 'Thanh Xuân' },
    { name: 'Công ty TNHH MTV Thể thao Miền Trung', person: 'Nguyễn Thị Thanh Vân', email: 'vanntt@mientrungsports.vn', phone: '02383440000', p: 'Khánh Hòa', d: 'Nha Trang' },
    { name: 'Công ty Cổ phần Thể thao Đông Dương', person: 'Phan Văn Tài', email: 'taiph@dd-sports.vn', phone: '02743771111', p: 'Đồng Nai', d: 'Biên Hòa' },
  ];
  const suppliers = await Promise.all(
    supplierInputs.map((s) =>
      prisma.suppliers.create({
        data: {
          name: s.name,
          contact_person: s.person,
          email: s.email,
          phone: s.phone,
          location_data: { province: s.p, district: s.d },
        },
      }),
    ),
  );
  const [sup1, sup2, sup3, sup4, sup5, sup6, sup7, sup8, sup9, sup10] = suppliers;

  // ======================== 6. BRANDS ========================
  console.log('🏷️  Tạo brands...');
  const brandInput = [
    { name: 'Nike', origin: 'Hoa Kỳ' },
    { name: 'Adidas', origin: 'Đức' },
    { name: 'Yonex', origin: 'Nhật Bản' },
    { name: 'Wilson', origin: 'Hoa Kỳ' },
    { name: 'Kamito', origin: 'Việt Nam' },
    { name: 'KingSport', origin: 'Việt Nam' },
    { name: 'Speedo', origin: 'Hoa Kỳ' },
    { name: 'Spalding', origin: 'Hoa Kỳ' },
    { name: 'Puma', origin: 'Đức' },
    { name: 'Li-Ning', origin: 'Trung Quốc' },
    { name: 'Mizuno', origin: 'Nhật Bản' },
    { name: 'Under Armour', origin: 'Hoa Kỳ' },
    { name: 'Decathlon', origin: 'Pháp' },
    { name: 'Asics', origin: 'Nhật Bản' },
  ];
  const brands = await Promise.all(brandInput.map((b) => prisma.brands.create({ data: b })));
  const [bNike, bAdidas, bYonex, bWilson, bKamito, bKingSport, bSpeedo, bSpalding, bPuma, bLiNing, bMizuno, bUA, bDecathlon, bAsics] = brands;

  // ======================== 7. ATTRIBUTE KEYS ========================
  console.log('🔑 Tạo attribute keys...');
  const attrSize = await prisma.attributeKeys.create({ data: { name: 'Kích thước', unit: 'cm' } });
  const attrColor = await prisma.attributeKeys.create({ data: { name: 'Màu sắc' } });
  const attrWeight = await prisma.attributeKeys.create({ data: { name: 'Trọng lượng', unit: 'g' } });
  const attrLength = await prisma.attributeKeys.create({ data: { name: 'Chiều dài', unit: 'm' } });

  // ======================== 8. PRODUCTS ========================
  console.log('⚽ Tạo 27 products & 80+ variants...');

  async function createProduct({ cat, sup, brand, name, desc, price, active = true }) {
    return prisma.products.create({
      data: {
        name,
        slug: slugify(name, { lower: true }),
        base_price: price,
        description: desc,
        is_active: active,
        category_id: cat.id,
        supplier_id: sup.id,
        brand_id: brand.id,
      },
    });
  }

  async function createVariant(prod, { stock, price, attrs = [] }) {
    const variant = await prisma.productVariants.create({
      data: { product_id: prod.id, stock, price },
    });
    if (attrs.length > 0) {
      await prisma.variableAttributes.createMany({
        data: attrs.map((a) => ({
          variable_id: variant.id,
          attribute_key_id: a.key.id,
          value: a.value,
        })),
      });
    }
    return variant;
  }

  const allVariants = [];

  // --- P1: Bóng đá Nike Flight ---
  const p1 = await createProduct({ cat: catBongDa, sup: sup1, brand: bNike, name: 'Bóng đá Nike Flight', desc: 'Bóng đá cao cấp Nike Flight với công nghệ Aerowtrack giúp ổn định đường bay. Chất liệu da tổng hợp cao cấp, phù hợp thi đấu chuyên nghiệp.', price: 1550000 });
  allVariants.push(await createVariant(p1, { stock: 50, price: 1550000, attrs: [{ key: attrSize, value: '5' }] }));

  // --- P2: Vợt cầu lông Yonex Astrox 99 Pro ---
  const p2 = await createProduct({ cat: catCauLong, sup: sup2, brand: bYonex, name: 'Vợt cầu lông Yonex Astrox 99 Pro', desc: 'Vợt cầu lông Yonex Astrox 99 Pro - đỉnh cao công nghệ dành cho lối đánh tấn công. Khung vợt Namd cao cấp, độ cứng siêu cao.', price: 4890000 });
  allVariants.push(await createVariant(p2, { stock: 20, price: 4890000, attrs: [{ key: attrWeight, value: '88 (4U)' }] }));
  allVariants.push(await createVariant(p2, { stock: 15, price: 4990000, attrs: [{ key: attrWeight, value: '83 (5U)' }] }));

  // --- P3: Vợt cầu lông Yonex Nanoray 100 ---
  const p3 = await createProduct({ cat: catCauLong, sup: sup2, brand: bYonex, name: 'Vợt cầu lông Yonex Nanoray 100', desc: 'Vợt cầu lông Yonex Nanoray 100 với công nghệ Nanometric giúp vung vợt nhanh hơn, phù hợp lối đánh nhanh và điều cầu.', price: 3290000 });
  allVariants.push(await createVariant(p3, { stock: 20, price: 3290000, attrs: [{ key: attrWeight, value: '85 (4U)' }] }));
  allVariants.push(await createVariant(p3, { stock: 15, price: 3390000, attrs: [{ key: attrWeight, value: '80 (5U)' }] }));

  // --- P4: Kính bơi Speedo Vanquisher ---
  const p4 = await createProduct({ cat: catBoiLoi, sup: sup3, brand: bSpeedo, name: 'Kính bơi Speedo Vanquisher', desc: 'Kính bơi Speedo Vanquisher với công nghệ chống sương mù, gọng kính ôm vừa mắt, dây đeo silicone êm ái.', price: 690000 });
  allVariants.push(await createVariant(p4, { stock: 30, price: 690000, attrs: [{ key: attrColor, value: 'Xanh dương' }] }));
  allVariants.push(await createVariant(p4, { stock: 25, price: 690000, attrs: [{ key: attrColor, value: 'Đen' }] }));

  // --- P5: Dây nhảy Kamito Pro ---
  const p5 = await createProduct({ cat: catGym, sup: sup1, brand: bKamito, name: 'Dây nhảy Kamito Pro', desc: 'Dây nhảy thể thao Kamito Pro với tay cầm chống trượt, dây thép bọc nhựa bền bỉ, có thể điều chỉnh độ dài.', price: 199000 });
  allVariants.push(await createVariant(p5, { stock: 50, price: 199000, attrs: [{ key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p5, { stock: 40, price: 199000, attrs: [{ key: attrColor, value: 'Xanh' }] }));

  // --- P6: Tạ tay KingSport ---
  const p6 = await createProduct({ cat: catGym, sup: sup1, brand: bKingSport, name: 'Tạ tay KingSport Cao su', desc: 'Tạ tay KingSport bọc cao su chống trơn trượt, không gây tiếng ồn khi tập.', price: 249000 });
  allVariants.push(await createVariant(p6, { stock: 40, price: 249000, attrs: [{ key: attrWeight, value: '2000 (2kg)' }] }));
  allVariants.push(await createVariant(p6, { stock: 30, price: 449000, attrs: [{ key: attrWeight, value: '5000 (5kg)' }] }));
  allVariants.push(await createVariant(p6, { stock: 20, price: 749000, attrs: [{ key: attrWeight, value: '10000 (10kg)' }] }));

  // --- P7: Giày chạy bộ Nike Air Zoom Pegasus ---
  const p7 = await createProduct({ cat: catChayBo, sup: sup2, brand: bNike, name: 'Giày chạy bộ Nike Air Zoom Pegasus', desc: 'Giày chạy bộ Nike Air Zoom Pegasus với đệm Zoom Air êm ái, upper lưới thoáng khí.', price: 3290000 });
  allVariants.push(await createVariant(p7, { stock: 25, price: 3290000, attrs: [{ key: attrSize, value: '39' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p7, { stock: 30, price: 3290000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p7, { stock: 28, price: 3290000, attrs: [{ key: attrSize, value: '41' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p7, { stock: 22, price: 3290000, attrs: [{ key: attrSize, value: '42' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p7, { stock: 15, price: 3290000, attrs: [{ key: attrSize, value: '39' }, { key: attrColor, value: 'Trắng' }] }));
  allVariants.push(await createVariant(p7, { stock: 20, price: 3290000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Trắng' }] }));

  // --- P8: Áo thun chạy bộ Adidas Own The Run ---
  const p8 = await createProduct({ cat: catChayBo, sup: sup2, brand: bAdidas, name: 'Áo thun chạy bộ Adidas Own The Run', desc: 'Áo thun chạy bộ Adidas Own The Run với chất liệu vải Climacool thấm hút mồ hôi.', price: 590000 });
  allVariants.push(await createVariant(p8, { stock: 35, price: 590000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Xanh dương' }] }));
  allVariants.push(await createVariant(p8, { stock: 40, price: 590000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Xanh dương' }] }));
  allVariants.push(await createVariant(p8, { stock: 25, price: 590000, attrs: [{ key: attrSize, value: 'XL' }, { key: attrColor, value: 'Xanh dương' }] }));
  allVariants.push(await createVariant(p8, { stock: 30, price: 590000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p8, { stock: 35, price: 590000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Đen' }] }));

  // --- P9: Vợt tennis Wilson Ultra 100 ---
  const p9 = await createProduct({ cat: catTennis, sup: sup3, brand: bWilson, name: 'Vợt tennis Wilson Ultra 100', desc: 'Vợt tennis Wilson Ultra 100 với khung vợt siêu nhẹ, mặt vợt 100 inch².', price: 3800000 });
  allVariants.push(await createVariant(p9, { stock: 15, price: 3800000, attrs: [{ key: attrWeight, value: '300 (G2)' }] }));
  allVariants.push(await createVariant(p9, { stock: 12, price: 3950000, attrs: [{ key: attrWeight, value: '290 (G3)' }] }));

  // --- P10: Bóng rổ Spalding NBA ---
  const p10 = await createProduct({ cat: catTTDongDoi, sup: sup3, brand: bSpalding, name: 'Bóng rổ Spalding NBA', desc: 'Bóng rổ chính thức giải NBA, chất liệu da tổng hợp cao cấp.', price: 890000 });
  allVariants.push(await createVariant(p10, { stock: 35, price: 890000, attrs: [{ key: attrSize, value: '7' }] }));

  // ===== NHÓM SẢN PHẨM MỚI =====

  // --- P11: Giày đá bóng Nike Phantom GX ---
  const p11 = await createProduct({ cat: catBongDa, sup: sup4, brand: bNike, name: 'Giày đá bóng Nike Phantom GX Elite', desc: 'Giày đá bóng Nike Phantom GX Elite dành cho sân cỏ tự nhiên. Công nghệ Gripper giúp kiểm soát bóng tối ưu.', price: 4590000 });
  allVariants.push(await createVariant(p11, { stock: 15, price: 4590000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Xanh' }] }));
  allVariants.push(await createVariant(p11, { stock: 20, price: 4590000, attrs: [{ key: attrSize, value: '41' }, { key: attrColor, value: 'Xanh' }] }));
  allVariants.push(await createVariant(p11, { stock: 18, price: 4590000, attrs: [{ key: attrSize, value: '42' }, { key: attrColor, value: 'Xanh' }] }));
  allVariants.push(await createVariant(p11, { stock: 12, price: 4590000, attrs: [{ key: attrSize, value: '43' }, { key: attrColor, value: 'Xanh' }] }));

  // --- P12: Áo đấu bóng đá Adidas ---
  const p12 = await createProduct({ cat: catBongDa, sup: sup5, brand: bAdidas, name: 'Áo đấu bóng đá Adidas Condivo 22', desc: 'Áo đấu bóng đá Adidas Condivo 22 với chất liệu vải AEROREADY thấm hút mồ hôi, phù hợp thi đấu và tập luyện.', price: 620000 });
  allVariants.push(await createVariant(p12, { stock: 40, price: 620000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đỏ' }] }));
  allVariants.push(await createVariant(p12, { stock: 45, price: 620000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Đỏ' }] }));
  allVariants.push(await createVariant(p12, { stock: 30, price: 620000, attrs: [{ key: attrSize, value: 'XL' }, { key: attrColor, value: 'Đỏ' }] }));
  allVariants.push(await createVariant(p12, { stock: 35, price: 620000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Xanh dương' }] }));
  allVariants.push(await createVariant(p12, { stock: 40, price: 620000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Xanh dương' }] }));

  // --- P13: Ống đồng bảo vệ ống quyển ---
  const p13 = await createProduct({ cat: catBongDa, sup: sup6, brand: bDecathlon, name: 'Ống đồng bảo vệ ống quyển Decathlon', desc: 'Ống đồng bảo vệ ống quyển Decathlon Kipsta F500, chất liệu nhựa cứng, ôm sát chân.', price: 189000 });
  allVariants.push(await createVariant(p13, { stock: 60, price: 189000, attrs: [{ key: attrSize, value: 'S' }] }));
  allVariants.push(await createVariant(p13, { stock: 80, price: 189000, attrs: [{ key: attrSize, value: 'M' }] }));
  allVariants.push(await createVariant(p13, { stock: 70, price: 189000, attrs: [{ key: attrSize, value: 'L' }] }));

  // --- P14: Vợt cầu lông Li-Ning Air Claw ---
  const p14 = await createProduct({ cat: catCauLong, sup: sup7, brand: bLiNing, name: 'Vợt cầu lông Li-Ning Air Claw 200', desc: 'Vợt cầu lông Li-Ning Air Claw 200 với khung vợt carbon lightweight, phù hợp người mới chơi.', price: 1590000 });
  allVariants.push(await createVariant(p14, { stock: 25, price: 1590000, attrs: [{ key: attrWeight, value: '85 (4U)' }] }));
  allVariants.push(await createVariant(p14, { stock: 20, price: 1650000, attrs: [{ key: attrWeight, value: '80 (5U)' }] }));

  // --- P15: Quần short cầu lông Yonex ---
  const p15 = await createProduct({ cat: catCauLong, sup: sup2, brand: bYonex, name: 'Quần short cầu lông Yonex 15512', desc: 'Quần short cầu lông Yonex 15512 vải polyester nhẹ, thoáng khí, co giãn 4 chiều.', price: 350000 });
  allVariants.push(await createVariant(p15, { stock: 35, price: 350000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p15, { stock: 40, price: 350000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p15, { stock: 30, price: 350000, attrs: [{ key: attrSize, value: 'XL' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p15, { stock: 35, price: 350000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Xanh navy' }] }));

  // --- P16: Đồ bơi Speedo ---
  const p16 = await createProduct({ cat: catBoiLoi, sup: sup8, brand: bSpeedo, name: 'Quần bơi nam Speedo Endurance+', desc: 'Quần bơi nam Speedo Endurance+ chất liệu vải Endurance10 bền gấp đôi, chống clo.', price: 550000 });
  allVariants.push(await createVariant(p16, { stock: 30, price: 550000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Xanh navy' }] }));
  allVariants.push(await createVariant(p16, { stock: 35, price: 550000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Xanh navy' }] }));
  allVariants.push(await createVariant(p16, { stock: 25, price: 550000, attrs: [{ key: attrSize, value: 'XL' }, { key: attrColor, value: 'Xanh navy' }] }));

  // --- P17: Áo bơi nữ Speedo ---
  const p17 = await createProduct({ cat: catBoiLoi, sup: sup8, brand: bSpeedo, name: 'Áo bơi nữ Speedo PowerSculpt', desc: 'Áo bơi nữ Speedo PowerSculpt với công nghệ vải PowerSculpt ôm gọn, tôn dáng.', price: 890000 });
  allVariants.push(await createVariant(p17, { stock: 20, price: 890000, attrs: [{ key: attrSize, value: 'S' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p17, { stock: 25, price: 890000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p17, { stock: 20, price: 890000, attrs: [{ key: attrSize, value: 'S' }, { key: attrColor, value: 'Hồng' }] }));
  allVariants.push(await createVariant(p17, { stock: 25, price: 890000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Hồng' }] }));

  // --- P18: Thảm tập yoga KingSport ---
  const p18 = await createProduct({ cat: catGym, sup: sup4, brand: bKingSport, name: 'Thảm tập yoga KingSport 6mm', desc: 'Thảm tập yoga KingSport dày 6mm, chất liệu TPE chống trơn, không mùi.', price: 420000 });
  allVariants.push(await createVariant(p18, { stock: 40, price: 420000, attrs: [{ key: attrLength, value: '173' }, { key: attrColor, value: 'Tím' }] }));
  allVariants.push(await createVariant(p18, { stock: 35, price: 420000, attrs: [{ key: attrLength, value: '173' }, { key: attrColor, value: 'Xanh' }] }));
  allVariants.push(await createVariant(p18, { stock: 30, price: 520000, attrs: [{ key: attrLength, value: '183' }, { key: attrColor, value: 'Tím' }] }));

  // --- P19: Dây kháng lực Kamito ---
  const p19 = await createProduct({ cat: catGym, sup: sup5, brand: bKamito, name: 'Dây kháng lực Kamito 5 mức', desc: 'Bộ dây kháng lực Kamito 5 mức lực từ nhẹ đến nặng, kèm túi đựng, phù hợp tập luyện tại nhà.', price: 280000 });
  allVariants.push(await createVariant(p19, { stock: 45, price: 280000, attrs: [{ key: attrColor, value: 'Xanh dương' }] }));

  // --- P20: Bình nước thể thao KingSport ---
  const p20 = await createProduct({ cat: catGym, sup: sup9, brand: bKingSport, name: 'Bình nước thể thao KingSport 750ml', desc: 'Bình nước thể thao KingSport 750ml, chất liệu nhựa Tritan không BPA, nắp chống tràn.', price: 120000 });
  allVariants.push(await createVariant(p20, { stock: 100, price: 120000, attrs: [{ key: attrColor, value: 'Trong suốt' }] }));
  allVariants.push(await createVariant(p20, { stock: 80, price: 120000, attrs: [{ key: attrColor, value: 'Xám' }] }));

  // --- P21: Balo chạy bộ Nike ---
  const p21 = await createProduct({ cat: catChayBo, sup: sup2, brand: bNike, name: 'Balo chạy bộ Nike Elemental', desc: 'Balo chạy bộ Nike Elemental 20L, thiết kế nhỏ gọn, ngăn đựng giày riêng.', price: 850000 });
  allVariants.push(await createVariant(p21, { stock: 30, price: 850000, attrs: [{ key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p21, { stock: 25, price: 850000, attrs: [{ key: attrColor, value: 'Xám' }] }));

  // --- P22: Giày chạy địa hình Adidas Terrex ---
  const p22 = await createProduct({ cat: catChayBo, sup: sup5, brand: bAdidas, name: 'Giày chạy địa hình Adidas Terrex Agravic', desc: 'Giày chạy địa hình Adidas Terrex Agravic với đế Continental™ chống trượt, phù hợp trail running.', price: 2890000 });
  allVariants.push(await createVariant(p22, { stock: 20, price: 2890000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Xanh rêu' }] }));
  allVariants.push(await createVariant(p22, { stock: 25, price: 2890000, attrs: [{ key: attrSize, value: '41' }, { key: attrColor, value: 'Xanh rêu' }] }));
  allVariants.push(await createVariant(p22, { stock: 20, price: 2890000, attrs: [{ key: attrSize, value: '42' }, { key: attrColor, value: 'Xanh rêu' }] }));
  allVariants.push(await createVariant(p22, { stock: 15, price: 2890000, attrs: [{ key: attrSize, value: '43' }, { key: attrColor, value: 'Xanh rêu' }] }));

  // --- P23: Banh tennis Wilson US Open ---
  const p23 = await createProduct({ cat: catTennis, sup: sup10, brand: bWilson, name: 'Banh tennis Wilson US Open 3 bóng', desc: 'Banh tennis Wilson US Open, bóng chính thức giải US Open, độ nảy chuẩn ITF.', price: 185000 });
  allVariants.push(await createVariant(p23, { stock: 60, price: 185000, attrs: [{ key: attrSize, value: 'Standard' }] }));

  // --- P24: Vợt tennis Babolat Pure Drive ---
  const p24 = await createProduct({ cat: catTennis, sup: sup7, brand: bWilson, name: 'Vợt tennis Babolat Pure Drive 2024', desc: 'Vợt tennis Babolat Pure Drive với công nghệ Cortex Pure Feel, uy lực và kiểm soát.', price: 5200000 });
  allVariants.push(await createVariant(p24, { stock: 10, price: 5200000, attrs: [{ key: attrWeight, value: '300' }] }));
  allVariants.push(await createVariant(p24, { stock: 10, price: 5400000, attrs: [{ key: attrWeight, value: '285' }] }));

  // --- P25: Bóng chuyền Mikasa ---
  const p25 = await createProduct({ cat: catTTDongDoi, sup: sup6, brand: bMizuno, name: 'Bóng chuyền Mikasa MVA300', desc: 'Bóng chuyền Mikasa MVA300 đạt chuẩn FIVB, chất liệu da tổng hợp cao cấp.', price: 650000 });
  allVariants.push(await createVariant(p25, { stock: 30, price: 650000, attrs: [{ key: attrSize, value: '5' }] }));

  // --- P26: Lưới cầu lông ---
  const p26 = await createProduct({ cat: catCauLong, sup: sup9, brand: bDecathlon, name: 'Lưới cầu lông Decathlon sợi nylon', desc: 'Lưới cầu lông Decathlon sợi nylon dày dặn, kích thước 6.1m x 0.76m, có viền bảo vệ.', price: 320000 });
  allVariants.push(await createVariant(p26, { stock: 25, price: 320000 }));

  // --- P27: Nón bảo hiểm xe đạp ---
  const p27 = await createProduct({ cat: catXeDap, sup: sup10, brand: bDecathlon, name: 'Nón bảo hiểm xe đạp Decathlon BTWIN 500', desc: 'Nón bảo hiểm xe đạp Decathlon BTWIN 500, trọng lượng nhẹ 280g, 14 lỗ thông gió.', price: 390000 });
  allVariants.push(await createVariant(p27, { stock: 30, price: 390000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p27, { stock: 25, price: 390000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Đen' }] }));
  allVariants.push(await createVariant(p27, { stock: 20, price: 390000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Trắng' }] }));

  const allProducts = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27];

  // ======================== 9. COUPONS ========================
  console.log('🎫 Tạo coupons...');
  await Promise.all([
    prisma.coupons.create({
      data: {
        code: 'WELCOME10', discount_value: 10, discount_type: 'PERCENTAGE', max_discount: 100000, min_order_value: 500000,
        start_date: new Date('2026-01-01'), end_date: new Date('2026-12-31'), usage_limit: 1000, usage_count: 50, is_active: true,
        Users: { connect: pickN(10, customers).map((u) => ({ id: u.id })) },
      },
    }),
    prisma.coupons.create({
      data: {
        code: 'GIAM50K', discount_value: 50000, discount_type: 'CASH', max_discount: 50000, min_order_value: 300000,
        start_date: new Date('2026-03-01'), end_date: new Date('2026-06-30'), usage_limit: 500, usage_count: 30, is_active: true,
        Users: { connect: pickN(8, customers).map((u) => ({ id: u.id })) },
      },
    }),
    prisma.coupons.create({
      data: {
        code: 'SPORT30', discount_value: 30, discount_type: 'PERCENTAGE', max_discount: 200000, min_order_value: 1000000,
        start_date: new Date('2026-04-01'), end_date: new Date('2026-07-31'), usage_limit: 200, usage_count: 15, is_active: true,
        Users: { connect: pickN(5, customers).map((u) => ({ id: u.id })) },
      },
    }),
    prisma.coupons.create({
      data: {
        code: 'FREESHIP', discount_value: 50000, discount_type: 'CASH', max_discount: 50000, min_order_value: 200000,
        start_date: new Date('2026-05-01'), end_date: new Date('2026-08-31'), usage_limit: 300, usage_count: 40, is_active: true,
        Users: { connect: pickN(12, customers).map((u) => ({ id: u.id })) },
      },
    }),
  ]);

  // ======================== 10. ORDERS (8000+) ========================
  console.log('📦 Tạo orders...');

  const ORDER_STATUSES = ['Processing', 'Shipping', 'Delivered', 'Cancelled'];
  const PAYMENT_METHODS = ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'CREDIT_CARD'];
  const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];
  const ORDER_BATCH_SIZE = 25;
  const NOW = Date.now();
  const orderPurchaseRecords = [];

  const pickWeightedVariant = () => {
    const r = Math.random();
    const cheap = allVariants.filter((v) => Number(v.price) < 800000);
    const medium = allVariants.filter((v) => Number(v.price) >= 800000 && Number(v.price) < 2500000);
    const expensive = allVariants.filter((v) => Number(v.price) >= 2500000);
    if (r < 0.75 && cheap.length > 0) return pick(cheap);
    if (r < 0.93 && medium.length > 0) return pick(medium);
    if (expensive.length > 0) return pick(expensive);
    return pick(allVariants);
  };

  const genOrderItems = () => {
    const numItems = 1 + Math.floor(Math.random() * 2);
    const selected = [];
    let total = 0;
    for (let i = 0; i < numItems; i++) {
      const variant = pickWeightedVariant();
      const qty = 1;
      const price = Number(variant.price);
      total += price * qty;
      const prod = allProducts.find((p) => p.id === variant.product_id);
      selected.push({ variant, product: prod, qty, price });
    }
    return { items: selected, total: Math.round(total) };
  };

  // Build order jobs
  const orderJobs = [];

  // Top spenders for specific time windows (20 each)
  for (let i = 0; i < 20 && i < customers.length; i++) {
    orderJobs.push({ customer: customers[i], items: genOrderItems(), createdAt: new Date(NOW - Math.random() * 7 * 86400000) });
  }
  for (let i = 20; i < 40 && i < customers.length; i++) {
    orderJobs.push({ customer: customers[i], items: genOrderItems(), createdAt: new Date(NOW - (8 + Math.random() * 22) * 86400000) });
  }
  for (let i = 40; i < 60 && i < customers.length; i++) {
    orderJobs.push({ customer: customers[i], items: genOrderItems(), createdAt: new Date(NOW - (31 + Math.random() * 59) * 86400000) });
  }

  // Thêm ~50 orders đặt hôm nay để 7d/30d/90d có data
  for (let i = 60; i < 100 && i < customers.length; i++) {
    const hoursAgo = Math.random() * 24;
    orderJobs.push({ customer: customers[i], items: genOrderItems(), createdAt: new Date(NOW - hoursAgo * 3600000) });
  }

  // Regular customers with weighted date distribution (40% last 90 days)
  const weightedDaysAgo = () => {
    const r = Math.random();
    if (r < 0.40) return Math.random() * 90;
    if (r < 0.65) return 90 + Math.random() * 90;
    if (r < 0.85) return 180 + Math.random() * 90;
    return 270 + Math.random() * 95;
  };

  for (let i = 100; i < customers.length; i++) {
    const tier = Math.random();
    let numOrders;
    if (tier < 0.70) continue;
    else if (tier < 0.90) numOrders = 1;
    else if (tier < 0.97) numOrders = 2;
    else numOrders = 3;

    for (let o = 0; o < numOrders; o++) {
      orderJobs.push({ customer: customers[i], items: genOrderItems(), createdAt: new Date(NOW - weightedDaysAgo() * 86400000) });
    }
  }

  console.log(`   Đang tạo ${orderJobs.length} orders...`);

  // Create orders in batches
  let createdCount = 0;
  for (let i = 0; i < orderJobs.length; i += ORDER_BATCH_SIZE) {
    const batch = orderJobs.slice(i, i + ORDER_BATCH_SIZE);

    const createdOrders = await Promise.all(
      batch.map((job) => {
        const status = pick(ORDER_STATUSES);
        const paymentMethod = pick(PAYMENT_METHODS);
        let paymentStatus = 'Pending';
        if (status === 'Delivered') paymentStatus = 'Paid';
        else if (status === 'Cancelled') paymentStatus = 'Refunded';
        else paymentStatus = pick(PAYMENT_STATUSES);

        const province = pick(PROVINCES);
        const district = pick(DISTRICTS);
        const ward = pick(WARDS);
        const shippingAddress = `${Math.floor(Math.random() * 500) + 1} ${pick(STREETS)}, ${ward}, ${district}, ${province}`;

        return prisma.orders.create({
          data: {
            total_amount: job.items.total,
            status,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            discount_amount: 0,
            final_amount: job.items.total,
            usersId: job.customer.id,
            user_email: job.customer.email,
            created_at: job.createdAt,
          },
        });
      }),
    );

    // Insert all items for this batch
    const allItemData = [];
    for (let j = 0; j < createdOrders.length; j++) {
      const order = createdOrders[j];
      const job = batch[j];
      for (const item of job.items.items) {
        allItemData.push({
          order_id: order.id,
          product_variant_id: item.variant.id,
          quantity: item.qty,
          price_at_purchase: item.price,
        });
        orderPurchaseRecords.push({
          userId: job.customer.id,
          orderId: order.id,
          productId: item.product?.id || item.variant.product_id,
          variantId: item.variant.id,
          quantity: item.qty,
        });
      }
    }
    await prisma.orderItems.createMany({ data: allItemData });

    createdCount += createdOrders.length;
    if ((i / ORDER_BATCH_SIZE + 1) % 20 === 0) {
      console.log(`   ... ${createdCount} orders created`);
    }
  }

  console.log(`   -> ${orderPurchaseRecords.length} order items records (${createdCount} orders)`);

  // ======================== 11. REVIEWS (3000+) ========================
  console.log('⭐ Tạo 3000+ reviews...');

  const reviewsToCreate = [];
  const recordsByUser = {};
  for (const record of orderPurchaseRecords) {
    if (!recordsByUser[record.userId]) recordsByUser[record.userId] = [];
    recordsByUser[record.userId].push(record);
  }

  const userWithOrders = Object.keys(recordsByUser);
  const reviewTarget = 3000;
  const ratingWeights = [5, 5, 5, 4, 4, 4, 4, 3, 3, 2, 1];

  for (const userId of userWithOrders) {
    if (reviewsToCreate.length >= reviewTarget) break;
    const records = recordsByUser[userId];
    const numReviews = Math.min(Math.floor(Math.random() * 4) + 1, records.length);
    const selected = pickN(numReviews, records);

    for (const record of selected) {
      const rating = pick(ratingWeights);
      const comment = pick(REVIEW_COMMENTS[rating]);
      reviewsToCreate.push({
        rating,
        comment,
        media_urls: Math.random() > 0.85 ? [`https://picsum.photos/seed/r${record.orderId}${record.productId}/400/400`] : [],
        is_hidden: Math.random() > 0.9,
        user_id: Number(userId),
        order_id: record.orderId,
        product_id: record.productId,
      });
      if (reviewsToCreate.length >= reviewTarget) break;
    }
  }

  // Batch insert reviews
  const REVIEW_BATCH = 100;
  for (let i = 0; i < reviewsToCreate.length; i += REVIEW_BATCH) {
    const batch = reviewsToCreate.slice(i, i + REVIEW_BATCH);
    await Promise.all(batch.map((r) => prisma.reviews.create({ data: r })));
  }

  console.log(`   -> ${reviewsToCreate.length} reviews created`);

  // ======================== 12. CARTS ========================
  console.log('🛒 Tạo carts...');
  const cartCustomers = pickN(100, customers);
  for (const customer of cartCustomers) {
    const cart = await prisma.carts.create({ data: { user_id: customer.id } });
    const cartVariants = pickN(Math.floor(Math.random() * 3) + 1, allVariants);
    for (const v of cartVariants) {
      await prisma.cartItems.create({
        data: { cart_id: cart.id, product_variant_id: v.id, quantity: Math.floor(Math.random() * 3) + 1 },
      });
    }
  }

  // ======================== 13. STOCK MOVEMENTS ========================
  console.log('📊 Tạo stock movements...');
  const stockMovements = [];
  for (const v of allVariants) {
    stockMovements.push({ variant_id: v.id, type: 'IN', quantity_change: v.stock, reason: 'Nhập hàng lần đầu', reference_id: null });
  }
  for (const record of orderPurchaseRecords) {
    stockMovements.push({
      variant_id: record.variantId,
      type: 'OUT',
      quantity_change: -record.quantity,
      reason: `Bán hàng - Đơn hàng #${record.orderId}`,
      reference_id: record.orderId,
    });
  }
  // Batch insert
  const smBatchSize = 200;
  for (let i = 0; i < stockMovements.length; i += smBatchSize) {
    await prisma.stockMovements.createMany({ data: stockMovements.slice(i, i + smBatchSize) });
  }

  // ======================== 14. PURCHASE ORDERS ========================
  console.log('📋 Tạo purchase orders...');
  const p1Vars = allVariants.filter((v) => v.product_id === p1.id);
  const p5Vars = allVariants.filter((v) => v.product_id === p5.id);
  const p2Vars = allVariants.filter((v) => v.product_id === p2.id);
  const p7Vars = allVariants.filter((v) => v.product_id === p7.id);

  const po1 = await prisma.purchaseOrders.create({
    data: {
      supplier_id: sup1.id, order_date: new Date('2026-06-01'), expected_delivery_date: new Date('2026-06-10'),
      status: 'RECEIVED', total_cost: 7750000,
    },
  });
  await prisma.purchaseOrderItems.createMany({
    data: [
      { purchase_order_id: po1.id, product_variant_id: p1Vars[0]?.id, quantity: 50, unit_cost_price: 1200000, quantity_received: 50 },
      { purchase_order_id: po1.id, product_variant_id: p5Vars[0]?.id, quantity: 50, unit_cost_price: 150000, quantity_received: 50 },
    ],
  });

  const po2 = await prisma.purchaseOrders.create({
    data: {
      supplier_id: sup2.id, order_date: new Date('2026-06-05'), expected_delivery_date: new Date('2026-06-15'),
      status: 'PENDING', total_cost: 16300000,
    },
  });
  await prisma.purchaseOrderItems.createMany({
    data: [
      { purchase_order_id: po2.id, product_variant_id: p2Vars[0]?.id, quantity: 10, unit_cost_price: 3800000, quantity_received: 0 },
      { purchase_order_id: po2.id, product_variant_id: p7Vars[0]?.id, quantity: 25, unit_cost_price: 2500000, quantity_received: 0 },
    ],
  });

  // ======================== 15. SYSTEM LOGS ========================
  console.log('📝 Tạo system logs...');
  const sampleOrder = await prisma.orders.findFirst();
  await prisma.systemLogs.createMany({
    data: [
      { user_id: userAdmin.id, action_type: 'CREATE', entity_type: 'Products', entity_id: p1.id, details: { name: 'Tạo sản phẩm Bóng đá Nike Flight' } },
      { user_id: userStaff.id, action_type: 'UPDATE', entity_type: 'Orders', entity_id: sampleOrder?.id || 1, details: { from: 'Processing', to: 'Delivered' } },
      { user_id: userAdmin.id, action_type: 'CREATE', entity_type: 'PurchaseOrders', entity_id: po1.id, details: { supplier: sup1.name, total: 7750000 } },
    ],
  });

  // ======================== KẾT THÚC ========================
  console.log('\n✅ Dữ liệu mẫu đã được tạo thành công!');
  console.log('─────────────────────────────────────');
  console.log(`📊 Tổng kết:`);
  console.log(`   - ${allPerms.length} permissions`);
  console.log(`   - 3 roles`);
  console.log(`   - ${customers.length + 3} users (${customers.length} customers + 3 admin/staff)`);
  console.log(`   - ${await prisma.userAddresses.count()} user addresses`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${suppliers.length} suppliers`);
  console.log(`   - ${brands.length} brands`);
  console.log(`   - 4 attribute keys`);
  console.log(`   - ${allProducts.length} sản phẩm với ${allVariants.length} variants`);
  console.log(`   - ${await prisma.orders.count()} orders`);
  console.log(`   - ${reviewsToCreate.length} reviews`);
  console.log(`   - ${await prisma.carts.count()} carts`);
  console.log(`   - Stock movements & purchase orders & system logs`);
  console.log('\n🔐 Mật khẩu tất cả tài khoản: MatKhau@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
