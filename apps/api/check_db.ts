import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const suggestions = await prisma.memorySuggestion.findMany();
  console.log('Suggestions:', suggestions.length);
  if (suggestions.length > 0) {
    console.log(suggestions[0]);
  }

  const usage = await prisma.usageLog.findMany();
  console.log('Usage Logs:', usage.length);
  if (usage.length > 0) {
    console.log(usage[0]);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
