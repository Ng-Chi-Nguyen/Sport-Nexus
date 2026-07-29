import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_ROLES = [
  { slug: 'warehouse_manager', name: 'Quản lý kho' },
  { slug: 'purchasing_staff', name: 'Nhân viên nhập hàng' },
  { slug: 'sales_staff', name: 'Nhân viên bán hàng' },
];

async function main() {
  console.log('🔍 Kiểm tra roles hiện tại...');
  const existingRoles = await prisma.roles.findMany();
  console.log('Roles hiện có:', existingRoles.map(r => `${r.slug} (${r.name})`));

  for (const role of NEW_ROLES) {
    const exists = existingRoles.find(r => r.slug === role.slug);
    if (!exists) {
      await prisma.roles.create({ data: role });
      console.log(`✅ Đã tạo role: ${role.slug} (${role.name})`);
    } else {
      console.log(`⏭️  Role đã tồn tại: ${role.slug}`);
    }
  }

  const allRoles = await prisma.roles.findMany();
  console.log('Roles sau khi cập nhật:', allRoles.map(r => `${r.slug} (${r.name})`));
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
