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
      avatar: 'https://picsum.photos/seed/avatar-admin/300/300',
      created_at: new Date('2025-01-01'),
    },
  });
  const userStaff = await prisma.users.create({
    data: {
      full_name: 'Trần Thị Nhân Viên', email: 'staff@gmail.com',
      phone_number: generatePhone(2), password: hashedPassword,
      is_verified: true, status: true, role_id: staffRole.id,
      avatar: 'https://picsum.photos/seed/avatar-staff/300/300',
      created_at: new Date('2025-01-01'),
    },
  });
  const userSuperAdmin = await prisma.users.create({
    data: {
      full_name: 'Nguyễn Chí Nguyên', email: 'ngchinguyen2506@gmail.com',
      phone_number: '0900000000', password: await bcrypt.hash('#Nguyen2506', 10),
      is_verified: true, status: true, role_id: adminRole.id,
      avatar: 'https://picsum.photos/seed/avatar-superadmin/300/300',
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
        avatar: `https://picsum.photos/seed/avatar-c${idx}/300/300`,
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
    catNames.map((name) => {
      const slug = slugify(name, { lower: true });
      return prisma.categories.create({
        data: { name, slug, image: `https://picsum.photos/seed/cat-${slug}/800/400` },
      });
    }),
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
  const brands = await Promise.all(
    brandInput.map((b) =>
      prisma.brands.create({
        data: { ...b, logo: `https://picsum.photos/seed/logo-${slugify(b.name, { lower: true })}/300/300` },
      }),
    ),
  );
  const [bNike, bAdidas, bYonex, bWilson, bKamito, bKingSport, bSpeedo, bSpalding, bPuma, bLiNing, bMizuno, bUA, bDecathlon, bAsics] = brands;

  // ======================== 7. ATTRIBUTE KEYS ========================
  console.log('🔑 Tạo attribute keys...');
  const attrSize = await prisma.attributeKeys.create({ data: { name: 'Kích thước', unit: 'cm' } });
  const attrColor = await prisma.attributeKeys.create({ data: { name: 'Màu sắc' } });
  const attrWeight = await prisma.attributeKeys.create({ data: { name: 'Trọng lượng', unit: 'g' } });
  const attrLength = await prisma.attributeKeys.create({ data: { name: 'Chiều dài', unit: 'm' } });

  // ======================== 8. PRODUCTS (200 = 20/category) ========================
  console.log('⚽ Tạo 200 products (20/category) & variants...');

  async function createProduct({ cat, sup, brand, name, desc, price, active = true, thumbnail }) {
    return prisma.products.create({
      data: {
        name,
        slug: slugify(name, { lower: true }),
        base_price: price,
        description: desc,
        is_active: active,
        thumbnail,
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
  const allProducts = [];

  const BRAND_MAP = {
    Nike: bNike, Adidas: bAdidas, Yonex: bYonex, Wilson: bWilson, Kamito: bKamito,
    KingSport: bKingSport, Speedo: bSpeedo, Spalding: bSpalding, Puma: bPuma,
    'Li-Ning': bLiNing, Mizuno: bMizuno, 'Under Armour': bUA, Decathlon: bDecathlon, Asics: bAsics,
  };
  const SUPS = [sup1, sup2, sup3, sup4, sup5, sup6, sup7, sup8, sup9, sup10];

  // a: [{k: attrKey, o: [options]}], c: colors for the 2nd product & variants
  const CATALOG = [
    {
      cat: catBongDa,
      templates: [
        { n: 'Bóng đá Nike Strike', b: 'Nike', p: [700000, 1600000], a: [{ k: attrSize, o: ['4', '5'] }], c: ['Trắng', 'Xanh', 'Đỏ'] },
        { n: 'Bóng đá Adidas Tiro', b: 'Adidas', p: [600000, 1400000], a: [{ k: attrSize, o: ['4', '5'] }], c: ['Trắng', 'Đen'] },
        { n: 'Giày đá bóng Nike Mercurial', b: 'Nike', p: [3200000, 5500000], a: [{ k: attrSize, o: ['40', '41', '42', '43', '44'] }, { k: attrColor, o: ['Xanh', 'Đen', 'Đỏ'] }], c: ['Xanh', 'Đỏ', 'Đen'] },
        { n: 'Giày đá bóng Adidas Predator', b: 'Adidas', p: [2900000, 4800000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Đen', 'Trắng'] }], c: ['Đen', 'Trắng'] },
        { n: 'Áo đấu bóng đá Puma', b: 'Puma', p: [450000, 850000], a: [{ k: attrSize, o: ['S', 'M', 'L', 'XL'] }, { k: attrColor, o: ['Đỏ', 'Xanh dương', 'Trắng'] }], c: ['Đỏ', 'Xanh dương', 'Trắng'] },
        { n: 'Áo đấu bóng đá Adidas', b: 'Adidas', p: [400000, 750000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xanh dương', 'Trắng', 'Đen'] }], c: ['Xanh dương', 'Trắng'] },
        { n: 'Găng tay thủ môn', b: 'Decathlon', p: [350000, 900000], a: [{ k: attrSize, o: ['7', '8', '9', '10'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh', 'Đỏ'] },
        { n: 'Tất bóng đá', b: 'Decathlon', p: [80000, 150000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
        { n: 'Ống đồng bảo vệ ống quyển', b: 'Decathlon', p: [150000, 280000], a: [{ k: attrSize, o: ['S', 'M', 'L'] }], c: ['Trắng', 'Đen'] },
        { n: 'Balo thể thao đựng giày', b: 'Nike', p: [400000, 900000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
      ],
    },
    {
      cat: catCauLong,
      templates: [
        { n: 'Vợt cầu lông Yonex Astrox', b: 'Yonex', p: [2800000, 5200000], a: [{ k: attrWeight, o: ['88 (4U)', '83 (5U)'] }], c: ['Đen', 'Xanh'] },
        { n: 'Vợt cầu lông Yonex Nanoray', b: 'Yonex', p: [2000000, 3600000], a: [{ k: attrWeight, o: ['85 (4U)', '80 (5U)'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Vợt cầu lông Li-Ning', b: 'Li-Ning', p: [1400000, 2600000], a: [{ k: attrWeight, o: ['85 (4U)', '80 (5U)'] }], c: ['Đỏ', 'Đen'] },
        { n: 'Vợt cầu lông Mizuno', b: 'Mizuno', p: [1600000, 3000000], a: [{ k: attrWeight, o: ['87 (4U)', '82 (5U)'] }], c: ['Xanh', 'Đen'] },
        { n: 'Quần short cầu lông Yonex', b: 'Yonex', p: [300000, 500000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Xanh navy'] }], c: ['Đen', 'Xanh navy'] },
        { n: 'Áo cầu lông Yonex', b: 'Yonex', p: [350000, 550000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Trắng', 'Xanh dương', 'Đen'] }], c: ['Trắng', 'Xanh dương'] },
        { n: 'Giày cầu lông Yonex', b: 'Yonex', p: [1500000, 2600000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Đen', 'Trắng'] }], c: ['Đen', 'Trắng'] },
        { n: 'Lưới cầu lông', b: 'Decathlon', p: [250000, 450000], a: [], c: ['Đen', 'Xanh'] },
        { n: 'Ống đựng vợt cầu lông', b: 'Decathlon', p: [200000, 350000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Cầu lông sân đấu', b: 'Yonex', p: [180000, 280000], a: [{ k: attrSize, o: ['10', '12'] }], c: ['Trắng'] },
      ],
    },
    {
      cat: catBoiLoi,
      templates: [
        { n: 'Kính bơi Speedo', b: 'Speedo', p: [400000, 900000], a: [{ k: attrColor, o: ['Xanh dương', 'Đen', 'Trong suốt'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Quần bơi nam Speedo', b: 'Speedo', p: [400000, 700000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xanh navy', 'Đen'] }], c: ['Xanh navy', 'Đen'] },
        { n: 'Áo bơi nữ Speedo', b: 'Speedo', p: [650000, 1100000], a: [{ k: attrSize, o: ['S', 'M', 'L'] }, { k: attrColor, o: ['Đen', 'Hồng', 'Xanh'] }], c: ['Đen', 'Hồng'] },
        { n: 'Mũ bơi Speedo', b: 'Speedo', p: [150000, 280000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Đen', 'Xanh', 'Hồng'] }], c: ['Đen', 'Xanh'] },
        { n: 'Phao bơi trẻ em', b: 'Decathlon', p: [120000, 250000], a: [{ k: attrColor, o: ['Cam', 'Xanh', 'Hồng'] }], c: ['Cam', 'Xanh'] },
        { n: 'Túi khô chống nước', b: 'Decathlon', p: [200000, 400000], a: [{ k: attrSize, o: ['10L', '20L'] }, { k: attrColor, o: ['Xám', 'Xanh'] }], c: ['Xám', 'Xanh'] },
        { n: 'Dép bơi chống trượt', b: 'Speedo', p: [200000, 350000], a: [{ k: attrSize, o: ['39', '40', '41', '42'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh'] },
        { n: 'Khăn lau khô nhanh', b: 'Decathlon', p: [150000, 280000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Xanh', 'Xám'] }], c: ['Xanh', 'Xám'] },
        { n: 'Kính bơi trẻ em', b: 'Decathlon', p: [250000, 400000], a: [{ k: attrColor, o: ['Xanh dương', 'Hồng'] }], c: ['Xanh dương', 'Hồng'] },
        { n: 'Bộ đồ bơi trẻ em', b: 'Decathlon', p: [300000, 500000], a: [{ k: attrSize, o: ['3T', '5T', '7T'] }, { k: attrColor, o: ['Xanh', 'Cam'] }], c: ['Xanh', 'Cam'] },
      ],
    },
    {
      cat: catGym,
      templates: [
        { n: 'Dây nhảy thể thao', b: 'Kamito', p: [150000, 300000], a: [{ k: attrColor, o: ['Đen', 'Xanh', 'Đỏ'] }], c: ['Đen', 'Xanh'] },
        { n: 'Tạ tay cao su', b: 'KingSport', p: [200000, 800000], a: [{ k: attrWeight, o: ['2000 (2kg)', '5000 (5kg)', '10000 (10kg)'] }], c: ['Đen', 'Xanh'] },
        { n: 'Thảm tập yoga', b: 'KingSport', p: [350000, 600000], a: [{ k: attrLength, o: ['173', '183'] }, { k: attrColor, o: ['Tím', 'Xanh', 'Hồng'] }], c: ['Tím', 'Xanh'] },
        { n: 'Dây kháng lực', b: 'Kamito', p: [200000, 350000], a: [{ k: attrColor, o: ['Xanh dương', 'Đen'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Bình nước thể thao', b: 'KingSport', p: [100000, 200000], a: [{ k: attrSize, o: ['500ml', '750ml', '1L'] }, { k: attrColor, o: ['Trong suốt', 'Xám'] }], c: ['Trong suốt', 'Xám'] },
        { n: 'Găng tay tập gym', b: 'Kamito', p: [150000, 300000], a: [{ k: attrSize, o: ['S', 'M', 'L'] }, { k: attrColor, o: ['Đen', 'Đỏ'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Đai lưng nâng tạ', b: 'Kamito', p: [250000, 500000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen'] }], c: ['Đen', 'Xám'] },
        { n: 'Bóng tập yoga', b: 'KingSport', p: [250000, 450000], a: [{ k: attrSize, o: ['55cm', '65cm'] }, { k: attrColor, o: ['Tím', 'Xanh'] }], c: ['Tím', 'Xanh'] },
        { n: 'Dây đàn hồi tập vai', b: 'Kamito', p: [120000, 220000], a: [{ k: attrColor, o: ['Đỏ', 'Xanh', 'Tím'] }], c: ['Đỏ', 'Xanh'] },
        { n: 'Thảm tập gym', b: 'KingSport', p: [300000, 500000], a: [{ k: attrLength, o: ['180'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh'] },
      ],
    },
    {
      cat: catChayBo,
      templates: [
        { n: 'Giày chạy bộ Nike Air Zoom', b: 'Nike', p: [2800000, 4200000], a: [{ k: attrSize, o: ['39', '40', '41', '42', '43'] }, { k: attrColor, o: ['Đen', 'Trắng'] }], c: ['Đen', 'Trắng'] },
        { n: 'Giày chạy địa hình Adidas Terrex', b: 'Adidas', p: [2400000, 3800000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Xanh rêu', 'Đen'] }], c: ['Xanh rêu', 'Đen'] },
        { n: 'Giày chạy bộ Asics Gel', b: 'Asics', p: [2200000, 3600000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Xanh dương', 'Đen'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Áo thun chạy bộ', b: 'Adidas', p: [400000, 700000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xanh dương', 'Đen', 'Trắng'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Quần short chạy bộ', b: 'Nike', p: [350000, 600000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Balo chạy bộ', b: 'Nike', p: [700000, 1200000], a: [{ k: attrSize, o: ['20L'] }, { k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Tất chạy bộ', b: 'Asics', p: [120000, 200000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
        { n: 'Áo gió chạy bộ', b: 'Under Armour', p: [900000, 1500000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh'] },
        { n: 'Đai chạy bộ đựng điện thoại', b: 'Decathlon', p: [150000, 250000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Áo chống nắng chạy bộ', b: 'Mizuno', p: [400000, 650000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Trắng', 'Xanh'] }], c: ['Trắng', 'Xanh'] },
      ],
    },
    {
      cat: catTennis,
      templates: [
        { n: 'Vợt tennis Wilson Ultra', b: 'Wilson', p: [3000000, 4500000], a: [{ k: attrWeight, o: ['300 (G2)', '290 (G3)'] }], c: ['Đen', 'Trắng'] },
        { n: 'Vợt tennis Babolat Pure Drive', b: 'Wilson', p: [4200000, 5800000], a: [{ k: attrWeight, o: ['300', '285'] }], c: ['Đen', 'Xanh'] },
        { n: 'Vợt tennis Yonex Ezone', b: 'Yonex', p: [3500000, 5000000], a: [{ k: attrWeight, o: ['300 (G2)', '295 (G3)'] }], c: ['Xanh', 'Đen'] },
        { n: 'Banh tennis Wilson US Open', b: 'Wilson', p: [150000, 220000], a: [{ k: attrSize, o: ['Standard'] }], c: ['Vàng'] },
        { n: 'Băng quấn cán vợt', b: 'Wilson', p: [50000, 100000], a: [{ k: attrColor, o: ['Trắng', 'Đen', 'Xanh'] }], c: ['Trắng', 'Đen'] },
        { n: 'Áo tennis', b: 'Adidas', p: [450000, 750000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Trắng', 'Xanh dương'] }], c: ['Trắng', 'Xanh dương'] },
        { n: 'Quần tennis', b: 'Adidas', p: [400000, 650000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
        { n: 'Giày tennis', b: 'Asics', p: [1800000, 3000000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Trắng', 'Xanh'] }], c: ['Trắng', 'Xanh'] },
        { n: 'Balo vợt tennis', b: 'Wilson', p: [600000, 1000000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Grip cán vợt cao cấp', b: 'Yonex', p: [80000, 150000], a: [{ k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
      ],
    },
    {
      cat: catTTDongDoi,
      templates: [
        { n: 'Bóng rổ Spalding NBA', b: 'Spalding', p: [700000, 1200000], a: [{ k: attrSize, o: ['6', '7'] }], c: ['Cam', 'Xanh'] },
        { n: 'Bóng chuyền Mikasa', b: 'Mizuno', p: [450000, 800000], a: [{ k: attrSize, o: ['5'] }], c: ['Trắng-Xanh', 'Vàng-Xanh'] },
        { n: 'Bóng bầu dục', b: 'Wilson', p: [500000, 900000], a: [{ k: attrSize, o: ['5'] }], c: ['Nâu', 'Đen'] },
        { n: 'Bóng bóng chày', b: 'Wilson', p: [200000, 400000], a: [{ k: attrColor, o: ['Trắng', 'Đỏ'] }], c: ['Trắng', 'Đỏ'] },
        { n: 'Áo đấu bóng rổ', b: 'Nike', p: [450000, 800000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Đỏ', 'Trắng'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Quần bóng rổ', b: 'Adidas', p: [350000, 650000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Găng tay bắt bóng', b: 'Decathlon', p: [250000, 450000], a: [{ k: attrSize, o: ['M', 'L'] }], c: ['Nâu', 'Đen'] },
        { n: 'Bóng đá mini', b: 'Adidas', p: [200000, 350000], a: [{ k: attrSize, o: ['3', '4'] }], c: ['Trắng', 'Xanh'] },
        { n: 'Cầu môn mini tập luyện', b: 'Decathlon', p: [800000, 1500000], a: [], c: ['Trắng-Đỏ'] },
        { n: 'Đế cọc gôn tập luyện', b: 'Decathlon', p: [300000, 600000], a: [], c: ['Đen'] },
      ],
    },
    {
      cat: catXeDap,
      templates: [
        { n: 'Xe đạp địa hình', b: 'Decathlon', p: [5000000, 12000000], a: [{ k: attrSize, o: ['26"', '27.5"', '29"'] }, { k: attrColor, o: ['Đen', 'Xanh', 'Đỏ'] }], c: ['Đen', 'Xanh'] },
        { n: 'Xe đạp đua', b: 'Decathlon', p: [12000000, 25000000], a: [{ k: attrSize, o: ['52cm', '54cm', '56cm'] }, { k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
        { n: 'Xe đạp thành phố', b: 'Decathlon', p: [3000000, 6000000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Xám', 'Xanh'] }], c: ['Xám', 'Xanh'] },
        { n: 'Nón bảo hiểm xe đạp', b: 'Decathlon', p: [350000, 700000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Đen', 'Trắng', 'Xanh'] }], c: ['Đen', 'Trắng'] },
        { n: 'Đèn xe đạp', b: 'Decathlon', p: [150000, 350000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Khóa xe đạp', b: 'Decathlon', p: [150000, 300000], a: [{ k: attrLength, o: ['60', '100'] }], c: ['Đen'] },
        { n: 'Găng tay đạp xe', b: 'Decathlon', p: [150000, 280000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Đỏ'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Áo đạp xe', b: 'Decathlon', p: [400000, 700000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xanh dương', 'Đen', 'Đỏ'] }], c: ['Xanh dương', 'Đen'] },
        { n: 'Bình nước gắn xe đạp', b: 'Decathlon', p: [80000, 150000], a: [{ k: attrColor, o: ['Trong suốt', 'Xanh'] }], c: ['Trong suốt', 'Xanh'] },
        { n: 'Yên xe đạp', b: 'Decathlon', p: [300000, 600000], a: [{ k: attrColor, o: ['Đen', 'Nâu'] }], c: ['Đen', 'Nâu'] },
      ],
    },
    {
      cat: catLeoNui,
      templates: [
        { n: 'Giày leo núi', b: 'Decathlon', p: [1500000, 3000000], a: [{ k: attrSize, o: ['40', '41', '42', '43'] }, { k: attrColor, o: ['Xanh rêu', 'Đen'] }], c: ['Xanh rêu', 'Đen'] },
        { n: 'Áo khoác chống gió', b: 'Under Armour', p: [1200000, 2200000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Xanh', 'Đỏ'] }], c: ['Đen', 'Xanh'] },
        { n: 'Balo leo núi 40L', b: 'Decathlon', p: [800000, 1600000], a: [{ k: attrSize, o: ['40L', '55L'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh'] },
        { n: 'Đèn đội đầu', b: 'Decathlon', p: [250000, 500000], a: [{ k: attrColor, o: ['Đen', 'Xám'] }], c: ['Đen', 'Xám'] },
        { n: 'Gậy leo núi', b: 'Decathlon', p: [400000, 800000], a: [{ k: attrLength, o: ['110', '135'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Áo mưa chống nước', b: 'Decathlon', p: [300000, 600000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xanh', 'Cam'] }], c: ['Xanh', 'Cam'] },
        { n: 'Bình đựng nước leo núi', b: 'Decathlon', p: [200000, 400000], a: [{ k: attrSize, o: ['500ml', '1L'] }, { k: attrColor, o: ['Xanh', 'Xám'] }], c: ['Xanh', 'Xám'] },
        { n: 'Tất leo núi', b: 'Decathlon', p: [150000, 250000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Đen', 'Xanh'] }], c: ['Đen', 'Xanh'] },
        { n: 'Quần trekking', b: 'Decathlon', p: [500000, 900000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Xám', 'Xanh rêu'] }], c: ['Xám', 'Xanh rêu'] },
        { n: 'Dây thừng leo núi', b: 'Decathlon', p: [900000, 1500000], a: [{ k: attrLength, o: ['30', '50', '60'] }], c: ['Đỏ', 'Xanh'] },
      ],
    },
    {
      cat: catVoThuat,
      templates: [
        { n: 'Găng tay đấm bốc', b: 'Kamito', p: [500000, 1100000], a: [{ k: attrWeight, o: ['8oz', '10oz', '12oz', '14oz'] }, { k: attrColor, o: ['Đỏ', 'Đen', 'Xanh'] }], c: ['Đỏ', 'Đen'] },
        { n: 'Đồ bảo hộ đấm bốc', b: 'Kamito', p: [900000, 1600000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Đỏ'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Bao cát đấm bốc', b: 'KingSport', p: [1200000, 2200000], a: [{ k: attrWeight, o: ['30kg', '40kg', '50kg'] }, { k: attrColor, o: ['Đen', 'Đỏ'] }], c: ['Đen', 'Đỏ'] },
        { n: 'Võ phục Taekwondo', b: 'Kamito', p: [400000, 800000], a: [{ k: attrSize, o: ['160', '170', '180'] }, { k: attrColor, o: ['Trắng', 'Đen'] }], c: ['Trắng', 'Đen'] },
        { n: 'Đai võ thuật', b: 'Kamito', p: [80000, 150000], a: [{ k: attrSize, o: ['180', '200', '220'] }, { k: attrColor, o: ['Trắng', 'Xanh', 'Đen'] }], c: ['Trắng', 'Xanh'] },
        { n: 'Đệm chống chân', b: 'KingSport', p: [250000, 450000], a: [{ k: attrSize, o: ['M', 'L'] }, { k: attrColor, o: ['Đen', 'Trắng'] }], c: ['Đen', 'Trắng'] },
        { n: 'Áo võ thuật Karate', b: 'Kamito', p: [450000, 850000], a: [{ k: attrSize, o: ['150', '160', '170', '180'] }, { k: attrColor, o: ['Trắng'] }], c: ['Trắng'] },
        { n: 'Găng tay boxing trẻ em', b: 'Kamito', p: [300000, 550000], a: [{ k: attrSize, o: ['4oz', '6oz'] }, { k: attrColor, o: ['Đỏ', 'Xanh', 'Hồng'] }], c: ['Đỏ', 'Xanh'] },
        { n: 'Bọc tay quấn', b: 'Kamito', p: [80000, 150000], a: [{ k: attrColor, o: ['Đen', 'Trắng', 'Đỏ'] }], c: ['Đen', 'Trắng'] },
        { n: 'Áo thun tập võ', b: 'Kamito', p: [200000, 350000], a: [{ k: attrSize, o: ['M', 'L', 'XL'] }, { k: attrColor, o: ['Đen', 'Trắng'] }], c: ['Đen', 'Trắng'] },
      ],
    },
  ];

  for (const grp of CATALOG) {
    for (const tpl of grp.templates) {
      for (let k = 0; k < 2; k++) {
        const color = tpl.c[k % tpl.c.length];
        const name = k === 0 ? tpl.n : `${tpl.n} ${color}`;
        const slugBase = slugify(name, { lower: true });
        const basePrice = Math.round((tpl.p[0] + Math.random() * (tpl.p[1] - tpl.p[0])) / 1000) * 1000;
        const brand = BRAND_MAP[tpl.b] || pick(grp.brands);
        const sup = pick(SUPS);
        const product = await createProduct({
          cat: grp.cat,
          sup,
          brand,
          name,
          desc: `${name} - sản phẩm thể thao chất lượng cao, phù hợp tập luyện và thi đấu.`,
          price: basePrice,
          thumbnail: `https://picsum.photos/seed/${slugBase}/600/600`,
        });
        allProducts.push(product);

        await prisma.productImages.createMany({
          data: Array.from({ length: 4 }, (_, i) => ({
            product_id: product.id,
            url: `https://picsum.photos/seed/${slugBase}-${i + 1}/600/600`,
            is_primary: i === 0,
          })),
        });

        const varCount = 1 + Math.floor(Math.random() * 3);
        for (let vi = 0; vi < varCount; vi++) {
          const attrs = [];
          for (const spec of tpl.a) {
            attrs.push({ key: spec.k, value: spec.o[Math.floor(Math.random() * spec.o.length)] });
          }
          const price = vi === 0 ? basePrice : Math.round((basePrice * (1 + Math.random() * 0.15)) / 1000) * 1000;
          allVariants.push(await createVariant(product, {
            stock: 15 + Math.floor(Math.random() * 105),
            price,
            attrs,
          }));
        }
      }
    }
  }

  // Rải created_at cho sản phẩm trong 12 tháng
  const productStartTs = new Date('2025-08-01').getTime();
  const productEndTs = new Date('2026-07-28').getTime();
  for (const p of allProducts) {
    const randomTime = productStartTs + Math.random() * (productEndTs - productStartTs);
    await prisma.products.update({ where: { id: p.id }, data: { created_at: new Date(randomTime) } });
  }

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
  const p1Vars = allVariants.filter((v) => v.product_id === allProducts[0].id);
  const p5Vars = allVariants.filter((v) => v.product_id === allProducts[1].id);
  const p2Vars = allVariants.filter((v) => v.product_id === allProducts[2].id);
  const p7Vars = allVariants.filter((v) => v.product_id === allProducts[3].id);

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
      { user_id: userAdmin.id, action_type: 'CREATE', entity_type: 'Products', entity_id: allProducts[0].id, details: { name: 'Tạo sản phẩm thể thao' } },
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
  console.log(`   - ${await prisma.productImages.count()} product images`);
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
