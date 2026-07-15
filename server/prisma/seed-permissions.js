import { PrismaClient } from '@prisma/client';
import { allPermissions } from './data/permissions.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Xóa permissions cũ...');
  await prisma.permissions.deleteMany();

  console.log('🛡️  Tạo permissions mới...');
  await prisma.permissions.createMany({ data: allPermissions });

  const allPerms = await prisma.permissions.findMany();
  const adminRole = await prisma.roles.findUnique({ where: { slug: 'admin' } });
  const staffRole = await prisma.roles.findUnique({ where: { slug: 'staff' } });

  if (adminRole) {
    await prisma.roles.update({
      where: { id: adminRole.id },
      data: { permissions: { set: allPerms.map((p) => ({ id: p.id })) } },
    });
  }
  if (staffRole) {
    await prisma.roles.update({
      where: { id: staffRole.id },
      data: { permissions: { set: allPerms.map((p) => ({ id: p.id })) } },
    });
  }

  console.log(`✅ Đã tạo ${allPermissions.length} permissions.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
