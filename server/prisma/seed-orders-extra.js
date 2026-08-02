import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương', 'Khánh Hòa', 'Nghệ An', 'An Giang', 'Tiền Giang', 'Thừa Thiên Huế', 'Quảng Nam', 'Lâm Đồng', 'Bà Rịa - Vũng Tàu', 'Long An', 'Kiên Giang', 'Đắk Lắk', 'Bình Định', 'Quảng Ninh'];
const DISTRICTS = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'Quận Thủ Đức', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Ba Đình', 'Thanh Xuân', 'Hoàng Mai', 'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Ninh Kiều', 'Hồng Bàng', 'Lê Chân', 'Nha Trang', 'Vinh', 'Biên Hòa', 'Buôn Ma Thuột', 'Huế', 'Đà Lạt', 'Vũng Tàu', 'Hội An', 'Hạ Long'];
const WARDS = ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Tân Định', 'Phường Nguyễn Thái Bình', 'Phường Dịch Vọng', 'Phường Trung Hòa', 'Phường Kim Liên', 'Phường Hải Châu I', 'Phường Hòa Thuận', 'Phường Mỹ An', 'Phường Ninh Kiều', 'Phường Cái Khế', 'Phường Vinh Tân', 'Phường Long Hoa', 'Phường 2', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 10'];
const STREETS = ['Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Trần Hưng Đạo', 'Lý Tự Trọng', 'Phạm Ngũ Lão', 'Nguyễn Đình Chiểu', 'Võ Thị Sáu', 'Cách Mạng Tháng 8', 'Lý Thường Kiệt', 'Nguyễn Trãi', 'Hoàng Diệu', 'Quang Trung', 'Lê Duẩn', 'Trường Chinh', 'Nguyễn Văn Cừ', 'Bạch Đằng', 'Hùng Vương', 'Phan Đình Phùng', 'Xô Viết Nghệ Tĩnh', 'Điện Biên Phủ', 'Nam Kỳ Khởi Nghĩa', 'Hoàng Hoa Thám', 'Tôn Đức Thắng', 'Trần Phú', 'Nguyễn Thị Minh Khai', 'Pasteur', 'Hàm Nghi', 'Nguyễn Văn Trỗi', 'Phạm Văn Đồng'];

const ORDER_STATUSES = ['Processing', 'Shipping', 'Delivered', 'Cancelled'];
const PAYMENT_METHODS = ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'CREDIT_CARD'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const BATCH_SIZE = 25;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomShippingAddress() {
  return `${Math.floor(Math.random() * 500) + 1} ${pick(STREETS)}, ${pick(WARDS)}, ${pick(DISTRICTS)}, ${pick(PROVINCES)}`;
}

async function main() {
  const COUNT = Number(process.argv[2] || 100);

  const users = await prisma.users.findMany({
    where: { role: { slug: 'customer' }, deleted_at: new Date('1000-01-01T00:00:00.000Z') },
    select: { id: true, email: true, full_name: true },
  });

  const variants = await prisma.productVariants.findMany({
    where: { stock: { gt: 3 } },
    select: { id: true, price: true, product_id: true },
  });

  if (users.length === 0) {
    console.log('❌ Không có user customer nào. Hãy chạy npm run seed trước.');
    return;
  }
  if (variants.length === 0) {
    console.log('❌ Không có product variant nào đủ hàng.');
    return;
  }

  const genItems = () => {
    const numItems = 1 + Math.floor(Math.random() * 2);
    const items = [];
    let total = 0;
    for (let i = 0; i < numItems; i++) {
      const variant = pick(variants);
      const qty = 1;
      const price = Number(variant.price);
      total += price * qty;
      items.push({ variant, qty, price });
    }
    return { items, total: Math.round(total) };
  };

  const jobs = [];
  for (let i = 0; i < COUNT; i++) {
    const customer = pick(users);
    const createdAt = new Date(Date.now() - Math.random() * 90 * 86400000);
    jobs.push({ customer, items: genItems(), createdAt });
  }

  console.log(`🌱 Đang tạo ${jobs.length} đơn hàng mới (chưa có hóa đơn)...`);

  let created = 0;
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    const createdOrders = await Promise.all(
      batch.map((job) => {
        const status = pick(ORDER_STATUSES);
        const paymentMethod = pick(PAYMENT_METHODS);
        let paymentStatus = 'Pending';
        if (status === 'Delivered') paymentStatus = 'Paid';
        else if (status === 'Cancelled') paymentStatus = 'Refunded';
        else paymentStatus = pick(PAYMENT_STATUSES);

        return prisma.orders.create({
          data: {
            total_amount: job.items.total,
            status,
            shipping_address: randomShippingAddress(),
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

    const allItemData = [];
    for (let j = 0; j < createdOrders.length; j++) {
      const order = createdOrders[j];
      for (const item of batch[j].items.items) {
        allItemData.push({
          order_id: order.id,
          product_variant_id: item.variant.id,
          quantity: item.qty,
          price_at_purchase: item.price,
        });
      }
    }
    await prisma.orderItems.createMany({ data: allItemData });

    created += createdOrders.length;
    console.log(`   ✅ Đã tạo ${created}/${jobs.length} đơn hàng`);
  }

  const noInvoice = await prisma.orders.count({
    where: { status: { not: 'Cancelled' }, invoice: { is: null } },
  });
  console.log(`\n🎉 Hoàn tất! Tổng đơn hàng chưa có hóa đơn (và chưa hủy): ${noInvoice}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
