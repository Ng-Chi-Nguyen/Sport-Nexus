import { PrismaClient } from '@prisma/client';
import { ROLE_DEFAULT_PERMISSIONS } from '../src/config/rolePermissions.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Đang đồng bộ permissions cho từng role...');

  for (const [roleSlug, permissionSlugs] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
    const role = await prisma.roles.findUnique({ where: { slug: roleSlug } });
    if (!role) {
      console.log(`⏭️  Role "${roleSlug}" chưa tồn tại, bỏ qua.`);
      continue;
    }

    if (permissionSlugs.length === 0) {
      await prisma.roles.update({
        where: { id: role.id },
        data: { permissions: { set: [] } },
      });
      console.log(`✅ ${roleSlug}: xoá toàn bộ permissions (admin)`);
      continue;
    }

    const permissions = await prisma.permissions.findMany({
      where: { slug: { in: permissionSlugs } },
    });

    if (permissions.length === 0) {
      console.log(`⚠️  ${roleSlug}: không tìm thấy permission nào, bỏ qua.`);
      continue;
    }

    await prisma.roles.update({
      where: { id: role.id },
      data: { permissions: { set: permissions.map(p => ({ id: p.id })) } },
    });

    console.log(`✅ ${roleSlug}: đã gán ${permissions.length} permissions`);
  }

  console.log('🎉 Hoàn tất đồng bộ!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('❌ Lỗi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
