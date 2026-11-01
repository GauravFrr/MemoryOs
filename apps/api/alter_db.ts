import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('Altering database column size...');
  await prisma.$executeRawUnsafe(`ALTER TABLE memories ALTER COLUMN embedding TYPE vector(3072);`);
  console.log('Database altered successfully!');
  process.exit(0);
}

main().catch(console.error);
