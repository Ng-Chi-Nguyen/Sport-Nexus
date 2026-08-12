import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'ngchinguyen2506@gmail.com';

const INVOICE_STATUS_BY_ORDER = {
  Delivered: 'Completed',
  Processing: 'Pending',
  Shipping: 'Pending',
  Refunded: 'Pending',
};

async function main() {
  const user = await prisma.users.findFirst({
    where: { email: TARGET_EMAIL, deleted_at: new Date('1000-01-01T00:00:00.000Z') },
  });
  if (!user) {
    console.error(`❌ Không tìm thấy tài khoản ${TARGET_EMAIL}.`);
    return;
  }

  const orders = await prisma.orders.findMany({
    where: { usersId: user.id, status: { not: 'Cancelled' } },
    include: { OrderItems: true },
    orderBy: { created_at: 'asc' },
  });

  if (orders.length === 0) {
    console.log(`ℹ️ ${TARGET_EMAIL} chưa có đơn hàng nào đủ điều kiện tạo hóa đơn.`);
    return;
  }

  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00Z`);
  const base = await prisma.invoices.count({
    where: { issued_at: { gte: start, lt: end } },
  });

  const vatRate = Number(process.env.VAT_RATE) || 0.08;

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    const existing = await prisma.invoices.findUnique({ where: { order_id: order.id } });
    if (existing) {
      skipped++;
      continue;
    }

    const subtotal = order.OrderItems.reduce(
      (sum, item) => sum + Number(item.price_at_purchase) * Number(item.quantity),
      0,
    );
    const discount = Number(order.discount_amount) || 0;
    const vatAmount = Math.round((subtotal - discount) * vatRate * 100) / 100;
    const totalAmount = Math.round((subtotal - discount + vatAmount) * 100) / 100;

    const seq = base + created + 1;
    const invoiceNumber = `HD-${year}-${String(seq).padStart(6, '0')}`;

    await prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        order_id: order.id,
        customer_name: user.full_name,
        customer_email: user.email,
        customer_phone: user.phone_number,
        shipping_address: order.shipping_address,
        subtotal: Math.round(subtotal * 100) / 100,
        discount_amount: discount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        status: INVOICE_STATUS_BY_ORDER[order.status] || 'Pending',
        issued_at: order.created_at,
        note: null,
      },
    });

    created++;
    console.log(
      `   ✅ Hóa đơn ${invoiceNumber} cho đơn #${order.id} [${order.status}] ${totalAmount.toLocaleString('vi-VN')}đ`,
    );
  }

  console.log(
    `\n🎉 Hoàn tất! ${created} hóa đơn tạo mới, ${skipped} đơn đã có hóa đơn cho ${TARGET_EMAIL}.`,
  );
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
