import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOW = Date.now();
const DAY_MS = 86400000;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

async function main() {
  console.log('BAT DAU tao lai stock movements voi du lieu da dang...\n');

  // 1. Xoa stock movements cu
  console.log('Xoa stock movements cu...');
  await prisma.stockMovements.deleteMany();

  // 2. Lay variants + orders + order items
  const [variants, orders, orderItems] = await Promise.all([
    prisma.productVariants.findMany({ select: { id: true, stock: true, product_id: true, price: true } }),
    prisma.orders.findMany({ select: { id: true, created_at: true, status: true }, orderBy: { created_at: 'asc' } }),
    prisma.orderItems.findMany({ select: { order_id: true, product_variant_id: true, quantity: true } }),
  ]);

  console.log('   - ' + variants.length + ' variants');
  console.log('   - ' + orders.length + ' orders');

  const movements = [];

  // 3. Tao IN movements - rai deu 6 thang qua
  console.log('Tao IN movements (nhap kho)...');
  for (const v of variants) {
    const baseQty = Math.max(v.stock, Math.floor(Math.random() * 80) + 20);
    const splits = Math.floor(Math.random() * 3) + 1;
    let remaining = baseQty;
    for (let s = 0; s < splits; s++) {
      const qty = s === splits - 1 ? remaining : Math.floor(remaining * (0.2 + Math.random() * 0.4));
      remaining -= qty;
      const daysAgo = 1 + Math.random() * 179;
      movements.push({
        variant_id: v.id,
        type: 'IN',
        quantity_change: qty,
        reason: s === 0 ? 'Nhap hang lan dau' : 'Nhap bo sung',
        reference_id: null,
        created_at: new Date(NOW - daysAgo * DAY_MS),
      });
    }
  }

  // 4. Tao OUT movements tu don hang
  console.log('Tao OUT movements tu don hang...');
  const orderDateMap = {};
  for (const o of orders) orderDateMap[o.id] = o.created_at;

  for (const item of orderItems) {
    const orderDate = orderDateMap[item.order_id];
    if (!orderDate) continue;
    movements.push({
      variant_id: item.product_variant_id,
      type: 'OUT',
      quantity_change: -item.quantity,
      reason: 'Ban hang - Don hang #' + item.order_id,
      reference_id: item.order_id,
      created_at: orderDate,
    });
  }

  // 5. Tao ADJUSTMENT movements
  console.log('Tao ADJUSTMENT movements...');
  for (let i = 0; i < 30; i++) {
    const variant = pick(variants);
    const qtyChange = Math.floor(Math.random() * 31 - 15);
    if (qtyChange === 0) continue;
    const daysAgo = 1 + Math.random() * 89;
    movements.push({
      variant_id: variant.id,
      type: 'ADJUSTMENT',
      quantity_change: qtyChange,
      reason: qtyChange > 0 ? 'Kiem ke - thua kho' : 'Kiem ke - thieu kho',
      reference_id: null,
      created_at: new Date(NOW - daysAgo * DAY_MS),
    });
  }

  // 6. Them IN bo sung
  console.log('Tao IN bo sung...');
  for (let i = 0; i < 40; i++) {
    const variant = pick(variants);
    const qty = Math.floor(5 + Math.random() * 45);
    const daysAgo = 1 + Math.random() * 59;
    movements.push({
      variant_id: variant.id,
      type: 'IN',
      quantity_change: qty,
      reason: 'Nhap hang bo sung',
      reference_id: null,
      created_at: new Date(NOW - daysAgo * DAY_MS),
    });
  }

  // 7. Them OUT bo sung
  console.log('Tao OUT bo sung...');
  const reasons = ['Hang loi - tra supplier', 'Hang het han', 'Hang hong trong kho', 'Xuat mau trung bay'];
  for (let i = 0; i < 15; i++) {
    const variant = pick(variants);
    const qty = -Math.floor(1 + Math.random() * 10);
    const daysAgo = 1 + Math.random() * 44;
    movements.push({
      variant_id: variant.id,
      type: 'OUT',
      quantity_change: qty,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      reference_id: null,
      created_at: new Date(NOW - daysAgo * DAY_MS),
    });
  }

  // 8. Batch insert
  console.log('Dang insert ' + movements.length + ' movements...');
  for (let i = 0; i < movements.length; i += 500) {
    const batch = movements.slice(i, i + 500);
    await prisma.stockMovements.createMany({ data: batch });
  }

  // 9. Dong bo lai ton kho
  console.log('Dong bo lai ton kho variants...');
  for (const v of variants) {
    const agg = await prisma.stockMovements.aggregate({
      where: { variant_id: v.id },
      _sum: { quantity_change: true },
    });
    const netStock = agg._sum.quantity_change || 0;
    await prisma.productVariants.update({
      where: { id: v.id },
      data: { stock: Math.max(netStock, 0) },
    });
  }

  // 10. Thong ke
  const summary = await prisma.stockMovements.groupBy({
    by: ['type'],
    _count: { id: true },
    _sum: { quantity_change: true },
  });
  console.log('\nHOAN TAT! Thong ke movements:');
  for (const s of summary) {
    console.log('   ' + s.type + ': ' + s._count.id + ' lan, tong: ' + s._sum.quantity_change);
  }

  const dateRange = await prisma.stockMovements.aggregate({
    _min: { created_at: true },
    _max: { created_at: true },
  });
  console.log('   Khoang: ' + (dateRange._min.created_at?.toISOString().slice(0, 10) || 'N/A') + ' -> ' + (dateRange._max.created_at?.toISOString().slice(0, 10) || 'N/A'));
  console.log('   Tong: ' + movements.length + ' movements');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('LOI:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

