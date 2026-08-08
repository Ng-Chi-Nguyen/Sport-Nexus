import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const COLLECTIONS = [
  { name: 'Bộ sưu tập Bóng đá', category_key: 'bong-dja', description: 'Trang phục, giày và phụ kiện bóng đá chính hãng cho mọi cấp độ thi đấu.' },
  { name: 'Gym & Fitness Pro', category_key: 'gym-and-fitness', description: 'Bộ dụng cụ tập luyện thể hình, quần áo và phụ kiện hỗ trợ chuyên nghiệp.' },
  { name: 'Chạy bộ đường dài', category_key: 'chay-bo', description: 'Giày chạy, quần áo thoáng khí và phụ kiện cho người đam mê chạy bộ.' },
  { name: 'Tennis Premier', category_key: 'tennis', description: 'Vợt, bóng và trang phục tennis cao cấp dành cho người chơi mọi trình độ.' },
  { name: 'Cầu lông Championship', category_key: 'cau-long', description: 'Vợt cầu lông, giày và phụ kiện nhập khẩu chất lượng cao.' },
];

async function main() {
  const categories = await prisma.categories.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

  const data = COLLECTIONS.filter((c) => slugToId.has(c.category_key)).map((c) => {
    const category_id = slugToId.get(c.category_key);
    const slug = `${slugify(c.name, { lower: true, strict: true })}-${category_id}`;
    const seed = slugify(c.name, { lower: true, strict: true });
    return {
      name: c.name,
      slug,
      banner: `https://picsum.photos/seed/${seed}/1400/560`,
      description: c.description,
      category_id,
      is_active: true,
    };
  });

  const result = { count: 0 };
  for (const item of data) {
    const existing = await prisma.collections.findFirst({
      where: { slug: item.slug, deleted_at: new Date('1000-01-01T00:00:00.000Z') },
    });
    if (existing) {
      await prisma.collections.update({
        where: { id: existing.id },
        data: { banner: item.banner, description: item.description, is_active: item.is_active },
      });
    } else {
      await prisma.collections.create({ data: item });
    }
    result.count += 1;
  }
  console.log(`Đã tạo/cập nhật ${result.count}/${COLLECTIONS.length} collection.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
