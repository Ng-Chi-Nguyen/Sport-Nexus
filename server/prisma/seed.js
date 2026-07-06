import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

const prisma = new PrismaClient();

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

  await prisma.attributeKeys.deleteMany();
  await prisma.brands.deleteMany();
  await prisma.suppliers.deleteMany();
  await prisma.categories.deleteMany();

  // ======================== 1. USERS ========================
  console.log('👤 Tạo users...');
  const hashedPassword = await bcrypt.hash('MatKhau@123', 10);

  const adminRole = await prisma.roles.findUnique({ where: { slug: 'admin' } });
  const staffRole = await prisma.roles.findUnique({ where: { slug: 'staff' } });
  const customerRole = await prisma.roles.findUnique({ where: { slug: 'customer' } });

  if (!adminRole || !staffRole || !customerRole) {
    throw new Error('Roles (admin, staff, customer) chưa được tạo. Vui lòng tạo roles trước.');
  }

  const usersInput = [
    { full_name: 'Nguyễn Văn Admin', email: 'admin@sportnexus.vn', phone: '0901000001', role_id: adminRole.id },
    { full_name: 'Trần Thị Nhân Viên', email: 'staff@sportnexus.vn', phone: '0901000002', role_id: staffRole.id },
    { full_name: 'Lê Văn An', email: 'lean@sportnexus.vn', phone: '0901000003', role_id: customerRole.id },
    { full_name: 'Phạm Thị Bình', email: 'binhpt@sportnexus.vn', phone: '0901000004', role_id: customerRole.id },
    { full_name: 'Hoàng Văn Cường', email: 'cuonghv@sportnexus.vn', phone: '0901000005', role_id: customerRole.id },
  ];
  const users = await Promise.all(
    usersInput.map((u) =>
      prisma.users.create({
        data: {
          full_name: u.full_name,
          email: u.email,
          phone_number: u.phone,
          password: hashedPassword,
          is_verified: true,
          role_id: u.role_id,
        },
      }),
    ),
  );

  const [admin, staff, customer1, customer2, customer3] = users;

  // ======================== 2. USER ADDRESSES ========================
  console.log('📍 Tạo user addresses...');
  await prisma.userAddresses.createMany({
    data: [
      {
        recipient_name: 'Lê Văn An',
        recipient_phone: '0901000003',
        location_data: { province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé' },
        detail_address: '123 Nguyễn Huệ, Phường Bến Nghé',
        is_default: true,
        type: 'NHÀ',
        user_id: customer1.id,
      },
      {
        recipient_name: 'Phạm Thị Bình',
        recipient_phone: '0901000004',
        location_data: { province: 'Hà Nội', district: 'Cầu Giấy', ward: 'Phường Dịch Vọng' },
        detail_address: '456 Xuân Thủy, Phường Dịch Vọng',
        is_default: true,
        type: 'NHÀ',
        user_id: customer2.id,
      },
      {
        recipient_name: 'Hoàng Văn Cường',
        recipient_phone: '0901000005',
        location_data: { province: 'Đà Nẵng', district: 'Hải Châu', ward: 'Phường Hải Châu I' },
        detail_address: '789 Lê Duẩn, Phường Hải Châu I',
        is_default: true,
        type: 'VĂN PHÒNG',
        user_id: customer3.id,
      },
    ],
  });

  // ======================== 3. CATEGORIES ========================
  console.log('📂 Tạo categories...');
  const catNames = ['Bóng đá', 'Cầu lông', 'Bơi lội', 'Gym & Fitness', 'Chạy bộ', 'Tennis', 'Thể thao đồng đội'];
  const categories = await Promise.all(
    catNames.map((name) =>
      prisma.categories.create({ data: { name, slug: slugify(name, { lower: true }) } }),
    ),
  );
  const [catBongDa, catCauLong, catBoiLoi, catGym, catChayBo, catTennis, catTTDongDoi] = categories;

  // ======================== 4. SUPPLIERS ========================
  console.log('🏭 Tạo suppliers...');
  const suppliers = await Promise.all([
    prisma.suppliers.create({
      data: {
        name: 'Công ty TNHH Thể thao Việt',
        contact_person: 'Nguyễn Văn Hùng',
        email: 'hung@thethaoviet.vn',
        phone: '02839281111',
        location_data: { province: 'TP. Hồ Chí Minh', district: 'Quận 1' },
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Công ty Cổ phần Sports World',
        contact_person: 'Trần Minh Tuấn',
        email: 'tuan@sportsworld.vn',
        phone: '02438222222',
        location_data: { province: 'Hà Nội', district: 'Cầu Giấy' },
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Công ty TNHH Dụng cụ thể thao Á Châu',
        contact_person: 'Lê Hoàng Nam',
        email: 'nam@asiasports.vn',
        phone: '02363883333',
        location_data: { province: 'Đà Nẵng', district: 'Hải Châu' },
      },
    }),
  ]);
  const [supplier1, supplier2, supplier3] = suppliers;

  // ======================== 5. BRANDS ========================
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
  ];
  const brands = await Promise.all(
    brandInput.map((b) => prisma.brands.create({ data: b })),
  );
  const [brandNike, brandAdidas, brandYonex, brandWilson, brandKamito, brandKingSport, brandSpeedo, brandSpalding] = brands;

  // ======================== 6. ATTRIBUTE KEYS ========================
  console.log('🔑 Tạo attribute keys...');
  const attrSize = await prisma.attributeKeys.create({ data: { name: 'Kích thước', unit: 'cm' } });
  const attrColor = await prisma.attributeKeys.create({ data: { name: 'Màu sắc' } });
  const attrWeight = await prisma.attributeKeys.create({ data: { name: 'Trọng lượng', unit: 'g' } });

  // ======================== 7. PRODUCTS ========================
  console.log('⚽ Tạo products & variants...');

  async function createProduct({ category, supplier, brand, name, desc, price, isActive = true }) {
    const product = await prisma.products.create({
      data: {
        name,
        slug: slugify(name, { lower: true }),
        base_price: price,
        description: desc,
        is_active: isActive,
        category_id: category.id,
        supplier_id: supplier.id,
        brand_id: brand.id,
      },
    });
    return product;
  }

  async function createVariant(product, { stock, price, attrs = [] }) {
    const variant = await prisma.productVariants.create({
      data: { product_id: product.id, stock, price },
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

  // --- 9a. Bóng đá Nike Flight ---
  const p1 = await createProduct({
    category: catBongDa, supplier: supplier1, brand: brandNike,
    name: 'Bóng đá Nike Flight',
    desc: 'Bóng đá cao cấp Nike Flight với công nghệ Aerowtrack giúp ổn định đường bay. Chất liệu da tổng hợp cao cấp, phù hợp thi đấu chuyên nghiệp.',
    price: 1550000,
  });
  const v1 = await createVariant(p1, { stock: 50, price: 1550000, attrs: [{ key: attrSize, value: '5' }] });

  // --- 9b. Vợt cầu lông Yonex Astrox 99 Pro ---
  const p2 = await createProduct({
    category: catCauLong, supplier: supplier2, brand: brandYonex,
    name: 'Vợt cầu lông Yonex Astrox 99 Pro',
    desc: 'Vợt cầu lông Yonex Astrox 99 Pro - đỉnh cao công nghệ dành cho lối đánh tấn công. Khung vợt Namd cao cấp, độ cứng siêu cao.',
    price: 4890000,
  });
  const v2a = await createVariant(p2, { stock: 20, price: 4890000, attrs: [{ key: attrWeight, value: '88 (4U)' }] });
  const v2b = await createVariant(p2, { stock: 15, price: 4990000, attrs: [{ key: attrWeight, value: '83 (5U)' }] });

  // --- 9c. Vợt cầu lông Yonex Nanoray 100 ---
  const p3 = await createProduct({
    category: catCauLong, supplier: supplier2, brand: brandYonex,
    name: 'Vợt cầu lông Yonex Nanoray 100',
    desc: 'Vợt cầu lông Yonex Nanoray 100 với công nghệ Nanometric giúp vung vợt nhanh hơn, phù hợp lối đánh nhanh và điều cầu.',
    price: 3290000,
  });
  const v3a = await createVariant(p3, { stock: 20, price: 3290000, attrs: [{ key: attrWeight, value: '85 (4U)' }] });
  const v3b = await createVariant(p3, { stock: 15, price: 3390000, attrs: [{ key: attrWeight, value: '80 (5U)' }] });

  // --- 9d. Kính bơi Speedo Vanquisher ---
  const p4 = await createProduct({
    category: catBoiLoi, supplier: supplier3, brand: brandSpeedo,
    name: 'Kính bơi Speedo Vanquisher',
    desc: 'Kính bơi Speedo Vanquisher với công nghệ chống sương mù, gọng kính ôm vừa mắt, dây đeo silicone êm ái. Phù hợp bơi lội chuyên nghiệp.',
    price: 690000,
  });
  const v4 = await createVariant(p4, { stock: 30, price: 690000, attrs: [{ key: attrColor, value: 'Xanh dương' }] });

  // --- 9e. Dây nhảy Kamito Pro ---
  const p5 = await createProduct({
    category: catGym, supplier: supplier1, brand: brandKamito,
    name: 'Dây nhảy Kamito Pro',
    desc: 'Dây nhảy thể thao Kamito Pro với tay cầm chống trượt, dây thép bọc nhựa bền bỉ, có thể điều chỉnh độ dài.',
    price: 199000,
  });
  const v5 = await createVariant(p5, { stock: 50, price: 199000, attrs: [{ key: attrColor, value: 'Đen' }] });

  // --- 9f. Tạ tay KingSport ---
  const p6 = await createProduct({
    category: catGym, supplier: supplier1, brand: brandKingSport,
    name: 'Tạ tay KingSport Cao su',
    desc: 'Tạ tay KingSport bọc cao su chống trơn trượt, không gây tiếng ồn khi tập, phù hợp gym tại nhà.',
    price: 249000,
  });
  const v6a = await createVariant(p6, { stock: 40, price: 249000, attrs: [{ key: attrWeight, value: '2000 (2kg)' }] });
  const v6b = await createVariant(p6, { stock: 30, price: 449000, attrs: [{ key: attrWeight, value: '5000 (5kg)' }] });
  const v6c = await createVariant(p6, { stock: 20, price: 749000, attrs: [{ key: attrWeight, value: '10000 (10kg)' }] });

  // --- 9g. Giày chạy bộ Nike Air Zoom Pegasus ---
  const p7 = await createProduct({
    category: catChayBo, supplier: supplier2, brand: brandNike,
    name: 'Giày chạy bộ Nike Air Zoom Pegasus',
    desc: 'Giày chạy bộ Nike Air Zoom Pegasus với đệm Zoom Air êm ái, upper lưới thoáng khí, phù hợp chạy bộ hàng ngày.',
    price: 3290000,
  });
  const v7a = await createVariant(p7, { stock: 25, price: 3290000, attrs: [{ key: attrSize, value: '39' }, { key: attrColor, value: 'Đen' }] });
  const v7b = await createVariant(p7, { stock: 30, price: 3290000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Đen' }] });
  const v7c = await createVariant(p7, { stock: 28, price: 3290000, attrs: [{ key: attrSize, value: '41' }, { key: attrColor, value: 'Đen' }] });
  const v7d = await createVariant(p7, { stock: 22, price: 3290000, attrs: [{ key: attrSize, value: '42' }, { key: attrColor, value: 'Đen' }] });
  const v7e = await createVariant(p7, { stock: 15, price: 3290000, attrs: [{ key: attrSize, value: '39' }, { key: attrColor, value: 'Trắng' }] });
  const v7f = await createVariant(p7, { stock: 20, price: 3290000, attrs: [{ key: attrSize, value: '40' }, { key: attrColor, value: 'Trắng' }] });

  // --- 9h. Áo thun chạy bộ Adidas Own The Run ---
  const p8 = await createProduct({
    category: catChayBo, supplier: supplier2, brand: brandAdidas,
    name: 'Áo thun chạy bộ Adidas Own The Run',
    desc: 'Áo thun chạy bộ Adidas Own The Run với chất liệu vải Climacool thấm hút mồ hôi, nhẹ và thoáng khí.',
    price: 590000,
  });
  const v8a = await createVariant(p8, { stock: 35, price: 590000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Xanh dương' }] });
  const v8b = await createVariant(p8, { stock: 40, price: 590000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Xanh dương' }] });
  const v8c = await createVariant(p8, { stock: 25, price: 590000, attrs: [{ key: attrSize, value: 'XL' }, { key: attrColor, value: 'Xanh dương' }] });
  const v8d = await createVariant(p8, { stock: 30, price: 590000, attrs: [{ key: attrSize, value: 'M' }, { key: attrColor, value: 'Đen' }] });
  const v8e = await createVariant(p8, { stock: 35, price: 590000, attrs: [{ key: attrSize, value: 'L' }, { key: attrColor, value: 'Đen' }] });

  // --- 9i. Vợt tennis Wilson Ultra 100 ---
  const p9 = await createProduct({
    category: catTennis, supplier: supplier3, brand: brandWilson,
    name: 'Vợt tennis Wilson Ultra 100',
    desc: 'Vợt tennis Wilson Ultra 100 với khung vợt siêu nhẹ, mặt vợt 100 inch², phù hợp người chơi ở mọi trình độ.',
    price: 3800000,
  });
  const v9a = await createVariant(p9, { stock: 15, price: 3800000, attrs: [{ key: attrWeight, value: '300 (G2)' }] });
  const v9b = await createVariant(p9, { stock: 12, price: 3950000, attrs: [{ key: attrWeight, value: '290 (G3)' }] });

  // --- 9j. Bóng rổ Spalding NBA ---
  const p10 = await createProduct({
    category: catTTDongDoi, supplier: supplier3, brand: brandSpalding,
    name: 'Bóng rổ Spalding NBA',
    desc: 'Bóng rổ chính thức giải NBA, chất liệu da tổng hợp cao cấp, đường vân chống trơn, bảo đảm độ nảy chuẩn.',
    price: 890000,
  });
  const v10 = await createVariant(p10, { stock: 35, price: 890000, attrs: [{ key: attrSize, value: '7' }] });

  // ======================== 8. COUPONS ========================
  console.log('🎫 Tạo coupons...');
  const coupons = await Promise.all([
    prisma.coupons.create({
      data: {
        code: 'WELCOME10',
        discount_value: 10,
        discount_type: 'PERCENTAGE',
        max_discount: 100000,
        min_order_value: 500000,
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        usage_limit: 1000,
        usage_count: 5,
        is_active: true,
        Users: { connect: [{ id: customer1.id }, { id: customer2.id }, { id: customer3.id }] },
      },
    }),
    prisma.coupons.create({
      data: {
        code: 'GIAM50K',
        discount_value: 50000,
        discount_type: 'CASH',
        max_discount: 50000,
        min_order_value: 300000,
        start_date: new Date('2026-03-01'),
        end_date: new Date('2026-06-30'),
        usage_limit: 500,
        usage_count: 12,
        is_active: true,
        Users: { connect: [{ id: customer1.id }, { id: customer2.id }] },
      },
    }),
    prisma.coupons.create({
      data: {
        code: 'SPORT30',
        discount_value: 30,
        discount_type: 'PERCENTAGE',
        max_discount: 200000,
        min_order_value: 1000000,
        start_date: new Date('2026-04-01'),
        end_date: new Date('2026-07-31'),
        usage_limit: 200,
        usage_count: 0,
        is_active: true,
        Users: { connect: [{ id: customer1.id }, { id: customer3.id }] },
      },
    }),
  ]);
  const [coupon1, coupon2, coupon3] = coupons;

  // ======================== 9. ORDERS ========================
  console.log('📦 Tạo orders...');

  const order1 = await prisma.orders.create({
    data: {
      total_amount: 1550000,
      status: 'Delivered',
      shipping_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      payment_method: 'COD',
      payment_status: 'Paid',
      discount_amount: 0,
      final_amount: 1550000,
      usersId: customer1.id,
      user_email: customer1.email,
    },
  });
  const oi1 = await prisma.orderItems.create({
    data: { order_id: order1.id, product_variant_id: v1.id, quantity: 1, price_at_purchase: 1550000 },
  });

  const order2 = await prisma.orders.create({
    data: {
      total_amount: 7890000,
      status: 'Shipping',
      shipping_address: '456 Xuân Thủy, Phường Dịch Vọng, Cầu Giấy, Hà Nội',
      payment_method: 'MOMO',
      payment_status: 'Paid',
      discount_amount: 0,
      final_amount: 7890000,
      usersId: customer2.id,
      user_email: customer2.email,
    },
  });
  const oi2a = await prisma.orderItems.create({
    data: { order_id: order2.id, product_variant_id: v2a.id, quantity: 1, price_at_purchase: 4890000 },
  });
  const oi2b = await prisma.orderItems.create({
    data: { order_id: order2.id, product_variant_id: v7b.id, quantity: 1, price_at_purchase: 3290000 },
  });

  const order3 = await prisma.orders.create({
    data: {
      total_amount: 1198000,
      status: 'Processing',
      shipping_address: '789 Lê Duẩn, Phường Hải Châu I, Hải Châu, Đà Nẵng',
      payment_method: 'VNPAY',
      payment_status: 'Pending',
      discount_amount: 119800,
      final_amount: 1078200,
      coupon_code: 'WELCOME10',
      usersId: customer3.id,
      user_email: customer3.email,
    },
  });
  const oi3a = await prisma.orderItems.create({
    data: { order_id: order3.id, product_variant_id: v5.id, quantity: 2, price_at_purchase: 199000 },
  });
  const oi3b = await prisma.orderItems.create({
    data: { order_id: order3.id, product_variant_id: v8a.id, quantity: 1, price_at_purchase: 590000 },
  });

  // ======================== 10. REVIEWS ========================
  console.log('⭐ Tạo reviews...');
  await Promise.all([
    prisma.reviews.create({
      data: {
        rating: 5,
        comment: 'Bóng đá chất lượng tốt, đúng hàng Nike chính hãng. Giao hàng nhanh, đóng gói cẩn thận.',
        media_urls: [],
        is_hidden: false,
        user_id: customer1.id,
        order_id: order1.id,
        product_id: p1.id,
      },
    }),
    prisma.reviews.create({
      data: {
        rating: 4,
        comment: 'Vợt đánh rất êm, lực đánh tốt. Nhưng hơi nặng so với người mới chơi.',
        media_urls: [],
        is_hidden: false,
        user_id: customer2.id,
        order_id: order2.id,
        product_id: p2.id,
      },
    }),
    prisma.reviews.create({
      data: {
        rating: 5,
        comment: 'Giày chạy êm, đế bám tốt. Đi size chuẩn, không bị rộng hay chật.',
        media_urls: [],
        is_hidden: false,
        user_id: customer2.id,
        order_id: order2.id,
        product_id: p7.id,
      },
    }),
  ]);

  // ======================== 11. CARTS ========================
  console.log('🛒 Tạo carts...');
  const cart1 = await prisma.carts.create({ data: { user_id: customer1.id } });
  await prisma.cartItems.create({ data: { cart_id: cart1.id, product_variant_id: v6a.id, quantity: 2 } });
  await prisma.cartItems.create({ data: { cart_id: cart1.id, product_variant_id: v8e.id, quantity: 1 } });

  const cart2 = await prisma.carts.create({ data: { user_id: customer2.id } });
  await prisma.cartItems.create({ data: { cart_id: cart2.id, product_variant_id: v4.id, quantity: 1 } });

  // ======================== 12. STOCK MOVEMENTS ========================
  console.log('📊 Tạo stock movements...');
  await prisma.stockMovements.createMany({
    data: [
      { variant_id: v1.id, type: 'IN', quantity_change: 50, reason: 'Nhập hàng lần đầu' },
      { variant_id: v2a.id, type: 'IN', quantity_change: 20, reason: 'Nhập hàng lần đầu' },
      { variant_id: v2b.id, type: 'IN', quantity_change: 15, reason: 'Nhập hàng lần đầu' },
      { variant_id: v1.id, type: 'OUT', quantity_change: -1, reason: 'Bán hàng - Đơn hàng #1', reference_id: order1.id },
      { variant_id: v2a.id, type: 'OUT', quantity_change: -1, reason: 'Bán hàng - Đơn hàng #2', reference_id: order2.id },
      { variant_id: v7b.id, type: 'OUT', quantity_change: -1, reason: 'Bán hàng - Đơn hàng #2', reference_id: order2.id },
      { variant_id: v5.id, type: 'OUT', quantity_change: -2, reason: 'Bán hàng - Đơn hàng #3', reference_id: order3.id },
      { variant_id: v8a.id, type: 'OUT', quantity_change: -1, reason: 'Bán hàng - Đơn hàng #3', reference_id: order3.id },
    ],
  });

  // ======================== 13. PURCHASE ORDERS ========================
  console.log('📋 Tạo purchase orders...');
  const po1 = await prisma.purchaseOrders.create({
    data: {
      supplier_id: supplier1.id,
      order_date: new Date('2026-06-01'),
      expected_delivery_date: new Date('2026-06-10'),
      status: 'RECEIVED',
      total_cost: 7750000,
    },
  });
  await prisma.purchaseOrderItems.createMany({
    data: [
      { purchase_order_id: po1.id, product_variant_id: v1.id, quantity: 50, unit_cost_price: 1200000, quantity_received: 50 },
      { purchase_order_id: po1.id, product_variant_id: v5.id, quantity: 50, unit_cost_price: 150000, quantity_received: 50 },
      { purchase_order_id: po1.id, product_variant_id: v6a.id, quantity: 40, unit_cost_price: 180000, quantity_received: 40 },
      { purchase_order_id: po1.id, product_variant_id: v6b.id, quantity: 30, unit_cost_price: 350000, quantity_received: 30 },
      { purchase_order_id: po1.id, product_variant_id: v6c.id, quantity: 20, unit_cost_price: 600000, quantity_received: 20 },
    ],
  });

  const po2 = await prisma.purchaseOrders.create({
    data: {
      supplier_id: supplier2.id,
      order_date: new Date('2026-06-05'),
      expected_delivery_date: new Date('2026-06-15'),
      status: 'PENDING',
      total_cost: 16300000,
    },
  });
  await prisma.purchaseOrderItems.createMany({
    data: [
      { purchase_order_id: po2.id, product_variant_id: v2a.id, quantity: 10, unit_cost_price: 3800000, quantity_received: 0 },
      { purchase_order_id: po2.id, product_variant_id: v2b.id, quantity: 10, unit_cost_price: 3900000, quantity_received: 0 },
      { purchase_order_id: po2.id, product_variant_id: v7a.id, quantity: 25, unit_cost_price: 2500000, quantity_received: 0 },
      { purchase_order_id: po2.id, product_variant_id: v7b.id, quantity: 30, unit_cost_price: 2500000, quantity_received: 0 },
    ],
  });

  // ======================== 14. SYSTEM LOGS ========================
  console.log('📝 Tạo system logs...');
  await prisma.systemLogs.createMany({
    data: [
      {
        user_id: admin.id,
        action_type: 'CREATE',
        entity_type: 'Products',
        entity_id: p1.id,
        details: { name: 'Tạo sản phẩm Bóng đá Nike Flight' },
      },
      {
        user_id: staff.id,
        action_type: 'UPDATE',
        entity_type: 'Orders',
        entity_id: order1.id,
        details: { from: 'Processing', to: 'Delivered' },
      },
      {
        user_id: admin.id,
        action_type: 'CREATE',
        entity_type: 'PurchaseOrders',
        entity_id: po1.id,
        details: { supplier: 'Công ty TNHH Thể thao Việt', total: 7750000 },
      },
    ],
  });

  // ======================== KẾT THÚC ========================
  console.log('\n✅ Dữ liệu mẫu đã được tạo thành công!');
  console.log('─────────────────────────────────────');
  console.log(`📊 Tổng kết:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${suppliers.length} suppliers`);
  console.log(`   - ${brands.length} brands`);
  console.log(`   - 3 attribute keys`);
  console.log(`   - 10 sản phẩm với variants & attributes`);
  console.log(`   - 3 coupons`);
  console.log(`   - 3 orders với order items`);
  console.log(`   - 3 reviews`);
  console.log(`   - 2 carts với cart items`);
  console.log(`   - Stock movements & purchase orders`);
  console.log(`   - System logs`);
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
