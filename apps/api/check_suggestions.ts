import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const suggestions = await prisma.memorySuggestion.findMany();
  console.log('Suggestions:', suggestions.map(s => ({ id: s.id, content: s.content, status: s.status, userId: s.userId })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
