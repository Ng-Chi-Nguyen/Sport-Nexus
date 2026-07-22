import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const products = await prisma.Products.findMany({ take: 5, orderBy: { id: 'asc' }, select: { id: true, name: true, slug: true } });
// console.log(JSON.stringify(products, null, 2));
await prisma.$disconnect();
