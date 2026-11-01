import { AiService } from './src/ai/ai.service';
import { PrismaService } from './src/prisma/prisma.service';

async function main() {
  const prisma = new PrismaService();
  const ai = new AiService(prisma);
  const vector = await ai.embed('2fe48aa7-cf9f-4798-9ef7-24a605105a58', 'test memory content');
  console.log(`Vector dimension: ${vector.length}`);
  process.exit(0);
}

main().catch(console.error);
