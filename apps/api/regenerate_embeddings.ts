import { PrismaClient } from '@prisma/client';
import { AiService } from './src/ai/ai.service';
import { PrismaService } from './src/prisma/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const prisma = new PrismaClient();
  const prismaService = new PrismaService();
  const ai = new AiService(prismaService);

  console.log('Finding memories without embeddings...');
  // Since embedding is raw, we have to find them manually or just get all memories and update if embedding is null.
  // Wait, Prisma doesn't return raw vectors by default in findMany easily if it's Unsupported, but let's just get all memory IDs.
  const memories: any[] = await prisma.$queryRawUnsafe(`SELECT id, content, user_id FROM memories WHERE embedding IS NULL`);
  
  if (memories.length === 0) {
    console.log('No memories found that need embeddings.');
    process.exit(0);
  }

  console.log(`Found ${memories.length} memories to regenerate.`);
  
  for (const memory of memories) {
    console.log(`Generating embedding for memory ${memory.id}...`);
    try {
      const vector = await ai.embed(memory.user_id, memory.content);
      await prisma.$executeRawUnsafe(
        `UPDATE memories SET embedding = $1::vector WHERE id = $2::uuid`,
        `[${vector.join(',')}]`,
        memory.id
      );
      console.log(`Memory ${memory.id} updated with 768-dim vector!`);
    } catch (e) {
      console.error(`Failed to update memory ${memory.id}:`, e);
    }
  }

  console.log('Done!');
  process.exit(0);
}

main().catch(console.error);
