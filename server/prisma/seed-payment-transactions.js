import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BATCH_SIZE = 50;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genTransactionCode(orderId) {
  return `TXN${String(orderId).padStart(8, '0')}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function genProviderRef() {
  return `REF${Date.now()}${Math.floor(Math.random() * 99999)}`;
}

function statusToPaymentStatus(status) {
  if (status === 'Delivered') return 'Paid';
  if (status === 'Cancelled') return 'Refunded';
  return 'Pending';
}

async function main() {
  const LIMIT = Number(process.argv[2] || 1000);

  const orders = await prisma.orders.findMany({
    where: { PaymentTransactions: { none: {} } },
    select: {
      id: true,
      status: true,
      payment_method: true,
      payment_status: true,
      final_amount: true,
      created_at: true,
    },
    orderBy: { id: 'asc' },
    take: LIMIT,
  });

  if (orders.length === 0) {
    console.log('✅ Không có order nào cần tạo payment transaction.');
    return;
  }

  console.log(`🌱 Đang tạo payment_transactions cho ${orders.length} đơn hàng...`);

  let created = 0;
  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const batch = orders.slice(i, i + BATCH_SIZE);

    const data = batch.map((order) => {
      const paymentStatus = statusToPaymentStatus(order.status);
      const paidAt =
        order.payment_status === 'Paid' || paymentStatus === 'Paid'
          ? new Date(order.created_at.getTime() + Math.floor(Math.random() * 86400000))
          : null;

      return {
        order_id: order.id,
        method: order.payment_method,
        amount: order.final_amount,
        status: paymentStatus,
        provider_ref: order.payment_method === 'COD' ? null : genProviderRef(),
        transaction_code: genTransactionCode(order.id),
        note:
          order.payment_method === 'COD'
            ? 'Thanh toán khi nhận hàng'
            : `Thanh toán qua ${order.payment_method}`,
        paid_at: paidAt,
        created_at: order.created_at,
      };
    });

    await prisma.paymentTransactions.createMany({ data });

    created += batch.length;
    console.log(`   ✅ Đã tạo ${created}/${orders.length} bản ghi`);
  }

  console.log(`\n🎉 Hoàn tất! Đã tạo ${created} payment_transactions.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
