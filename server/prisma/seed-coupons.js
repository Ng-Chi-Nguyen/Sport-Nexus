import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const COUNT = Number(process.argv[2] || 100);

  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, 0, 1);
  const endDate = new Date(now.getFullYear() + 1, 11, 31);

  const data = Array.from({ length: COUNT }, (_, i) => {
    const discountValue = randomInt(1000, 1000000);

    return {
      code: `SEED${String(i + 1).padStart(4, '0')}`,
      discount_value: discountValue,
      discount_type: 'CASH',
      max_discount: discountValue,
      min_order_value: randomInt(0, 500000),
      start_date: startDate,
      end_date: endDate,
      usage_limit: randomInt(50, 1000),
      usage_count: 0,
      is_active: true,
      max_uses_per_user: 1,
    };
  });

  const result = await prisma.coupons.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Đã tạo ${result.count}/${COUNT} coupon.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
