import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REQUIRED_EMAIL = 'ngchinguyen2506@gmail.com';
const TARGET_COUNT = 100;
const MIN_POINTS = 100;
const MAX_POINTS = 1000;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  // 1. Tài khoản bắt buộc
  const requiredUser = await prisma.users.findFirst({
    where: {
      email: REQUIRED_EMAIL,
      deleted_at: new Date('1000-01-01T00:00:00.000Z'),
    },
  });
  if (!requiredUser) {
    console.error(`Không tìm thấy tài khoản: ${REQUIRED_EMAIL}`);
    process.exit(1);
  }

  // 2. Lấy thêm các tài khoản khác (còn hoạt động) cho tới đủ 100
  const extraUsers = await prisma.users.findMany({
    where: {
      deleted_at: new Date('1000-01-01T00:00:00.000Z'),
      email: { not: REQUIRED_EMAIL },
    },
    orderBy: { id: 'asc' },
    take: TARGET_COUNT,
  });

  const users = [requiredUser, ...extraUsers].slice(0, TARGET_COUNT);

  // 3. Cộng điểm ngẫu nhiên từng người trong transaction
  const results = await prisma.$transaction(async (tx) => {
    const applied = [];
    for (const user of users) {
      const points = randomInt(MIN_POINTS, MAX_POINTS);
      const newBalance = user.points_balance + points;
      await tx.users.update({
        where: { id: user.id },
        data: { points_balance: newBalance },
      });
      await tx.pointTransactions.create({
        data: {
          user_id: user.id,
          type: 'ADJUST',
          points,
          balance_after: newBalance,
          note: 'Cộng điểm test ngẫu nhiên (100–1000)',
        },
      });
      applied.push({ email: user.email, points, balance_after: newBalance });
    }
    return applied;
  });

  // 4. In kết quả
  console.log(`Đã cộng điểm cho ${results.length}/${TARGET_COUNT} tài khoản:`);
  for (const r of results) {
    console.log(`  +${r.points} điểm -> ${r.email} (số dư: ${r.balance_after})`);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
