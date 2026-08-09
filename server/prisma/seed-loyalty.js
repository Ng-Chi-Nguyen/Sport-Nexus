import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TIERS = [
  { name: 'Đồng', min_spent: 0, reward_rate: 0.01, discount_percent: 0, sort_order: 1 },
  { name: 'Bạc', min_spent: 1000000, reward_rate: 0.015, discount_percent: 2, sort_order: 2 },
  { name: 'Vàng', min_spent: 5000000, reward_rate: 0.02, discount_percent: 5, sort_order: 3 },
  { name: 'Kim cương', min_spent: 20000000, reward_rate: 0.03, discount_percent: 10, sort_order: 4 },
];

const SETTINGS = [
  { key: 'points_to_money_rate', value: '1000' },
];

async function main() {
  let created = 0;
  for (const tier of TIERS) {
    const existing = await prisma.membershipTiers.findFirst({ where: { name: tier.name } });
    if (existing) {
      await prisma.membershipTiers.update({
        where: { id: existing.id },
        data: {
          min_spent: tier.min_spent,
          reward_rate: tier.reward_rate,
          discount_percent: tier.discount_percent,
          sort_order: tier.sort_order,
          is_active: true,
        },
      });
    } else {
      await prisma.membershipTiers.create({ data: { ...tier, is_active: true } });
    }
    created += 1;
  }

  for (const s of SETTINGS) {
    const existing = await prisma.loyaltySettings.findUnique({ where: { key: s.key } });
    if (existing) {
      await prisma.loyaltySettings.update({ where: { key: s.key }, data: { value: s.value } });
    } else {
      await prisma.loyaltySettings.create({ data: { key: s.key, value: s.value } });
    }
  }

  console.log(`Đã tạo/cập nhật ${created}/${TIERS.length} hạng và ${SETTINGS.length} cấu hình.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
