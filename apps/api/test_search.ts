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

  // 1. Verify HNSW index exists
  const indexes: any[] = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'memories' AND indexname = 'idx_memories_embedding'
  `);
  console.log('HNSW Index:', indexes);

  // 2. Perform a semantic search
  const queryText = "I prefer dark mode";
  console.log(`Generating embedding for search query: "${queryText}"`);
  
  // Hardcode a user_id that exists in the db
  const users: any[] = await prisma.$queryRawUnsafe(`SELECT DISTINCT user_id FROM memories LIMIT 1`);
  const userId = users[0]?.user_id || 'test-user-id';

  const vector = await ai.embed(userId, queryText);
  console.log(`Query embedding dimension: ${vector.length}`);

  const results: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity
    FROM memories
    ORDER BY embedding <=> $1::vector
    LIMIT 3
  `, `[${vector.join(',')}]`);

  console.log('Semantic Search Results:', results);

  process.exit(0);
}

main().catch(console.error);
