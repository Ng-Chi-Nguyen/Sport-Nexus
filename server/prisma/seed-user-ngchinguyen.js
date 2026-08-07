import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'ngchinguyen2506@gmail.com';

const ADDRESS_TYPES = ['NHÀ', 'VĂN PHÒNG', 'KHO', 'CỬA HÀNG'];

const ADDRESSES = [
  {
    recipient_name: 'Nguyễn Chí Nguyên',
    recipient_phone: '0900000000',
    location_data: { province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé' },
    detail_address: '123 Nguyễn Huệ, Phường Bến Nghé',
    is_default: true,
    type: 'NHÀ',
  },
  {
    recipient_name: 'Nguyễn Chí Nguyên',
    recipient_phone: '0900000000',
    location_data: { province: 'Hà Nội', district: 'Cầu Giấy', ward: 'Phường Dịch Vọng' },
    detail_address: '45 Trần Duy Hưng, Phường Dịch Vọng',
    is_default: false,
    type: 'VĂN PHÒNG',
  },
  {
    recipient_name: 'Nguyễn Chí Nguyên',
    recipient_phone: '0900000000',
    location_data: { province: 'Đà Nẵng', district: 'Hải Châu', ward: 'Phường Hải Châu I' },
    detail_address: '78 Bạch Đằng, Phường Hải Châu I',
    is_default: false,
    type: 'KHO',
  },
  {
    recipient_name: 'Nguyễn Chí Nguyên',
    recipient_phone: '0900000000',
    location_data: { province: 'Khánh Hòa', district: 'Nha Trang', ward: 'Phường Vinh Tân' },
    detail_address: '19 Lê Thánh Tôn, Phường Vinh Tân',
    is_default: false,
    type: 'CỬA HÀNG',
  },
];

// Đủ cả 5 trạng thái đơn hàng + trải đều các phương thức thanh toán
const ORDER_SPECS = [
  { status: 'Processing', payment_method: 'COD', payment_status: 'Pending', daysAgo: 0 },
  { status: 'Processing', payment_method: 'BANK_TRANSFER', payment_status: 'Pending', daysAgo: 1 },
  { status: 'Shipping', payment_method: 'MOMO', payment_status: 'Paid', daysAgo: 3 },
  { status: 'Shipping', payment_method: 'VNPAY', payment_status: 'Pending', daysAgo: 5 },
  { status: 'Delivered', payment_method: 'COD', payment_status: 'Paid', daysAgo: 10 },
  { status: 'Delivered', payment_method: 'CREDIT_CARD', payment_status: 'Paid', daysAgo: 17 },
  { status: 'Cancelled', payment_method: 'BANK_TRANSFER', payment_status: 'Refunded', daysAgo: 25 },
  { status: 'Cancelled', payment_method: 'VNPAY', payment_status: 'Failed', daysAgo: 32 },
  { status: 'Refunded', payment_method: 'MOMO', payment_status: 'Refunded', daysAgo: 40 },
  { status: 'Refunded', payment_method: 'CREDIT_CARD', payment_status: 'Refunded', daysAgo: 55 },
];

function genTransactionCode(orderId, method) {
  const prefix = method === 'COD' ? 'COD' : 'TXN';
  return `${prefix}${String(orderId).padStart(8, '0')}${Math.floor(Math.random() * 9000 + 1000)}`;
}

async function main() {
  const user = await prisma.users.findFirst({
    where: { email: TARGET_EMAIL, deleted_at: new Date('1000-01-01T00:00:00.000Z') },
  });
  if (!user) {
    console.error(`❌ Không tìm thấy tài khoản ${TARGET_EMAIL}.`);
    return;
  }

  const variants = await prisma.productVariants.findMany({
    where: { stock: { gt: 3 } },
    select: { id: true, price: true, product_id: true },
  });
  if (variants.length === 0) {
    console.error('❌ Không có product variant nào đủ hàng.');
    return;
  }

  // ── 1. ĐỊA CHỈ ────────────────────────────────────────────────
  const existingCount = await prisma.userAddresses.count({ where: { user_id: user.id } });
  if (existingCount === 0) {
    await prisma.userAddresses.createMany({
      data: ADDRESSES.map((a) => ({ ...a, user_id: user.id })),
    });
    console.log(`📍 Đã tạo ${ADDRESSES.length} địa chỉ cho ${TARGET_EMAIL}.`);
  } else {
    console.log(`📍 ${TARGET_EMAIL} đã có ${existingCount} địa chỉ, bỏ qua tạo mới.`);
  }

  // ── 2. ĐƠN HÀNG ───────────────────────────────────────────────
  const now = Date.now();
  let createdOrders = 0;

  for (const spec of ORDER_SPECS) {
    const numItems = 1 + Math.floor(Math.random() * 2);
    const selected = [];
    let total = 0;
    for (let i = 0; i < numItems; i++) {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const price = Number(variant.price);
      total += price;
      selected.push({ variant, price });
    }
    total = Math.round(total);

    const createdAt = new Date(now - spec.daysAgo * 86400000);

    const order = await prisma.orders.create({
      data: {
        total_amount: total,
        status: spec.status,
        shipping_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        payment_method: spec.payment_method,
        payment_status: spec.payment_status,
        discount_amount: 0,
        final_amount: total,
        usersId: user.id,
        user_email: user.email,
        created_at: createdAt,
      },
    });

    await prisma.orderItems.createMany({
      data: selected.map((s) => ({
        order_id: order.id,
        product_variant_id: s.variant.id,
        quantity: 1,
        price_at_purchase: s.price,
      })),
    });

    await prisma.paymentTransactions.create({
      data: {
        order_id: order.id,
        method: spec.payment_method,
        amount: total,
        status: spec.payment_status,
        provider_ref: spec.payment_method === 'COD' ? null : `REF${Date.now()}${Math.floor(Math.random() * 99999)}`,
        transaction_code: genTransactionCode(order.id, spec.payment_method),
        note: spec.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : `Thanh toán qua ${spec.payment_method}`,
        paid_at: spec.payment_status === 'Paid' ? createdAt : null,
        created_at: createdAt,
      },
    });

    createdOrders++;
    console.log(`   ✅ Đơn #${order.id} [${spec.status}/${spec.payment_status}] ${total.toLocaleString('vi-VN')}đ`);
  }

  console.log(`\n🎉 Hoàn tất! ${createdOrders} đơn hàng đủ trạng thái cho ${TARGET_EMAIL}.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
